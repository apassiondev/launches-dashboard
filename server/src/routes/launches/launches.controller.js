const {
  getAllLaunches,
  abortLaunchById,
  scheduleNewLaunch,
  existsLaunchWithLaunchId,
} = require("../../models/launches.model");
const { getPaginationParams } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPaginationParams(req.query);

  return res.status(200).json(await getAllLaunches({ skip, limit }));
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  // Validation
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required Launch fields",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  // Validation of launchDate
  // Read the Notes.md to learn more
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  // addNewLaunch(launch);
  await scheduleNewLaunch(launch);

  return res
    .status(201) // CREATED status code
    .json(launch);
}

async function httpAbortLaunch(req, res) {
  // Be cautious about what type of data we may expect.
  // Incoming request body is always String.
  // In this case, we need a Number, so let's do a type casting
  const launchId = Number(req.params.id);

  // Existence checking
  const isExistingLaunch = await existsLaunchWithLaunchId(launchId);

  // Not found launch
  if (!isExistingLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  // Launch found
  const aborted = await abortLaunchById(launchId);

  // Abort failed
  if (!aborted) {
    // Always return consistent response to client
    // This way eases the way client handles the responses.
    return res.status(400).json({
      error: "Launch not aborted!",
    });
  }

  res.status(200).json(aborted);
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
