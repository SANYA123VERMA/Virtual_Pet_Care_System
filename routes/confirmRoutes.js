const router = require("express").Router();
const { confirmUser } = require("../controllers/ConfirmController");

router.get("/verify/:token", confirmUser);

module.exports = router;
