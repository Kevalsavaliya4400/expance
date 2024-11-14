import { useState } from 'react';
import { Camera, Mail, Phone, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(
    currentUser?.email?.split('@')[0] || ''
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result as string);
      toast.success('Profile image updated successfully!');
    };

    if (file) {
      reader.readAsDataURL(file); // You can consider uploading the image to Firebase Storage instead.
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Ensure displayName is provided
      if (!displayName) {
        toast.error('Display name is required!');
        setLoading(false);
        return;
      }

      // Call the updateUserProfile function from AuthContext to save changes to Firestore
      await updateUserProfile(displayName, profileImage);

      toast.success('Profile updated successfully!');
      setIsEditing(false); // Exit edit mode
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        toast.error(`Failed to update profile: ${error.message}`);
      } else {
        toast.error('Failed to update profile due to an unknown error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Info Section */}
      <div className="card">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary-500 flex items-center justify-center text-white text-4xl">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                currentUser?.email?.[0].toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer">
              <Camera className="w-5 h-5" />
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
            </label>
          </div>
          <h2 className="mt-4 text-2xl font-semibold">
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-xl font-semibold border-b-2 border-primary-600"
              />
            ) : (
              displayName
            )}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {currentUser?.email}
          </p>
          <div className="mt-4">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary-600 hover:text-primary-500"
              >
                <Edit className="w-5 h-5 inline mr-2" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
              <button className="text-primary-600 hover:text-primary-500">
                Add phone number
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Account Settings</h3>
        <div className="space-y-4">
          <button
            className="btn btn-primary w-full"
            onClick={() => toast.success('Email verification sent!')}
          >
            Verify Email
          </button>
          <button className="btn bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 w-full">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
