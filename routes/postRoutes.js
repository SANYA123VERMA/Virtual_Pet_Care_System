const router = require("express").Router();
const auth = require("../middleware/auth");
const { upload } = require("../models/setLocStorage");
const { createPost, getAllPosts, getPostsByCategory, likePost, deletePost, addComment, repost, getPostsByUser } = require("../controllers/PostController");

router.post("/", auth, (req, res, next) => {
    console.log("Entering Upload Middleware");
    upload.single("file")(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(500).json({ msg: "File Upload Error", error: err.message });
        }
        console.log("Upload Middleware Success");
        next();
    });
}, createPost);
router.get("/", auth, getAllPosts);
router.get("/category/:cat", auth, getPostsByCategory);
router.put("/like/:id", auth, likePost);
router.delete("/:id", auth, deletePost);
router.post("/comment/:id", auth, addComment);
router.post("/repost/:id", auth, repost);
router.get("/user/:id", auth, getPostsByUser);

module.exports = router;
