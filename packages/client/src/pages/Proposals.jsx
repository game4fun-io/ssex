import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Proposals = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'fix',
        title: '',
        description: ''
    });

    const isModerator = user?.role === 'moderator' || user?.role === 'admin';
    const isMember = user?.role !== 'user'; // Members and above can submit

    useEffect(() => {
        fetchProposals();
    }, [user]);

    const fetchProposals = async () => {
        try {
            // If moderator, fetch all. If member, maybe fetch own? 
            // For now, let's assume the API returns what's appropriate or public proposals.
            // The current API implementation for GET /proposals is restricted to moderators.
            // We might need to update the API to allow members to see their own or public ones.
            // For this implementation, we'll focus on the moderator view for the list,
            // and just show the form for members.
            if (isModerator) {
                const res = await api.get('/community/proposals');
                setProposals(res.data);
            }
        } catch (err) {
            console.error('Error fetching proposals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/community/proposals', formData);
            setShowForm(false);
            setFormData({ type: 'fix', title: '', description: '' });
            alert(t('community.proposals.success'));
            if (isModerator) fetchProposals();
        } catch (err) {
            console.error('Error submitting proposal:', err);
            alert(t('community.proposals.failure'));
        }
    };

    const handleStatusUpdate = async (id, status, reason = '') => {
        try {
            await api.patch(`/community/proposals/${id}`, { status, rejectionReason: reason });
            fetchProposals();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    if (loading && isModerator) return <div className="text-white p-8">{t('loading')}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-500">{t('community.proposals.title')}</h1>
                    {isMember && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold transition"
                        >
                            {showForm ? t('community.proposals.cancel') : t('community.proposals.new')}
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">{t('community.proposals.submitTitle')}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">{t('community.proposals.type')}</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                >
                                    <option value="fix">{t('community.proposals.types.fix')}</option>
                                    <option value="content">{t('community.proposals.types.content')}</option>
                                    <option value="feature">{t('community.proposals.types.feature')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">{t('community.proposals.form.title')}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">{t('community.proposals.form.description')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 h-32"
                                    required
                                />
                            </div>
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold">
                                {t('community.proposals.submit')}
                            </button>
                        </form>
                    </div>
                )}

                {isModerator ? (
                    <div className="grid gap-4">
                        {proposals.map((proposal) => (
                            <div key={proposal._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${proposal.type === 'fix' ? 'bg-red-900 text-red-300' :
                                                proposal.type === 'feature' ? 'bg-blue-900 text-blue-300' :
                                                    'bg-green-900 text-green-300'
                                                }`}>{t(`community.proposals.types.${proposal.type}`, proposal.type)}</span>
                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${proposal.status === 'approved' ? 'bg-green-600 text-white' :
                                                proposal.status === 'rejected' ? 'bg-red-600 text-white' :
                                                    'bg-yellow-600 text-white'
                                                }`}>{t(`community.proposals.status.${proposal.status}`, proposal.status)}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{proposal.title}</h3>
                                        <p className="text-gray-400 text-sm mb-4">{t('community.proposals.submittedBy', { user: proposal.user?.username, date: new Date(proposal.createdAt).toLocaleDateString() })}</p>
                                        <p className="text-gray-300">{proposal.description}</p>
                                    </div>
                                    {proposal.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(proposal._id, 'approved')}
                                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                {t('community.proposals.approve')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Reason for rejection:');
                                                    if (reason) handleStatusUpdate(proposal._id, 'rejected', reason);
                                                }}
                                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                {t('community.proposals.reject')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {proposals.length === 0 && <p className="text-gray-500">{t('community.proposals.noProposals')}</p>}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>{t('community.proposals.moderatorOnly')}</p>
                        <p>{t('community.proposals.memberInstruction')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Proposals;
