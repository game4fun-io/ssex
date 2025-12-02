import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Profile = () => {
    const { t } = useTranslation();
    const { user, login } = useAuth(); // login is used to update user context if needed
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [editedProfile, setEditedProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Assuming /auth/me or similar endpoint returns full user profile
                // If not, we might need to create one or use what's in context
                // Let's assume we can get fresh data
                const res = await api.get('/auth/me');
                setProfileData(res.data);
                setEditedProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                // Fallback to context user if API fails
                if (user) {
                    setProfileData(user);
                    setEditedProfile(user);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        try {
            const res = await api.put('/auth/updateDetails', {
                username: editedProfile.username,
                email: editedProfile.email,
                avatar: editedProfile.avatar,
                country: editedProfile.country,
                age: editedProfile.age
            });
            setProfileData(res.data.user || res.data); // Adjust based on API response
            setIsEditing(false);
            alert(t('profile.updateSuccess'));
        } catch (err) {
            console.error('Error updating profile:', err);
            alert(t('profile.updateError'));
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditedProfile({ ...editedProfile, avatar: res.data.filePath });
        } catch (err) {
            console.error('Error uploading avatar:', err);
            alert(t('profile.uploadError'));
        }
    };

    const handleChange = (e) => {
        setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;
    if (!profileData) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">User not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20 pt-8">
            <div className="container mx-auto px-4">
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl max-w-4xl mx-auto">

                    {/* Header: Avatar & Basic Info */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-gray-700 pb-8">
                        <div className="relative">
                            <img
                                src={profileData.avatar || 'https://via.placeholder.com/150'}
                                alt={profileData.username}
                                className="w-32 h-32 rounded-full border-4 border-yellow-500 object-cover"
                            />
                            {isEditing && (
                                <div className="absolute -bottom-2 left-0 right-0 flex flex-col gap-1 bg-gray-800 p-1 rounded">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="w-full text-xs text-gray-300"
                                    />
                                    <input
                                        type="text"
                                        name="avatar"
                                        value={editedProfile.avatar}
                                        onChange={handleChange}
                                        placeholder="Avatar URL"
                                        className="w-full bg-gray-900 text-xs text-white p-1 rounded border border-gray-600 text-center"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="username"
                                    value={editedProfile.username}
                                    onChange={handleChange}
                                    className="text-3xl font-bold bg-gray-700 text-white rounded p-2 mb-2 w-full md:w-auto"
                                />
                            ) : (
                                <h1 className="text-4xl font-bold text-white mb-2">{profileData.username}</h1>
                            )}
                            <p className="text-gray-400 mb-4">{profileData.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">Level {profileData.level || 1}</span>
                                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-bold">{profileData.points || 0} Points</span>
                                <span className="bg-purple-600 px-3 py-1 rounded-full text-sm font-bold capitalize">{profileData.role}</span>
                            </div>
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition">Cancel</button>
                                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold transition shadow-lg">Save</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold transition shadow-lg">Edit Profile</button>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-bold text-yellow-500 mb-4">Personal Info</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Country</label>
                                    {isEditing ? (
                                        <input type="text" name="country" value={editedProfile.country || ''} onChange={handleChange} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600" />
                                    ) : <p className="text-white">{profileData.country || 'Not set'}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Age</label>
                                    {isEditing ? (
                                        <input type="number" name="age" value={editedProfile.age || ''} onChange={handleChange} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600" />
                                    ) : <p className="text-white">{profileData.age || 'Not set'}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Member Since</label>
                                    <p className="text-white">{new Date(profileData.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-bold text-yellow-500 mb-4">Badges & Achievements</h2>
                            {profileData.badges && profileData.badges.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profileData.badges.map((badge, idx) => (
                                        <span key={idx} className="bg-gray-800 border border-gray-600 px-3 py-1 rounded text-sm text-gray-300">{badge}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No badges yet. Keep playing!</p>
                            )}
                        </div>
                    </div>

                    {/* Account Activity / Stats (Placeholder) */}
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">Account Activity</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-800 p-4 rounded">
                                <span className="block text-2xl font-bold text-white">{profileData.ownedCharacters?.length || 0}</span>
                                <span className="text-xs text-gray-400">Characters</span>
                            </div>
                            {/* Add more stats as needed */}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
