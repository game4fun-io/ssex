module.exports = {
    async up(db, client) {
        const characters = await db.collection('characters').find({}).toArray();
        let updatedCount = 0;

        for (const char of characters) {
            if (!char.faction || !char.faction.en || !char.combatPosition || !char.combatPosition.en) {
                continue;
            }

            // Helper to slugify: "Gold Saints" -> "gold-saints", "Tank" -> "tank"
            const slugify = (text) => text.toLowerCase().trim().replace(/\s+/g, '-');

            const factionKey = slugify(char.faction.en);
            const roleKey = slugify(char.combatPosition.en);
            // attackType is sometimes missing or localized differently, check if exists
            const attackTypeKey = char.attackType && char.attackType.en ? slugify(char.attackType.en) : 'other';

            await db.collection('characters').updateOne(
                { _id: char._id },
                {
                    $set: {
                        factionKey: factionKey,
                        roleKey: roleKey,
                        attackTypeKey: attackTypeKey
                    }
                }
            );
            updatedCount++;
        }
        console.log(`Updated filter keys for ${updatedCount} characters.`);
    },

    async down(db, client) {
        // Revert to default 'other'
        await db.collection('characters').updateMany({}, { $set: { factionKey: 'other', roleKey: 'other', attackTypeKey: 'other' } });
    }
};
