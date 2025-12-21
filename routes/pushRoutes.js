const router = require("express").Router();
const Subscription = require("../models/subscription");
const webpush = require("web-push");

// Store this securely! For now hardcoding as requested for "perfect" immediate execution.
const publicVapidKey = "BK9M-mGggQw8bsFVWSAflQRwdefprehKMHHim5nKrxqXhyNNfDxzUFEI9Cxh0U2HdtnJD_yAkenopAJOQmV2v-A";
const privateVapidKey = "avSGCDZ69h8tEocPawgHdLoBJ6mMBi5Qnj-5iPHaf1o";

webpush.setVapidDetails(
    "mailto:test@test.com",
    publicVapidKey,
    privateVapidKey
);

router.post("/subscribe", async (req, res) => {
    const subscription = req.body;
    const userId = req.body.userId; // Optional, passed if logged in

    try {
        // Check if exists
        const exists = await Subscription.findOne({ endpoint: subscription.endpoint });
        if (exists) {
            // Update userId if provided and different
            if (userId && exists.userId !== userId) {
                exists.userId = userId;
                await exists.save();
            }
            return res.status(200).json(exists);
        }

        const newSub = new Subscription({
            userId: userId,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
        });

        await newSub.save();
        res.status(201).json({});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

module.exports = router;
