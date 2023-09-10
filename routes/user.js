const express = require("express");
const router = express.Router();

// TODO update routes

const { check_access_token } = require("../middlewares/check_access_token");

const {
  sign_in,
  sign_up,
  spam,
  searchAll,
  search,
} = require("../controllers/user");

router.post("/sign-in", sign_in);
router.post("/sign-up", sign_up);
router.post("/spam/:number", check_access_token, spam);

router.get("/searchAll/:field", check_access_token, searchAll);
router.get("/search/:field", check_access_token, search);

module.exports = router;
