module.exports = {
    async up(db, client) {
        await db.collection('characters').updateMany(
            {},
            {
                $unset: {
                    faction: "",
                    combatPosition: "",
                    positioning: "",
                    attackType: ""
                }
            }
        );
        console.log('Removed duplicate localized fields from characters.');
    },

    async down(db, client) {
        // Reversing this is hard without backup, but we can leave it empty or try to restore if we had a backup strategy.
        // For this task, we assume it's a one-way cleanup.
        console.log('Down migration for cleanup is not implemented (data loss).');
    }
};
