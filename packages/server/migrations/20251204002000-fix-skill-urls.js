module.exports = {
    async up(db, client) {
        const characters = await db.collection('characters').find({}).toArray();
        let updatedCount = 0;

        for (const char of characters) {
            let modified = false;
            if (char.skills && char.skills.length > 0) {
                // console.log('Checking char:', char.name);
                char.skills.forEach(skill => {
                    if (skill.iconUrl && skill.iconUrl.includes('10271')) {
                        console.log('Found Thanatos Skill URL:', skill.iconUrl);
                    }
                    if (skill.iconUrl && skill.iconUrl.includes('seiya2.vercel.app')) {
                        // Replace the specific incorrect segment
                        skill.iconUrl = skill.iconUrl.replace('seiya2.vercel.app/', '');
                        modified = true;
                    }
                });
            }

            if (modified) {
                await db.collection('characters').updateOne(
                    { _id: char._id },
                    { $set: { skills: char.skills } }
                );
                updatedCount++;
            }
        }

        console.log(`Fixed skill URLs for ${updatedCount} characters.`);
    },

    async down(db, client) {
        // No easy rollback for string replacement without backup
    }
};
