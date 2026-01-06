import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const VerifyAccountPage = () => {
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email');
    const navigate = useNavigate();
    const { verifyAccount, resendVerification, isLoading, error: authError } = useAuth();
    const { success, error: toastError } = useToast();

    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState(emailFromUrl || '');
    const [isVerified, setIsVerified] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0) return;
        try {
            await resendVerification(email);
            success("Verification code resent! Please check your email.");
            setCooldown(60);
        } catch (err) {
            // Error handled in hook or toast
        }
    };

    useEffect(() => {
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        }
    }, [emailFromUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyAccount(email, otp);
            setIsVerified(true);
            success('Account verified successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error(err);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(6,4,36)] text-white px-4">
                <div className="max-w-md w-full bg-[#1e1f22] p-8 rounded-2xl border border-white/10 shadow-2xl text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <h2 className="text-2xl font-bold text-green-400">Verified!</h2>
                    <p className="text-gray-300">Your account has been successfully verified.</p>
                    <p className="text-sm text-gray-500 mt-4">Redirecting to login page...</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[rgb(6,4,36)] text-white px-4">
            <div className="max-w-md w-full bg-[#1e1f22] p-8 rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex flex-col items-center gap-4 mb-6">
                    <ShieldCheck className="w-12 h-12 text-blue-500" />
                    <h2 className="text-2xl font-bold">Verify Your Account</h2>
                    <p className="text-gray-400 text-center text-sm">
                        Please enter the customized OTP sent to your email
                        <span className="text-blue-400 font-semibold block">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                            Enter Verificiation Code
                        </label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="123456"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-blue-500 transition-colors"
                            required
                            maxLength={6}
                        />
                    </div>

                    {authError && (
                        <div className='text-center text-sm text-red-400 p-2 bg-red-900/20 rounded-md'>
                            {authError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Didn't receive code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={cooldown > 0}
                            className={`font-medium ${cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
                        >
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                        </button>
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyAccountPage;
