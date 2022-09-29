const axios = require("axios").default;
const launchMongo = require("./launches.mongo");
// It make sense when we directly call `planets.mongo.js`,
// because they're both Mongo-specific
const planetMongo = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

const launch = {
  flightNumber: DEFAULT_FLIGHT_NUMBER, // `flight_number` by SpaceX APIs
  mission: "Kepler Exploration X", // `name` by SpaceX APIs
  rocket: "Explorer IS1", // `rocket.name` by SpaceX APIs
  launchDate: new Date("December 27, 2030"), // `date_local` by SpaceX APIs
  target: "Kepler-62 f", // not applicable by SpaceX APIs
  customers: ["ZTM", "NASA"], // `payload.customers` for each payload by SpaceX APIs
  upcoming: true, // `upcoming` by SpaceX APIs
  success: true, // `success` by SpaceX APIs
};

// saveLaunch(launch);

async function getAllLaunches({ skip, limit }) {
  return await launchMongo
    .find({}, { _id: 0, __v: 0 }) // excludes `_id` & `__v`
    .sort({ flightNumber: 1 }) // sort (asc) by `flightNumber`
    .skip(skip)
    .limit(limit);
}

async function findLaunch(filter) {
  return await launchMongo.findOne(filter);
}

async function existsLaunchWithLaunchId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  // The `-` prefix means `descending`
  // https://mongoosejs.com/docs/api.html#query_Query-sort
  const latestLaunch = await launchMongo.findOne().sort("-flightNumber");

  if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;

  return latestLaunch.flightNumber;
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4";

async function populateLaunches() {
  console.log("Downloading launch data...");
  try {
    const response = await axios.post(`${SPACEX_API_URL}/launches/query`, {
      query: {},
      options: {
        pagination: false,
        populate: [
          { path: "rocket", select: { name: 1 } },
          { path: "payloads", select: { customers: 1 } },
        ],
      },
    });

    if (response.status !== 200) {
      console.log("Problem downloading launch data");
      throw new Error("Launch data download failed");
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
      const { payloads } = launchDoc;
      const customers = payloads.flatMap((pl) => pl["customers"]);

      const launch = {
        flightNumber: launchDoc.flight_number,
        mission: launchDoc.name,
        rocket: launchDoc.rocket.name,
        launchDate: launchDoc.date_local,
        upcoming: launchDoc.upcoming,
        success: launchDoc.success,
        customers,
      };

      await saveLaunch(launch);
    }
    console.log("");

    // TODO: Populate launches (save to our nasa database)
  } catch (error) {
    console.error(error);
  }
}

async function loadLaunchesData() {
  /**
   * * The following step is made to save API load.
   * * if it does, we're almost safe to skip the remote loading step.
   * TODO: The mechanism can be further enhanced as a standalone script to check and add only the non-existing remote data.
   */

  // ! The `firstLaunch` should be acquired with a better approach.
  // ! In short, it's not so professional doing so.
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  // * If first launch exists, we've already loaded them successfully since last time.
  if (firstLaunch) {
    console.log(`Launch data already loaded!`);
    return; // stop further execution
  }

  // Populate launch data
  populateLaunches();
}

async function saveLaunch(launch) {
  // ! We've moved the checking of planet's existence to `.scheduleNewLaunch()`
  await launchMongo.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  // ! Checking if a plant exists only matters with our NASA App.
  // ! Therefore, it was moved from `.saveLaunch()` to this `.scheduleNewLaunch()`
  const planet = await planetMongo.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet found!");
  }

  // * Planet is valid, proceed to scheduling a new launch
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["Zero To Mastery", "NASA"],
    flightNumber: latestFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchMongo.updateOne(
    { flightNumber: launchId },
    {
      upcoming: false,
      success: false,
    }
  );

  console.log(aborted);
  // aborted.modifiedCount === 1 // the number of modified documents
  // (*) Different Mongoose version may differ in how it returns success properties.
  // Be aware of checking Mongoose Documents regularly.
  return aborted.modifiedCount === 1;
}

// It's always good to use the same orders for exports as you do for your function definitions
module.exports = {
  getAllLaunches,
  loadLaunchesData,
  existsLaunchWithLaunchId,
  scheduleNewLaunch,
  abortLaunchById,
};
