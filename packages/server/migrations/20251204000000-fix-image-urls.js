module.exports = {
    async up(db, client) {
        const characters = await db.collection('characters').find({}).toArray();

        for (const char of characters) {
            let updated = false;
            const updateDoc = {};

            // Fix root image URLs
            if (char.imageUrl && char.imageUrl.includes('seiya2.vercel.app/assets/')) {
                updateDoc.imageUrl = char.imageUrl.replace('seiya2.vercel.app/assets/', '');
                updated = true;
            }
            if (char.avatarUrl && char.avatarUrl.includes('seiya2.vercel.app/assets/')) {
                updateDoc.avatarUrl = char.avatarUrl.replace('seiya2.vercel.app/assets/', '');
                updated = true;
            }

            // Fix skill icon URLs
            if (char.skills && char.skills.length > 0) {
                const newSkills = char.skills.map(skill => {
                    if (skill.iconUrl && skill.iconUrl.includes('seiya2.vercel.app/assets/')) {
                        updated = true;
                        return { ...skill, iconUrl: skill.iconUrl.replace('seiya2.vercel.app/assets/', '') };
                    }
                    return skill;
                });
                if (updated) {
                    updateDoc.skills = newSkills;
                }
            }

            if (updated) {
                await db.collection('characters').updateOne({ _id: char._id }, { $set: updateDoc });
                console.log(`Updated URLs for character: ${char.id}`);
            }
        }
    },

    async down(db, client) {
        // No easy rollback for string replacement without backup, but this is a fix-forward.
    }
};
