const router = require("express").Router();
const controllers = require("../controllers");
const checkAuth = require("../middleware/auth");
const db = require("../config/connection");

// router.get("/", ({ session: { isLoggedIn } }, res) => {
//     res.render("index", { isLoggedIn });
// });

router.get("/", async (req, res) => {
    try {
        const isLoggedIn = req.session.isLoggedIn;
        const userId = req.session.userId;

        if (!isLoggedIn || !userId) {
            return res.render("index", { isLoggedIn });
        }

        const [cards] = await db.query(
            `SELECT *,
            CASE
            WHEN DATE_FORMAT(date_of_collection, "%m/%d/%Y") = "01/01/1900" THEN NULL
            ELSE DATE_FORMAT(date_of_collection, "%m/%d/%Y")
           END AS formattedDate
            FROM mycollections WHERE user_id = ?`,
            [userId]
        );

        res.render("index", { isLoggedIn, cards });
    } catch (err) {
        console.error("Error loading collection:", err);
        res.status(500).end();
    }
});

router.get("/login", async (req, res) => {
    if (req.session.isLoggedIn) return res.redirect("/");
    res.render("login", { error: req.query.error });
});

router.get("/signup", async (req, res) => {
    if (req.session.isLoggedIn) return res.redirect("/");
    res.render("signup", { error: req.query.error });
});

router.get("/private", checkAuth, ({ session: { isLoggedIn } }, res) => {
    res.render("protected", { isLoggedIn });
});

router.get("/search", async (req, res) => {
    const searchInput = req.query.name;
    if (!searchInput) return res.render("search", { cards: [] });

    try {
        const response = await fetch(
            `https://api.pokemontcg.io/v2/cards?q=name:${searchInput}&pageSize=9`,
            {
                headers: {
                    "X-Api-Key": process.env.API_KEY,
                },
            }
        );

        const data = await response.json();
        const cards = data.data.map((card) => ({
            name: card.name,
            image: card.images?.small || "",
        }));

        res.render("search", { cards });
    } catch (err) {
        console.log("router.get /search err:", err);
    }
});

router.get("/collection", checkAuth, async (req, res) => {
    try {
        const [cards] = await db.query(
            "SELECT * FROM mycollections WHERE user_id=?",
            [req.session.userId]
        );

        res.render("collection", {
            loggedIn: req.session.loggedIn,
            cards,
        });
    } catch (err) {
        res.status(500).end();
    }
});

module.exports = router;
