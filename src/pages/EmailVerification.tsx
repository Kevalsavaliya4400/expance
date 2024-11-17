import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { currentUser, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || currentUser?.email;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    try {
      setLoading(true);
      await verifyEmail();
      setCountdown(60);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500/10 via-white to-primary-500/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 text-white mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Verify your email</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a verification email to:
            <br />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {email}
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Please check your email and click the verification link to continue.
              If you don't see the email, check your spam folder.
            </p>

            <button
              onClick={handleResendEmail}
              disabled={loading || countdown > 0}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {countdown > 0
                    ? `Resend in ${countdown}s`
                    : 'Resend verification email'}
                </>
              )}
            </button>

            <button
              onClick={handleBackToSignIn}
              className="w-full btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}