module.exports = {
    async up(db, client) {
        const characters = await db.collection('characters').find({}).toArray();
        let updatedCount = 0;

        const normalize = (obj) => {
            if (!obj) return '';
            const values = Object.values(obj).map(v => (typeof v === 'string' ? v.toLowerCase() : ''));
            return values.join(' ');
        };

        const normalizeRow = (positioning) => {
            if (!positioning) return 'front';
            const combined = normalize(positioning);

            if (combined.includes('front') || combined.includes('frente') || combined.includes('avant') || combined.includes('delante') || combined.includes('前') || combined.includes('depan') || combined.includes('หน้า')) return 'front';
            if (combined.includes('mid') || combined.includes('meio') || combined.includes('medio') || combined.includes('centre') || combined.includes('centro') || combined.includes('milieu') || combined.includes('中') || combined.includes('tengah') || combined.includes('กลาง')) return 'mid';
            if (combined.includes('back') || combined.includes('trás') || combined.includes('tras') || combined.includes('arrière') || combined.includes('fundo') || combined.includes('atrás') || combined.includes('fondo') || combined.includes('后') || combined.includes('belakang') || combined.includes('หลัง')) return 'back';

            return 'front';
        };

        const getFactionKey = (faction) => {
            const s = normalize(faction);
            if (s.includes('athena') || s.includes('atena')) return 'athena';
            if (s.includes('hades') || s.includes('specter') || s.includes('espectro')) return 'hades';
            if (s.includes('poseidon') || s.includes('marina')) return 'poseidon';
            if (s.includes('asgard') || s.includes('god warrior')) return 'asgard';
            return 'other';
        };

        const getRoleKey = (role) => {
            const s = normalize(role);
            if (s.includes('tank') || s.includes('def') || s.includes('tanque')) return 'tank';
            if (s.includes('warrior') || s.includes('guerrier') || s.includes('guerreiro')) return 'warrior';
            if (s.includes('assassin') || s.includes('asesino')) return 'assassin';
            if (s.includes('support') || s.includes('suporte') || s.includes('apoyo')) return 'support';
            if (s.includes('skill') || s.includes('technique') || s.includes('técnica')) return 'skill';
            return 'other';
        };

        const getAttackTypeKey = (type) => {
            const s = normalize(type);
            if (s.includes('physical') || s.includes('fisico') || s.includes('físico')) return 'physical';
            if (s.includes('magical') || s.includes('cosmo') || s.includes('mágico')) return 'magical';
            return 'other';
        };

        for (const char of characters) {
            const row = normalizeRow(char.positioning);
            const factionKey = getFactionKey(char.faction);
            const roleKey = getRoleKey(char.combatPosition);
            const attackTypeKey = getAttackTypeKey(char.attackType);

            await db.collection('characters').updateOne(
                { _id: char._id },
                {
                    $set: {
                        row,
                        factionKey,
                        roleKey,
                        attackTypeKey
                    }
                }
            );
            updatedCount++;
        }

        console.log(`Migrated ${updatedCount} characters.`);
    },

    async down(db, client) {
        // Optionally unset the fields
        await db.collection('characters').updateMany(
            {},
            {
                $unset: {
                    row: "",
                    factionKey: "",
                    roleKey: "",
                    attackTypeKey: ""
                }
            }
        );
    }
};
