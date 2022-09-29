const fs = require("fs");
const { join } = require("path");
const parse = require("csv-parse");
const planetMongo = require("./planets.mongo");

function isHabitablePlanet({ koi_disposition, koi_insol, koi_prad }) {
  return (
    koi_disposition === "CONFIRMED" &&
    koi_insol > 0.36 &&
    koi_insol < 1.11 &&
    koi_prad < 1.6
  );
}

function loadPlanetsData() {
  // Use Promise to wait for the this function gets resolved before accepting any incoming requests in our controller.
  return new Promise((resolve, reject) => {
    const dataFile = join(__dirname, "..", "data", "kepler_data.csv");

    fs.createReadStream(dataFile)
      .pipe(
        parse({
          comment: "#",
          relax: true,
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.error(err.message);
        reject(err);
      })
      .on("end", async () => {
        const countPlanets = (await getAllPlanets()).length;
        console.log(`There are ${countPlanets} habitable planets found!`);
        resolve();
      });
  });
}

async function savePlanet({ kepler_name }) {
  try {
    await planetMongo.updateOne(
      {
        keplerName: kepler_name,
      },
      { keplerName: kepler_name },
      { upsert: true } // if no document found, insert a new document. Otherwise, update the existing document
    );
  } catch (error) {
    console.error(`Could not save planet ${error}`);
  }
}

async function getAllPlanets() {
  return await planetMongo.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
