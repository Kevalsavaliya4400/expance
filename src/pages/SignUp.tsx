import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PiggyBank,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  ArrowRight,
  ArrowLeft,
  Shield,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const steps = [
  {
    id: 'account',
    title: 'Account Details',
    description: 'Create your account credentials',
    fields: ['email', 'password', 'confirmPassword'],
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    fields: ['firstName', 'lastName', 'dateOfBirth', 'phone'],
  },
  {
    id: 'address',
    title: 'Address Information',
    description: 'Where do you live?',
    fields: ['address', 'city', 'country'],
  },
  {
    id: 'security',
    title: 'Security Setup',
    description: 'Secure your account',
    fields: ['securityQuestion', 'securityAnswer'],
  },
];

const securityQuestions = [
  "What was your first pet's name?",
  "What's your mother's maiden name?",
  'What city were you born in?',
  'What was your first car?',
  "What's your favorite book?",
];

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    const currentFields = steps[currentStep].fields;
    const missingFields = currentFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (currentStep === 0) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setLoading(true);
      const { email, password, confirmPassword, ...profileData } = formData;

      await signUp(email, password, profileData);

      toast.success('Account created! Please check your email to verify your account.');
      navigate('/verify-email', { state: { email } });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500/10 via-white to-primary-500/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 text-white mb-4 shadow-lg shadow-primary-500/30">
            <PiggyBank className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create an account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}:{' '}
            {steps[currentStep].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-2 bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="absolute -top-2 w-full flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-4 h-4 rounded-full ${
                  index <= currentStep
                    ? 'bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="input pl-10 w-full"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      className="input pl-10 w-full"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      placeholder="Create a password"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      className="input pl-10 w-full"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateFormData('confirmPassword', e.target.value)
                      }
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="input pl-10 w-full"
                        value={formData.firstName}
                        onChange={(e) =>
                          updateFormData('firstName', e.target.value)
                        }
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="input pl-10 w-full"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      required
                      className="input pl-10 w-full"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        updateFormData('dateOfBirth', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      className="input pl-10 w-full"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="input pl-10 w-full"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      required
                      className="input w-full"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      className="input w-full"
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Security Question
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      required
                      className="input pl-10 w-full"
                      value={formData.securityQuestion}
                      onChange={(e) =>
                        updateFormData('securityQuestion', e.target.value)
                      }
                    >
                      <option value="">Select a security question</option>
                      {securityQuestions.map((question) => (
                        <option key={question} value={question}>
                          {question}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Security Answer
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="input pl-10 w-full"
                      value={formData.securityAnswer}
                      onChange={(e) =>
                        updateFormData('securityAnswer', e.target.value)
                      }
                      placeholder="Your answer"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 ${
                  currentStep === 0 ? 'invisible' : ''
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}