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
router.post("/collection", checkAuth, async (req, res) => {
    try {
        const { card_name, image, date_of_collection } = req.body;

        await db.query(
            `INSERT INTO mycollections (user_id, card_name, image, date_of_collection)
       VALUES (?, ?, ?, ?)`,
            [
                req.session.userId,
                card_name,
                image,
                date_of_collection || "1900-01-01",
            ]
        );

        res.redirect("/");
    } catch (err) {
        res.status(500).end;
    }
});

// remove card
router.post("/collection/:id", checkAuth, async (req, res) => {
    try {
        await db.query("DELETE FROM mycollections WHERE id=? AND user_id=?", [
            req.params.id,
            req.session.userId,
        ]);
        res.redirect("/");
    } catch (err) {
        res.status(500).end;
    }
});

module.exports = router;
