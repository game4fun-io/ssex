const CDN_BASE = 'https://cdn.games4fun.io/ssex-images';

module.exports = {
  async up(db, client) {
    const collections = ['characters', 'artifacts', 'forcecards'];

    for (const colName of collections) {
      const collection = db.collection(colName);
      const cursor = collection.find({});

      while (await cursor.hasNext()) {
        const item = await cursor.next();
        let modified = false;

        const updateUrl = (url) => {
          if (!url) return url;
          if (url.startsWith(CDN_BASE)) return url;

          let newUrl = url;
          if (newUrl.includes('seiya2.vercel.app/assets/')) {
            newUrl = newUrl.replace('https://seiya2.vercel.app/assets/', `${CDN_BASE}/`);
          } else if (newUrl.startsWith('/assets/')) {
            newUrl = newUrl.replace('/assets/', `${CDN_BASE}/`);
          }
          return newUrl;
        };

        const updates = {};

        if (item.imageUrl) {
          const newUrl = updateUrl(item.imageUrl);
          if (newUrl !== item.imageUrl) {
            updates.imageUrl = newUrl;
            modified = true;
          }
        }

        if (item.avatarUrl) {
          const newUrl = updateUrl(item.avatarUrl);
          if (newUrl !== item.avatarUrl) {
            updates.avatarUrl = newUrl;
            modified = true;
          }
        }

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
          if (modified) {
            updates.skills = newSkills;
          }
        }

        if (modified) {
          await collection.updateOne({ _id: item._id }, { $set: updates });
        }
      }
    }
  },

  async down(db, client) {
    // Revert logic: Replace CDN_BASE with /assets/
    const collections = ['characters', 'artifacts', 'forcecards'];

    for (const colName of collections) {
      const collection = db.collection(colName);
      const cursor = collection.find({});

      while (await cursor.hasNext()) {
        const item = await cursor.next();
        let modified = false;

        const revertUrl = (url) => {
          if (!url) return url;
          if (url.startsWith(CDN_BASE)) {
            return url.replace(CDN_BASE, '/assets');
          }
          return url;
        };

        const updates = {};

        if (item.imageUrl) {
          const newUrl = revertUrl(item.imageUrl);
          if (newUrl !== item.imageUrl) {
            updates.imageUrl = newUrl;
            modified = true;
          }
        }

        if (item.avatarUrl) {
          const newUrl = revertUrl(item.avatarUrl);
          if (newUrl !== item.avatarUrl) {
            updates.avatarUrl = newUrl;
            modified = true;
          }
        }

        if (item.skills && item.skills.length > 0) {
          const newSkills = item.skills.map(skill => {
            if (skill.iconUrl) {
              const newUrl = revertUrl(skill.iconUrl);
              if (newUrl !== skill.iconUrl) {
                modified = true;
                return { ...skill, iconUrl: newUrl };
              }
            }
            return skill;
          });
          if (modified) {
            updates.skills = newSkills;
          }
        }

        if (modified) {
          await collection.updateOne({ _id: item._id }, { $set: updates });
        }
      }
    }
  }
};
