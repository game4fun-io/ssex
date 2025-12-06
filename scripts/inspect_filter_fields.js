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

            if (characters.length > 0) {
                const sample = characters[0];
                console.log('Sample Character Keys:', Object.keys(sample));
                console.log('Sample Data:', JSON.stringify({
                    name: sample.name,
                    row: sample.row,
                    factionKey: sample.factionKey,
                    roleKey: sample.roleKey,
                    attackTypeKey: sample.attackTypeKey,
                    faction: sample.faction,
                    combatPosition: sample.combatPosition
                }, null, 2));
            }

            // Check how many have the keys
            const missingKeys = characters.filter(c => !c.factionKey || !c.roleKey || !c.row).length;
            console.log(`\nCharacters missing keys (factionKey, roleKey, row): ${missingKeys}/${characters.length}`);

        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
