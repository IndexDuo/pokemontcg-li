const router = require("express").Router();
const controllers = require("../controllers");
const checkAuth = require("../middleware/auth");
// const db = require("../db")
const db = require("../config/connection");

// admin login/logout
router.post("/login", controllers.auth.login);
router.get("/logout", controllers.auth.logout);
router.post("/signup", controllers.user.create);

//add card
router.post("/cards", async (req, res) => {
    try {
        const { card_name, image, date_of_collection } = req.body;

        await db.query(
            `insert INTO mycollections (card_name, image, date_of_collection) VALUES (?,?,?)`,
            [card_name, image, date_of_collection]
        );
        res.redirect("/collections");
    } catch (err) {
        res.status(500).end();
    }
});

module.exports = router;
