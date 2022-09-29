const express = require("express");
const { httpGetAllPlanets } = require("./planets.controller");

const router = express.Router();

router.route("/").get(httpGetAllPlanets);

module.exports = router;
