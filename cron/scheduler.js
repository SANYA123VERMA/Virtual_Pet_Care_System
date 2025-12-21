const cron = require("node-cron");
const webpush = require("web-push");
const Pet = require("../models/pets"); // Adjust path if needed
const Subscription = require("../models/subscription");

// Initialize Web Push (using keys from vapid.json content I observed)
// In production, use process.env
const publicVapidKey = "BK9M-mGggQw8bsFVWSAflQRwdefprehKMHHim5nKrxqXhyNNfDxzUFEI9Cxh0U2HdtnJD_yAkenopAJOQmV2v-A";
const privateVapidKey = "avSGCDZ69h8tEocPawgHdLoBJ6mMBi5Qnj-5iPHaf1o";

webpush.setVapidDetails(
    "mailto:example@yourdomain.org",
    publicVapidKey,
    privateVapidKey
);

const checkReminders = async () => {
    try {
        const now = new Date();
        const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const currentDay = daysMap[now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        console.log(`[Scheduler] Running at ${now.toISOString()} (Local: ${currentHour}:${currentMinute})`);

        // 1. Get all Pets with Reminders
        // Optimization: In a large app, we'd query better. For now, fetch all.
        const pets = await Pet.find({ "Reminders.0": { $exists: true } });
        console.log(`[Scheduler] Found ${pets.length} pets with reminders.`);

        for (const pet of pets) {
            for (const rem of pet.Reminders) {
                let isDue = false;
                const remDate = new Date(rem.Date); // Note: Date object handling might need care if stored as UTC but compared to local server time?
                // The existing app seems to use client local time for setting.
                // Assuming server and client are in same timezone or Dates are stored with TZ info.
                // Mongo dates are UTC.
                // WE need to convert UTC date to "Time" components if Frequency is Daily/Weekly.
                // However, the `Reminders.js` logic uses `remDate.getHours()` which operates on the local date of the browser.
                // In Node, `remDate.getHours()` will use Server Local Time (or UTC if we use getUTCHours).
                // Let's stick to UTC matching to avoid TZ mess if possible, OR assume server time matches user time (common for single user / local dev).
                // But the user's browser is 5:30 ahead of UTC (India). user's server might be local.
                // Safest is to compare against time stored.

                // Let's use the stored Date object's time.
                // If the user set it at 10:00 AM IST, it's stored as 4:30 AM UTC.
                // If I check at 10:00 AM IST (Server time), the UTC time is 4:30 AM.
                // So if `remDate` is a Date object, `remDate.getHours()` is questionable depending on where it is run.

                // Let's try to match logic from Reminders.js:
                // `const remDate = new Date(rem.Date);`
                // `if (now.getHours() === remDate.getHours() ...)`
                // The `Reminders.js` logic runs in Browser, so `remDate` is converted to Browser Local Time.
                // `now` is Browser Local Time.
                // So it works.

                // On Server:
                // `now` is Server Local Time.
                // `remDate` will be converted to Server Local Time.
                // IF Server Timezone == Browser Timezone, it works.
                // If User is in India and Server is in US, it will fail.
                // Assuming User is running this LOCALLY (localhost server), so Timezones match.

                const rHours = remDate.getHours();
                const rMinutes = remDate.getMinutes();

                if (rem.Frequency === "Daily") {
                    if (currentHour === rHours && currentMinute === rMinutes) {
                        isDue = true;
                    }
                } else if (rem.Frequency === "Weekly") {
                    const isTodaySelected = rem.SelectedDays && rem.SelectedDays.includes(currentDay);
                    if (isTodaySelected && currentHour === rHours && currentMinute === rMinutes) {
                        isDue = true;
                    }
                } else {
                    // Once - this is tricky with "exact minute" check
                    // We check if "now" is roughly equal to "remDate"
                    // diff between now and remDate < 1 min?
                    // actually remDate is the trigger time.
                    // compare currentHour/Min and also Month/Year/Day
                    if (
                        now.getFullYear() === remDate.getFullYear() &&
                        now.getMonth() === remDate.getMonth() &&
                        now.getDate() === remDate.getDate() &&
                        now.getHours() === rHours &&
                        now.getMinutes() === rMinutes
                    ) {
                        isDue = true;
                    }
                }

                if (isDue) {
                    // Send Notification
                    // Find subscription for this user (Pet ParentID)
                    const parentId = pet.ParentID;
                    // Subscription has userId field?
                    // We need to match Subscription.userId = pet.ParentID

                    const subscriptions = await Subscription.find({ userId: parentId });

                    const payload = JSON.stringify({
                        title: `Reminder: ${rem.Title}`,
                        body: `It's time for ${pet.PetName}'s reminder! ${rem.Note || ''}`,
                        icon: "http://localhost:5000/images/paw_logo.PNG", // Generic bell or pet icon
                    });

                    for (const sub of subscriptions) {
                        try {
                            await webpush.sendNotification({
                                endpoint: sub.endpoint,
                                keys: sub.keys
                            }, payload);
                        } catch (error) {
                            if (error.statusCode === 410 || error.statusCode === 404) {
                                // Subscription expired
                                await Subscription.deleteOne({ _id: sub._id });
                            }
                        }
                    }
                }
            }
        }

    } catch (e) {
        console.error("Error in scheduler:", e);
    }
};

const startScheduler = () => {
    // Run every minute
    cron.schedule("* * * * *", checkReminders); // Every minute
    console.log("Scheduler started.");
};

module.exports = { startScheduler };
