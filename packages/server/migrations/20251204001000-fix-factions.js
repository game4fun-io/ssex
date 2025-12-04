module.exports = {
    async up(db, client) {
        const mapping = {
            "1001": "athena", "1002": "athena", "1003": "athena", "1004": "athena", "1005": "athena",
            "1006": "athena", "1007": "athena", "1008": "athena", "1009": "athena", "1010": "athena",
            "1011": "athena", "1012": "athena", "1013": "poseidon", "1014": "poseidon", "1015": "poseidon",
            "1016": "poseidon", "1017": "poseidon", "1018": "poseidon", "1019": "poseidon", "1020": "poseidon",
            "1021": "poseidon", "1022": "athena", "1023": "athena", "1024": "athena", "1025": "hades",
            "1026": "hades", "1027": "hades", "1028": "hades", "1029": "hades", "1030": "hades",
            "1031": "hades", "1032": "hades", "1033": "hades", "1034": "hades", "1035": "hades",
            "1036": "hades", "1037": "athena", "1038": "hades", "1039": "athena", "1040": "athena",
            "1041": "hades", "1042": "hades", "1043": "asgard", "1044": "athena", "1045": "athena",
            "1046": "hades", "1047": "hades", "1048": "athena", "1049": "athena", "1050": "athena",
            "1051": "athena", "1052": "athena", "1053": "athena", "1054": "athena", "1055": "athena",
            "1056": "hades", "1057": "hades", "1058": "hades", "1059": "hades", "1060": "asgard",
            "1061": "asgard", "1062": "asgard", "1063": "asgard", "1064": "asgard", "1065": "asgard",
            "1066": "athena", "1067": "athena", "1068": "athena", "1069": "athena", "1070": "athena",
            "1071": "athena", "1072": "athena", "1073": "poseidon", "1074": "athena", "1075": "athena",
            "1076": "asgard", "1077": "asgard", "1078": "asgard", "1079": "hades", "1080": "athena",
            "1081": "athena", "1082": "athena", "1083": "hades", "1084": "hades", "1085": "hades",
            "1086": "athena", "1087": "hades", "1088": "hades", "1089": "athena", "1090": "athena",
            "1091": "athena", "1092": "other", "1093": "other", "1094": "other", "1095": "other",
            "1096": "other", "1097": "athena", "1098": "athena", "1099": "athena", "1100": "athena",
            "1101": "hades", "1102": "asgard", "1103": "athena", "1104": "athena", "1105": "athena",
            "1107": "athena", "1108": "athena", "1109": "other"
        };

        const characters = await db.collection('characters').find({}).toArray();
        let updatedCount = 0;

        for (const char of characters) {
            let updated = false;
            const updateDoc = {};

            // Fix Faction Key
            if (mapping[char.id]) {
                if (char.factionKey !== mapping[char.id]) {
                    updateDoc.factionKey = mapping[char.id];
                    updated = true;
                }
            }

            // Trim URLs just in case
            if (char.skills && char.skills.length > 0) {
                const newSkills = char.skills.map(skill => {
                    if (skill.iconUrl && typeof skill.iconUrl === 'string') {
                        const trimmed = skill.iconUrl.trim();
                        if (trimmed !== skill.iconUrl) {
                            updated = true;
                            return { ...skill, iconUrl: trimmed };
                        }
                    }
                    return skill;
                });
                if (updated) {
                    updateDoc.skills = newSkills;
                }
            }

            if (updated) {
                await db.collection('characters').updateOne({ _id: char._id }, { $set: updateDoc });
                updatedCount++;
            }
        }
        console.log(`Fixed factions/URLs for ${updatedCount} characters.`);
    },

    async down(db, client) {
        // No rollback needed for this fix-forward
    }
};
