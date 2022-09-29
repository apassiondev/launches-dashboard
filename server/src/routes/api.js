const router = require("express").Router();

const planetsRouter = require("./planets/planets.route");
const launchesRouter = require("./launches/launches.route");

router.use("/planets", planetsRouter);
router.use("/launches", launchesRouter);

module.exports = router;
