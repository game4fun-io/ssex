import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/config');
            setConfig(res.data);
        } catch (err) {
            console.error('Error fetching config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const updateConfig = async (newConfig) => {
        try {
            const res = await api.put('/config', newConfig);
            setConfig(res.data);
            return res.data;
        } catch (err) {
            console.error('Error updating config:', err);
            throw err;
        }
    };

    return (
        <ConfigContext.Provider value={{ config, updateConfig, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigContext;
