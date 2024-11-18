import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Shield,
  LogOut,
  Edit2,
  Check,
  X,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  securityQuestion: string;
  securityAnswer: string;
  profileImage?: string;
}

const initialProfile: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  city: '',
  country: '',
  securityQuestion: '',
  securityAnswer: '',
};

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState<UserProfile>(initialProfile);

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setEditForm(data);
        setProfileImage(data.profileImage || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentUser) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          profileImage: imageData,
          updatedAt: new Date(),
        }, { merge: true });
        
        toast.success('Profile picture updated');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        toast.error('Failed to update profile picture');
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await setDoc(userDocRef, {
        ...editForm,
        profileImage,
        updatedAt: new Date(),
      }, { merge: true });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="bg-purple-700 text-white rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">
                    {editForm.firstName?.[0] || currentUser.email?.[0].toUpperCase()}
                  </span>
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white text-purple-700 rounded-full p-1 shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {editForm.firstName} {editForm.lastName}
              </h2>
              <p className="text-purple-200">{editForm.email}</p>
            </div>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-2 bg-white text-purple-700 rounded-full"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-700 border-t-transparent" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 bg-purple-600 text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-purple-600 rounded-full transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">
            PASS Member
          </span>
          <div className="px-3 py-1 bg-purple-600 rounded-full text-sm flex items-center gap-1">
            <span>Saved</span>
            <span className="font-semibold">€125</span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
        <div className="space-y-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{editForm.firstName} {editForm.lastName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{editForm.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{editForm.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{editForm.dateOfBirth}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{editForm.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{editForm.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{editForm.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Security Question</p>
                  <p className="font-medium">{editForm.securityQuestion}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-6">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}