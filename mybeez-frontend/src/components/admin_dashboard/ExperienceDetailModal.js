import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, CheckCircle, XCircle } from '@phosphor-icons/react';

const DetailItem = ({ label, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
        <div className="text-gray-800 mt-1">{children}</div>
    </div>
);

/* ===================== helpers ===================== */

const toHHmm = (v) => (v ? String(v).slice(0, 5) : '');

const buildAddress = (loc) => {
    if (!loc) return '';
    if (typeof loc === 'string') return loc.trim();
    const parts = [loc.address, loc.postcode].filter(Boolean);
    return parts.join(' ');
};

const extractImages = (payload) => {
    const candidates = [payload?.imageUrls, payload?.images, payload?.experienceImages].find(Array.isArray);
    if (!candidates) return [];
    return candidates.map((i) => (typeof i === 'string' ? i : i?.url)).filter(Boolean);
};

const extractSessionTypes = (payload) => {
    if (Array.isArray(payload?.sessionTypes)) return payload.sessionTypes;
    if (payload?.sessionTypes && typeof payload.sessionTypes === 'object') return Object.keys(payload.sessionTypes);
    return [];
};

const normalizeAvailabilitySimple = (arr) =>
    (Array.isArray(arr) ? arr : []).map((slot, i) => ({
        id: slot.id ?? `${slot.date}-${slot.startTime}-${slot.endTime}-${i}`,
        date: slot.date,
        startTime: toHHmm(slot.startTime),
        endTime: toHHmm(slot.endTime),
        capacity: slot.capacity ?? slot.maxCapacity ?? slot.seats ?? null,
    }));

const getCategoryName = (cat, catName) => {
    if (typeof cat === 'string') return cat;
    if (cat && typeof cat === 'object' && cat.name) return cat.name;
    return catName || '-';
};

function normalizeExperience(payload) {
    if (!payload) return null;
    return {
        id: payload.id,
        title: payload.title ?? '-',
        description: payload.description ?? '',
        rating: payload.rating ?? null,

        groupPricePerPerson: payload.groupPricePerPerson ?? payload.groupPrice ?? null,
        privatePrice: payload.privatePrice ?? payload.privatePricePerSession ?? null,

        categoryName: getCategoryName(payload.category, payload.categoryName),
        address: buildAddress(payload.location),

        durationInMinutes:
            payload.durationInMinutes ??
            (typeof payload.duration === 'number' ? payload.duration * 60 : null),

        host: payload.host || null,
        images: extractImages(payload),
        sessionTypes: extractSessionTypes(payload),

        tags: Array.isArray(payload.tags)
            ? payload.tags.map((t) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
            : [],

        availability: normalizeAvailabilitySimple(payload.availability),
    };
}

/** Flatten `/api/availability/:id/{group|private}` responses into rows */
const flattenAvailabilityResponse = (data, type) => {
    if (!data) return [];
    let days = [];

    if (Array.isArray(data?.availableDates)) {
        days = data.availableDates;
    } else if (Array.isArray(data?.dates)) {
        days = data.dates;
    } else if (Array.isArray(data)) {
        days = data;
    } else if (Array.isArray(data?.slots)) {
        return data.slots.map((s, i) => ({
            key: `${type}-${s.availabilityId ?? i}`,
            type,
            date: s.date,
            startTime: toHHmm(s.startTime),
            endTime: toHHmm(s.endTime),
            spotsLeft: s.spotsLeft,
        }));
    }

    const rows =
        days?.flatMap((d) =>
            (d.slots || []).map((s) => ({
                ...s,
                date: d.date,
            }))
        ) || [];

    return rows.map((s, i) => ({
        key: `${type}-${s.availabilityId ?? i}`,
        type,
        date: s.date,
        startTime: toHHmm(s.startTime),
        endTime: toHHmm(s.endTime),
        spotsLeft: s.spotsLeft, // group feed only
    }));
};

const parseDT = (date, time) => {
    if (!date || !time) return new Date(0);
    const hhmm = toHHmm(time);
    return new Date(`${date}T${hhmm}:00`);
};

/* ===================== component ===================== */

const ExperienceDetailModal = ({ isOpen, onClose, experienceId, onApprove, onReject }) => {
    const [raw, setRaw] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [isSlotsLoading, setIsSlotsLoading] = useState(false);
    const [groupAvailability, setGroupAvailability] = useState(null);
    const [privateAvailability, setPrivateAvailability] = useState(null);

    const experience = normalizeExperience(raw);
    const images = experience?.images ?? [];

    // Load experience details
    useEffect(() => {
        if (!isOpen || !experienceId) return;

        let cancelled = false;
        const controller = new AbortController();

        (async () => {
            try {
                setIsLoading(true);
                setError(null);
                setRaw(null);
                setActiveImageIndex(0);

                const res = await axios.get(`/api/experiences/${experienceId}`, { signal: controller.signal });
                if (!cancelled) setRaw(res.data);
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to fetch experience details:', err);
                    setError('Could not load experience details. Please try again.');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [isOpen, experienceId]);

    // Load availability for GROUP & PRIVATE
    useEffect(() => {
        if (!isOpen || !experienceId) return;

        let cancelled = false;
        setIsSlotsLoading(true);

        Promise.all([
            axios.get(`/api/availability/${experienceId}/group`).catch(() => ({ data: null })),
            axios.get(`/api/availability/${experienceId}/private`).catch(() => ({ data: null })),
        ])
            .then(([g, p]) => {
                if (cancelled) return;
                setGroupAvailability(g.data);
                setPrivateAvailability(p.data);
            })
            .finally(() => !cancelled && setIsSlotsLoading(false));

        return () => {
            cancelled = true;
        };
    }, [isOpen, experienceId]);

    // Close on ESC + image arrows
    useEffect(() => {
        if (!isOpen) return;
        function onKey(e) {
            if (e.key === 'Escape') onClose?.();
            if (e.key === 'ArrowLeft') setActiveImageIndex((i) => Math.max(0, i - 1));
            if (e.key === 'ArrowRight') setActiveImageIndex((i) => Math.min((images.length || 1) - 1, i + 1));
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose, images.length]);

    if (!isOpen) return null;

    // Rows & sort
    const groupRows = flattenAvailabilityResponse(groupAvailability, 'GROUP');
    const privateRows = flattenAvailabilityResponse(privateAvailability, 'PRIVATE');
    const allRows = [...groupRows, ...privateRows].sort(
        (a, b) => parseDT(a.date, a.startTime) - parseDT(b.date, b.startTime)
    );

    // Determine if this experience is PRIVATE-only
    const types = (experience?.sessionTypes || []).map((s) => String(s).toUpperCase());
    const hasGroup = types.includes('GROUP');
    const hasPrivate = types.includes('PRIVATE');
    const privateOnly = hasPrivate && !hasGroup;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
                {isLoading && <div className="p-10 text-center text-gray-500">Loading details...</div>}
                {error && <div className="p-10 text-center text-red-500">{error}</div>}

                {!isLoading && !error && experience && (
                    <>
                        {/* header */}
                        <div className="flex justify-between items-start p-4 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{experience.title}</h2>
                                <p className="text-sm text-gray-500">
                                    Hosted by {experience.host?.firstName} {experience.host?.lastName}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close">
                                <X size={24} />
                            </button>
                        </div>

                        {/* body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* images */}
                            {images.length > 0 && (
                                <div className="space-y-3">
                                    <div className="bg-gray-200 rounded-lg flex justify-center items-center h-80">
                                        <img
                                            src={images[activeImageIndex]}
                                            alt={`${experience.title} - view ${activeImageIndex + 1}`}
                                            className="max-h-full max-w-full object-contain rounded-lg"
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {images.map((imgUrl, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveImageIndex(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                                                    activeImageIndex === index ? 'border-blue-500' : 'border-transparent'
                                                }`}
                                                aria-label={`Show image ${index + 1}`}
                                            >
                                                <img src={imgUrl} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* basics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DetailItem label="Category">
                                    <p>{experience.categoryName || '-'}</p>
                                </DetailItem>
                                <DetailItem label="Address">
                                    <p>{experience.address || '-'}</p>
                                </DetailItem>
                                <DetailItem label="Duration">
                                    <p>{experience.durationInMinutes ? `${experience.durationInMinutes} minutes` : '-'}</p>
                                </DetailItem>
                            </div>

                            {/* pricing + session types */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DetailItem label="Session Types">
                                    <div className="flex flex-wrap gap-2">
                                        {experience.sessionTypes?.length
                                            ? experience.sessionTypes.map((type) => (
                                                <span
                                                    key={type}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
                                                >
                            {type}
                          </span>
                                            ))
                                            : '-'}
                                    </div>
                                </DetailItem>
                                <DetailItem label="Group Price">
                                    <p>
                                        {experience.groupPricePerPerson != null
                                            ? `£${Number(experience.groupPricePerPerson).toFixed(2)} per person`
                                            : '-'}
                                    </p>
                                </DetailItem>
                                <DetailItem label="Private Price">
                                    <p>
                                        {experience.privatePrice != null
                                            ? `£${Number(experience.privatePrice).toFixed(2)} per session`
                                            : '-'}
                                    </p>
                                </DetailItem>
                            </div>

                            {/* description */}
                            <DetailItem label="Description">
                                <p className="whitespace-pre-wrap">{experience.description || '-'}</p>
                            </DetailItem>

                            {/* tags */}
                            {experience.tags?.length > 0 && (
                                <DetailItem label="Tags">
                                    <div className="flex flex-wrap gap-2">
                                        {experience.tags.map((tag, i) => (
                                            <span
                                                key={`${tag}-${i}`}
                                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full"
                                            >
                        {tag}
                      </span>
                                        ))}
                                    </div>
                                </DetailItem>
                            )}

                            {/* availability */}
                            <DetailItem label="Availability Schedule">
                                <div className="border rounded-lg max-h-64 overflow-y-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-2 px-3 text-left font-medium">Type</th>
                                            <th className="py-2 px-3 text-left font-medium">Date</th>
                                            <th className="py-2 px-3 text-left font-medium">Time Slot</th>
                                            <th className="py-2 px-3 text-left font-medium">Spots</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                        {isSlotsLoading ? (
                                            <tr>
                                                <td colSpan="4" className="py-4 px-3 text-center text-gray-500">
                                                    Loading availability…
                                                </td>
                                            </tr>
                                        ) : allRows.length ? (
                                            allRows.map((s) => (
                                                <tr key={s.key}>
                                                    <td className="py-2 px-3">{s.type}</td>
                                                    <td className="py-2 px-3">
                                                        {s.date ? new Date(s.date).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : '-'}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {s.type === 'GROUP'
                                                            ? (s.spotsLeft != null ? s.spotsLeft : '—')
                                                            : (privateOnly ? 1 : '—')}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="py-4 px-3 text-center text-gray-500">
                                                    No upcoming sessions available.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </DetailItem>
                        </div>

                        {/* footer actions */}
                        <div className="flex justify-end items-center gap-4 p-4 border-t bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => onReject?.(experience)}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                                <XCircle size={20} />
                                Reject
                            </button>
                            <button
                                onClick={() => onApprove?.(experience.id)}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <CheckCircle size={20} />
                                Approve
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExperienceDetailModal;
