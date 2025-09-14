import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const LoginModal = ({ onLoginClick, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-sm text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to proceed with your booking.</p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onLoginClick}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                    Go to Login
                </button>
            </div>
        </div>
    </div>
);


const PaymentCart = () => {
    // --- States ---
    const [cartItems, setCartItems] = useState([]);
    // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Debit card"); // 👈 REMOVED
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const navigate = useNavigate();
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsApplyingCoupon(true);
        setCouponMessage({ type: '', text: '' });
        try {
            const response = await axios.get(`/api/coupons/validate/${couponInput.trim().toUpperCase()}`);
            setAppliedCoupon(response.data);
            setCouponMessage({ type: 'success', text: `Success! ${response.data.discountPercentage}% discount applied.` });
        } catch (err) {
            setAppliedCoupon(null);
            const message = err.response?.data?.message || "Invalid coupon code.";
            setCouponMessage({ type: 'error', text: message });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleProceed = async () => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);
        setError("");

        const itemToCheckout = cartItems[0];
        if (!itemToCheckout) {
            setError("Your cart is empty.");
            setLoading(false);
            return;
        }

        const payload = {
            name: `${itemToCheckout.title} (${itemToCheckout.sessionType})`,
            price: calculateSubtotal(),
            quantity: 1,
            availabilityId: itemToCheckout.selectedSlot.availabilityId,
            guestCount: itemToCheckout.guestCount,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
        };

        try {
            const response = await axios.post(
                "http://localhost:8080/api/checkout",
                payload,
                { headers: authHeader() }
            );

            if (response.data.url) {
                localStorage.removeItem('cart');
                window.location.href = response.data.url;
            } else {
                setError("Could not retrieve payment URL. Please try again.");
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("You must be logged in to proceed to payment.");
            } else {
                setError(err.response?.data?.message || "An error occurred during checkout.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        sessionStorage.setItem('loginRedirectUrl', '/cart');
        navigate('/login');
    };

    const calculateSubtotal = () => cartItems.reduce((total, item) => total + item.totalPrice, 0);

    const subtotal = calculateSubtotal();
    const discountAmount = appliedCoupon ? (subtotal * (appliedCoupon.discountPercentage / 100)) : 0;
    const finalTotal = subtotal - discountAmount;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-10 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
                    <p className="text-gray-600 mb-6">Looks like you haven't added any experiences yet.</p>
                    <Link to="/experience" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition">
                        Start Exploring
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8 sm:p-10 space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-indigo-600 mb-1">MyBeez</h1>
                        <h2 className="text-xl font-semibold text-gray-800">Your Cart</h2>
                    </div>

                    <div className="space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={index} className="bg-gray-50 border rounded-lg p-5 flex gap-4">
                                <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-md flex-shrink-0"/>
                                <div className="flex-grow text-sm">
                                    <h3 className="font-bold text-base text-gray-800">{item.title}</h3>
                                    <p className="text-gray-600">{item.sessionType} Session</p>
                                    <p className="text-gray-600">Date: {format(new Date(item.selectedSlot.date), 'EEE, d MMM yyyy')}</p>
                                    <p className="text-gray-600">Time: {item.selectedSlot.startTime}</p>
                                    <p className="text-gray-600">Guests: {item.guestCount}</p>
                                </div>
                                <div className="font-semibold text-gray-900">£{item.totalPrice.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <label htmlFor="coupon" className="text-sm font-medium text-gray-700">Gift card or discount code</label>
                        <div className="mt-2 flex gap-2">
                            <input
                                id="coupon"
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                placeholder="Enter code"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={isApplyingCoupon}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                            >
                                {isApplyingCoupon ? '...' : 'Apply'}
                            </button>
                        </div>
                        {couponMessage.text && (
                            <p className={`mt-2 text-xs ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {couponMessage.text}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 border-t pt-4 text-sm font-medium text-gray-700">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>£{subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>- £{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-semibold text-gray-900 border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>£{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleProceed}
                            disabled={loading} // 👈 UPDATED disabled check
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-md transition disabled:bg-indigo-400"
                        >
                            {/* 👇 UPDATED button text */}
                            {loading ? 'Redirecting...' : 'Proceed to Payment'}
                        </button>
                        {error && <p className="text-xs text-center text-red-500 mt-3">{error}</p>}
                        <p className="text-xs text-center text-gray-400 mt-3">
                            You’ll be redirected to Stripe, our secure payment partner.
                        </p>
                    </div>
                </div>
            </div>

            {showLoginModal && (
                <LoginModal
                    onLoginClick={handleLoginRedirect}
                    onCancel={() => setShowLoginModal(false)}
                />
            )}
        </>
    );
};

export default PaymentCart;