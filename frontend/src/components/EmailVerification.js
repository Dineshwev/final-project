import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendVerificationEmail, verifyEmail } from '../services/authService';

const EmailVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if this is a verification redirect
    const actionCode = new URLSearchParams(location.search).get('oobCode');
    if (actionCode) {
      handleVerification(actionCode);
    }
  }, [location]);

  const handleVerification = async (actionCode) => {
    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await verifyEmail(actionCode);
      if (error) {
        setError(error);
      } else {
        setSuccess('Email verified successfully! You will be redirected shortly...');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      setError('Failed to verify email. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (countdown > 0) return;

    setError('');
    setSuccess('');

    try {
      const { error } = await sendVerificationEmail();
      if (error) {
        setError(error);
      } else {
        setSuccess('Verification email sent! Please check your inbox.');
        // Set 60-second cooldown for resending
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((current) => {
            if (current <= 1) {
              clearInterval(timer);
              return 0;
            }
            return current - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    }
  };

  // If no user is logged in, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  // If user is already verified, redirect to home
  if (user.emailVerified) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please verify your email address to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <div className="text-center">
            <p className="mb-4">
              We've sent a verification email to:
              <br />
              <span className="font-medium">{user.email}</span>
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Please check your email and click the verification link to activate your account.
              If you don't see the email, check your spam folder.
            </p>

            <button
              onClick={handleResendVerification}
              disabled={verifying || countdown > 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : verifying
                ? 'Sending...'
                : 'Resend Verification Email'}
            </button>

            <div className="mt-4">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;