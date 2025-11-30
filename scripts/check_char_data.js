const mongoose = require('mongoose');
const Character = require('../packages/server/src/models/Character');

mongoose.connect('mongodb://localhost:27017/ssex', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('MongoDB Connected');
        const char = await Character.findOne();
        if (char) {
            console.log('Name:', char.name);
            console.log('Faction:', char.faction);
            console.log('Positioning:', char.positioning);
            console.log('CombatPosition:', char.combatPosition);
        } else {
            console.log('No character found');
        }
        process.exit(0);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
