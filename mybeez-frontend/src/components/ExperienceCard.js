import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ExperienceCard({ experience }) {
    const linkTo = experience?.id ? `/experience/${experience.id}` : "#";
    const [avgRating, setAvgRating] = useState(null);
    const [reviewCount, setReviewCount] = useState(null);

    useEffect(() => {
        let ignore = false;
        if (!experience?.id) return;
        (async () => {
            try {
                const { data } = await api.get(`/reviews/stats/${experience.id}`);
                if (!ignore) {
                    setAvgRating(typeof data?.avgRating === "number" ? data.avgRating : 0);
                    setReviewCount(typeof data?.count === "number" ? data.count : 0);
                }
            } catch {
                if (!ignore) {
                    setAvgRating(typeof experience?.rating === "number" ? experience.rating : 0);
                    setReviewCount(Array.isArray(experience?.reviews) ? experience.reviews.length : 0);
                }
            }
        })();
        return () => { ignore = true; };
    }, [experience?.id]);

    const sessionTypesArray = experience?.sessionTypes ? Array.from(experience.sessionTypes) : [];
    const hasGroup = sessionTypesArray.includes("GROUP");
    const hasPrivate = sessionTypesArray.includes("PRIVATE");
    const primarySessionType = sessionTypesArray[0] || experience?.sessionType || "GROUP";

    const displayRating = useMemo(() => {
        const r = typeof avgRating === "number" ? avgRating : (typeof experience?.rating === "number" ? experience.rating : 0);
        return Number.isFinite(r) ? r.toFixed(1) : "0.0";
    }, [avgRating, experience?.rating]);

    const displayCount = useMemo(() => {
        if (typeof reviewCount === "number") return reviewCount;
        if (Array.isArray(experience?.reviews)) return experience.reviews.length;
        return 0;
    }, [reviewCount, experience?.reviews]);

    return (
        <Link to={linkTo} className="block h-full">
            <div className="bg-white border rounded-xl shadow hover:shadow-xl transform hover:scale-105 transition duration-300 overflow-hidden flex flex-col h-full">
                <img
                    src={experience?.images && experience.images.length > 0 ? experience.images[0] : "https://via.placeholder.com/400x250"}
                    alt={experience?.title || "Experience image"}
                    className="w-full h-40 object-cover flex-shrink-0"
                    loading="lazy"
                />
                <div className="p-4 flex flex-col flex-grow text-gray-800">
                    <h3 className="text-lg font-semibold mb-1">{experience?.title || "Untitled Experience"}</h3>
                    <p className="text-sm text-gray-500 mb-2">{experience?.location || "Unknown location"}</p>
                    <p className="text-sm mb-2">{experience?.description || "No description available."}</p>

                    {/* This div pushes everything inside it to the bottom */}
                    <div className="mt-auto pt-2">
                        <div className="flex items-center text-sm">
                            <span className="font-bold text-yellow-500">{displayRating} ★</span>
                            <span className="ml-1 text-gray-500">({displayCount} reviews)</span>
                        </div>
                        <div className="text-sm mt-2 space-y-1">
                            {hasGroup && hasPrivate ? (
                                <>
                                    <p><strong>£{experience?.groupPricePerPerson ?? "N/A"}</strong> per person</p>
                                    <p><strong>£{experience?.privatePrice ?? "N/A"}</strong> per session</p>
                                </>
                            ) : (
                                <p>
                                    <strong>
                                        £{primarySessionType === "GROUP" ? experience?.groupPricePerPerson ?? "N/A" : experience?.privatePrice ?? "N/A"}
                                    </strong>{" "}
                                    {primarySessionType === "GROUP" ? "per person" : "per session"}
                                </p>
                            )}
                            <p>Session: {sessionTypesArray.length > 0 ? sessionTypesArray.join(", ") : primarySessionType}</p>
                            <p>Duration: {experience?.durationInMinutes ?? "N/A"} min</p>
                            {/*<p>Group size: {experience?.groupMinAttendees ?? "N/A"}–{experience?.groupMaxAttendees ?? "N/A"} people</p>*/}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}