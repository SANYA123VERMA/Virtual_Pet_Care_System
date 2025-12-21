const mongoose = require('mongoose');
require('dotenv').config();
require('./models/mongoConnection');
const User = require('./models/userModel');

console.log("--- DEBUGGING ENVIRONMENT ---");
console.log(`MAIL_USER: ${process.env.MAIL_USER ? 'LOADED (' + process.env.MAIL_USER + ')' : 'MISSING'}`);
console.log(`MAIL_PASS: ${process.env.MAIL_PASS ? 'LOADED' : 'MISSING'}`);
console.log("----------------------------");

const fs = require('fs');

const checkUsers = async () => {
    try {
        const users = await User.find({});
        const debugData = {
            MAIL_USER: process.env.MAIL_USER ? 'LOADED' : 'MISSING',
            MAIL_PASS: process.env.MAIL_PASS ? 'LOADED' : 'MISSING',
            users: users.map(u => ({ email: u.email, displayName: u.displayName, confirmed: u.confirmed }))
        };

        fs.writeFileSync('users_list.json', JSON.stringify(debugData, null, 2));
        console.log("Data written to users_list.json");

        setTimeout(() => process.exit(0), 1000);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

// Wait for connection
setTimeout(checkUsers, 2000);
