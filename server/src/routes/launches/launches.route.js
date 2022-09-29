const express = require("express");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require("./launches.controller");

const router = express.Router();

router.route("/").get(httpGetAllLaunches).post(httpAddNewLaunch);
router.route("/:id").delete(httpAbortLaunch);

module.exports = router;
