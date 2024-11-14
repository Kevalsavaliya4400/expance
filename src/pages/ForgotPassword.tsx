import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 animate-fade-in">
        <div className="flex justify-center mb-8">
          <PiggyBank className="w-12 h-12 text-primary-500" />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Forgot your password?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="input px-4 py-3 border rounded-md w-full focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center py-3 text-white bg-primary-500 hover:bg-primary-600 rounded-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Remembered your password?{' '}
          <Link
            to="/signin"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
