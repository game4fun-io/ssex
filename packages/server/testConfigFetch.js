const axios = require('axios');

const testFetch = async () => {
    try {
        const res = await axios.get('http://localhost:5001/api/config');
        console.log('Config fetched successfully:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error fetching config:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    }
};

testFetch();
