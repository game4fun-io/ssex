import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Profile = () => {
    const { t } = useTranslation();
    const { user, login, logout } = useAuth(); // login is used to update user context if needed
    const navigate = useNavigate();
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
        formData.append('folder', 'avatars');

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

    const handleDeleteAccount = async () => {
        if (window.confirm(t('profile.deleteConfirm', 'Are you sure you want to delete your account? This action cannot be undone.'))) {
            try {
                await api.delete('/auth/me');
                logout();
                navigate('/');
                alert(t('profile.deleteSuccess', 'Your account has been deleted.'));
            } catch (err) {
                console.error('Error deleting account:', err);
                alert(t('profile.deleteError', 'Failed to delete account. Please try again.'));
            }
        }
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
                                src={
                                    editedProfile?.avatar ||
                                    (profileData.discordId && profileData.discordAvatar
                                        ? `https://cdn.discordapp.com/avatars/${profileData.discordId}/${profileData.discordAvatar}.png`
                                        : 'https://via.placeholder.com/150')
                                }
                                alt={profileData.username}
                                className="w-32 h-32 rounded-full border-4 border-yellow-500 object-cover"
                            />
                            {isEditing && (
                                <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-2">
                                    <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg border border-gray-600 transition" title={t('profile.uploadAvatar', 'Upload Avatar')}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    {profileData.discordId && profileData.discordAvatar && (
                                        <button
                                            onClick={() => setEditedProfile({ ...editedProfile, avatar: '' })}
                                            className="bg-[#5865F2] hover:bg-[#4752C4] text-white p-2 rounded-full shadow-lg border border-gray-600 transition"
                                            title="Use Discord Avatar"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                                        </button>
                                    )}
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

                    {/* Linked Accounts */}
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-12">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">Linked Accounts</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-gray-800 p-3 rounded border border-gray-600">
                                <i className="fab fa-discord text-[#5865F2] text-2xl"></i>
                                <div>
                                    <p className="font-bold text-white">Discord</p>
                                    {profileData.discordId ? (
                                        <div className="flex items-center gap-2">
                                            {profileData.discordAvatar && (
                                                <img
                                                    src={`https://cdn.discordapp.com/avatars/${profileData.discordId}/${profileData.discordAvatar}.png`}
                                                    alt="Discord Avatar"
                                                    className="w-6 h-6 rounded-full"
                                                />
                                            )}
                                            <span className="text-sm text-green-400">Connected as {profileData.discordUsername}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/auth/discord`}
                                            className="text-sm text-blue-400 hover:text-blue-300 underline"
                                        >
                                            Connect Discord
                                        </button>
                                    )}
                                </div>
                            </div>
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

                    {/* Danger Zone */}
                    <div className="mt-12 border border-red-900/50 rounded-lg overflow-hidden">
                        <div className="bg-red-900/20 p-4 border-b border-red-900/50">
                            <h3 className="text-red-500 font-bold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                {t('profile.dangerZone', 'Danger Zone')}
                            </h3>
                        </div>
                        <div className="p-6 bg-gray-900/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-white font-medium">{t('profile.deleteAccount', 'Delete Account')}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{t('profile.deleteAccountDesc', 'Once you delete your account, there is no going back. Please be certain.')}</p>
                                </div>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition text-sm"
                                >
                                    {t('profile.deleteAccountButton', 'Delete Account')}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
