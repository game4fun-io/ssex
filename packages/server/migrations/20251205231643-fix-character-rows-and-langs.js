module.exports = {
  async up(db) {
    const characters = db.collection('characters');

    // 1. Fix Positioning / Row
    const cursor = characters.find({});
    while (await cursor.hasNext()) {
      const char = await cursor.next();
      let modified = false;
      const updates = {};

      const posEn = char.positioning?.en?.toLowerCase();
      if (posEn) {
        let newRow = null;
        if (posEn.includes('front')) newRow = 'front';
        else if (posEn.includes('middle') || posEn.includes('mid')) newRow = 'mid';
        else if (posEn.includes('back')) newRow = 'back';

        if (newRow && char.row !== newRow) {
          updates.row = newRow;
          modified = true;
        }
      }

      // 2. Fix Mixed Languages (CN in PT)
      const chineseRegex = /[\u4e00-\u9fa5]/;
      let skillsModified = false;
      let newSkills = char.skills;

      if (char.skills && char.skills.length > 0) {
        newSkills = char.skills.map(skill => {
          let sMod = false;
          let levels = skill.levels;

          if (skill.levels) {
            levels = skill.levels.map(level => {
              if (level.description?.pt && chineseRegex.test(level.description.pt)) {
                sMod = true;
                // Fallback order: EN -> ES -> Keep PT (broken)
                const fallback = level.description.en || level.description.es || level.description.pt;
                return { ...level, description: { ...level.description, pt: fallback } };
              }
              return level;
            });
          }

          let desc = skill.description;
          if (skill.description?.pt && chineseRegex.test(skill.description.pt)) {
            sMod = true;
            const fallback = skill.description.en || skill.description.es || skill.description.pt;
            desc = { ...skill.description, pt: fallback };
          }

          if (sMod) {
            skillsModified = true;
            return { ...skill, levels, description: desc };
          }
          return skill;
        });
      }

      if (skillsModified) {
        updates.skills = newSkills;
        modified = true;
      }

      if (modified) {
        await characters.updateOne({ _id: char._id }, { $set: updates });
      }
    }
  },

  async down(db) {
    // Reverting row fixes or language cleanups is complex without caching original state.
    // For this deployment, a down migration is intentionally left as no-op or partial.
    // We could potentially unset 'row', but that might break things if they were valid before.
    // We will leave it empty as these represent corrections to invalid data.
  }
};
