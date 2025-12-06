const https = require('https');

const url = 'https://seiyaexcompanion.games4fun.io/api/characters';
const options = {
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
};

https.get(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const characters = JSON.parse(data);
            console.log(`Fetched ${characters.length} characters.`);

            const checks = ['Thanatos', 'Sagittarius Seiya', 'Libra Shiryu', 'Mu'];

            characters.forEach(c => {
                const name = c.name?.en || c.name;
                if (checks.some(k => name.includes(k))) {
                    console.log(`${name}: Row='${c.row}', Pos='${c.positioning?.en}'`);
                }
            });

            // Count rows
            const counts = characters.reduce((acc, c) => {
                acc[c.row] = (acc[c.row] || 0) + 1;
                return acc;
            }, {});
            console.log('\nRow Counts:', counts);

        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
