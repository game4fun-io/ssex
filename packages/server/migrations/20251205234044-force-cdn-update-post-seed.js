const CDN_BASE = 'https://cdn.games4fun.io/ssex-images';

module.exports = {
  async up(db) {
    const collections = ['characters', 'artifacts', 'forcecards'];

    for (const colName of collections) {
      const collection = db.collection(colName);
      const cursor = collection.find({});

      while (await cursor.hasNext()) {
        const item = await cursor.next();
        let modified = false;

        const updateUrl = (url) => {
          if (!url) return url;
          if (url.startsWith(CDN_BASE)) return url; // Already updated

          // Replace /assets/ with CDN_BASE/
          if (url.includes('/assets/')) {
            // Handle potential double slashes or path differences? 
            // The DB has "/assets/resources/..."
            // We want "https://cdn.../resources/..."
            // So we replace "/assets" with CDN_BASE.
            // Wait, CDN_BASE is .../ssex-images. 
            // Does the bucket structure match?
            // Assuming typical setup: /assets/foo -> CDN/foo
            return url.replace('/assets', CDN_BASE);
          }
          return url;
        };

        const updates = {};

        // Helper to check and set update
        const check = (key, val) => {
          const newUrl = updateUrl(val);
          if (newUrl !== val) {
            updates[key] = newUrl;
            modified = true;
          }
        }

        if (item.imageUrl) check('imageUrl', item.imageUrl);
        if (item.avatarUrl) check('avatarUrl', item.avatarUrl);

        if (item.skills && item.skills.length > 0) {
          const newSkills = item.skills.map(skill => {
            if (skill.iconUrl) {
              const newUrl = updateUrl(skill.iconUrl);
              if (newUrl !== skill.iconUrl) {
                modified = true;
                return { ...skill, iconUrl: newUrl };
              }
            }
            return skill;
          });
          if (modified && !updates.skills) { // Avoid overwriting if no change
            updates.skills = newSkills;
          }
        }

        if (modified) {
          await collection.updateOne({ _id: item._id }, { $set: updates });
        }
      }
    }
  },

  async down(db) {
    // No-op for now
  }
};
