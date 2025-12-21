
const webpush = require('web-push');
const fs = require('fs');
const vapidKeys = webpush.generateVAPIDKeys();

const keys = {
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey
};

fs.writeFileSync('vapid.json', JSON.stringify(keys, null, 2));
console.log('Keys saved to vapid.json');
