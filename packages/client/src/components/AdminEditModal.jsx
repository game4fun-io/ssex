import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const AdminEditModal = ({ isOpen, onClose, entity, type, onUpdate }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(entity.isVisible);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.patch(`/admin/update/${type}/${entity._id}`, { isVisible });
            onUpdate({ ...entity, isVisible });
            onClose();
        } catch (err) {
            console.error('Error updating entity:', err);
            alert('Failed to update.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">{t('admin.editModal.title', { type })}</h2>

                <div className="mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={(e) => setIsVisible(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-yellow-500 rounded focus:ring-0 bg-gray-700 border-gray-600"
                        />
                        <span className="text-white">{t('admin.editModal.visible')}</span>
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                        {t('admin.editModal.visibleHelp')}
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                        {t('admin.editModal.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
                    >
                        {loading ? t('admin.editModal.saving') : t('admin.editModal.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditModal;
