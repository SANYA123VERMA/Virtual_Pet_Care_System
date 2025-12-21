const mongoose = require('mongoose');
require('dotenv').config();
require('./models/mongoConnection');
const Subscription = require('./models/subscription');
const Pet = require('./models/pets');

const check = async () => {
    try {
        const subs = await Subscription.find({});
        console.log(`Total Subscriptions: ${subs.length}`);
        subs.forEach(s => console.log(`Sub User: ${s.userId}, Endpoint: ${s.endpoint.substring(0, 20)}...`));

        const pets = await Pet.find({});
        console.log(`Total Pets: ${pets.length}`);
        pets.forEach(p => {
            console.log(`Pet: ${p.PetName}, ParentID: ${p.ParentID}`);
            p.Reminders.forEach(r => console.log(`  - Reminder: ${r.Title}, Date: ${r.Date}`));
        });

        setTimeout(() => process.exit(0), 1000);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

check();
