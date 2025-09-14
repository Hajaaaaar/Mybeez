import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import api from "../services/api";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";

export default function ReviewModal({ isOpen, onClose, experience, currentUser, onSubmitted }) {
    const [step, setStep] = useState(1);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [reviewerName, setReviewerName] = useState("");
    const [email, setEmail] = useState("");

    const autoCloseRef = useRef(null);

    const fillFromProfile = (p = {}) => {
        const fn = p.firstName?.trim() || "";
        const ln = p.lastName?.trim() || "";
        const full = `${fn} ${ln}`.trim();

        setReviewerName(full || p.email || "Guest");
        setEmail(p.email || "");

        // If logged in (user OR host), skip straight to step 2
        if (p.email) {
            setStep(2);
        }
    };


    useEffect(() => {
        if (!isOpen) return;

        // If parent passed in a currentUser with role + email
        if (currentUser?.email) {
            fillFromProfile(currentUser);
            return;
        }

        // Fallback: check AuthService (token exists)
        const auth = AuthService.getCurrentUser?.();
        if (auth?.accessToken) {
            UserService.getProfile()
                .then(res => {
                    // Profile will include role: "USER" or "HOST"
                    // fillFromProfile works for both
                    fillFromProfile(res.data);
                })
                .catch(() => fillFromProfile({}));
        } else {
            fillFromProfile({});
        }
    }, [isOpen, currentUser]);

    useEffect(() => {
        // cleanup any pending auto-close timer when modal unmounts/closes
        return () => {
            if (autoCloseRef.current) {
                clearTimeout(autoCloseRef.current);
                autoCloseRef.current = null;
            }
        };
    }, []);

    const reset = () => {
        setStep(1);
        setRating(0);
        setReviewText("");
        setLoading(false);
        setErr("");
    };

    const close = () => {
        if (loading) return;
        if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
        reset();
        onClose?.();
    };

    const submit = async () => {
        setErr("");
        if (!experience?.id) {
            setErr("No experience selected. Please refresh and try again.");
            return;
        }
        if (!rating || reviewText.trim().length < 3) {
            setErr("Please select a rating and enter a review.");
            return;
        }

        const payload = {
            reviewerName,
            rating,
            reviewText: reviewText.trim(),
            experienceId: experience.id,
        };

        setLoading(true);
        try {
            const { data } = await api.post("/reviews", payload);
            onSubmitted?.(data);
            setLoading(false);
            setStep(4); // ✅ jump to success slide

            // auto-close after 1.6s
            if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
            autoCloseRef.current = setTimeout(() => {
                reset();
                onClose?.();
            }, 1600);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to submit review.");
            setLoading(false);
        }
    };

    if (!isOpen || !experience) return null;
    const isLoggedIn = !!email;

    const steps = [
        { n: 1, label: "Details" },
        { n: 2, label: "Review" },
        { n: 3, label: "Confirm" },
        { n: 4, label: "Submitted" }, // new success step
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
                >
                    <div className="px-6 pt-6 pb-2 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Leave a Review</h2>
                            <button onClick={close} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Close</button>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{experience.title ? `For: ${experience.title}` : ""}</p>
                        <div className="mt-5 grid grid-cols-4 gap-6">
                            {steps.map(({ n, label }) => (
                                <div key={n} className="flex flex-col items-center">
                                    <div
                                        className={`h-10 w-10 flex items-center justify-center rounded-full border-2 ${
                                            step >= n ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-300"
                                        }`}
                                    >
                                        {n < 4 ? n : <FaCheckCircle className="text-white" />}
                                    </div>
                                    <div className={`mt-2 text-sm font-semibold ${step >= n ? "text-indigo-700" : "text-slate-500"}`}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        {step === 1 && (
                            <div className="space-y-5">
                                <h3 className="text-xl font-bold text-slate-900">Your Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Name</label>
                                        <input
                                            type="text"
                                            value={reviewerName}
                                            onChange={(e) => setReviewerName(e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button onClick={() => setStep(2)} className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-semibold hover:bg-indigo-700">
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                {isLoggedIn && (
                                    <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                                        Using your profile: <span className="font-semibold">{reviewerName}</span> • <span className="font-semibold">{email}</span>
                                    </div>
                                )}
                                {!isLoggedIn && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Name</label>
                                            <input
                                                type="text"
                                                value={reviewerName}
                                                onChange={(e) => setReviewerName(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Rating</label>
                                    <div className="mt-2 flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                type="button"
                                                key={s}
                                                onClick={() => setRating(s)}
                                                className={`h-9 w-9 flex items-center justify-center rounded-full border ${
                                                    rating >= s ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-300 text-indigo-400 bg-white"
                                                }`}
                                                title={`${s} star${s > 1 ? "s" : ""}`}
                                            >
                                                <FaStar />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Your Review</label>
                                    <textarea
                                        rows={5}
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Share your experience..."
                                    />
                                </div>
                                {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
                                <div className="flex items-center justify-between pt-2">
                                    <button onClick={() => setStep(1)} className="rounded-xl px-4 py-2 text-slate-700 hover:bg-slate-100 font-semibold">
                                        Back
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <button onClick={close} disabled={loading} className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">
                                            Cancel
                                        </button>
                                        <button onClick={() => setStep(3)} className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-semibold hover:bg-indigo-700">
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">Review</h3>
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Name:</span>
                                            <span>{reviewerName}</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="font-semibold">Rating:</span>
                                            <span>{"★".repeat(rating) || "—"}</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="font-semibold">Review:</span> {reviewText || "—"}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-slate-500">Submitted reviews may appear after admin approval.</p>
                                </div>
                                {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
                                <div className="flex items-center justify-between">
                                    <button onClick={() => setStep(2)} className="rounded-xl px-4 py-2 text-slate-700 hover:bg-slate-100 font-semibold">
                                        Back
                                    </button>
                                    <button onClick={submit} disabled={loading} className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60">
                                        {loading ? "Submitting…" : "Submit Review"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4 flex flex-col items-center text-center">
                                <FaCheckCircle className="text-green-500" size={64} />
                                <h3 className="text-2xl font-bold text-slate-900">Review submitted!</h3>
                                <p className="text-slate-600">
                                    Thanks, {reviewerName.split(" ")[0] || "there"}.
                                    {" "}Your review will appear after admin approval.
                                </p>
                                <p className="text-xs text-slate-400">Closing…</p>
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-6 pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500">By submitting, you agree to our community guidelines.</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
