const http = require("http");

// Firstly loaded before any other modules
require("dotenv").config();

const app = require("./app");
const { loadLaunchesData } = require("./models/launches.model");
const { loadPlanetsData } = require("./models/planets.model");
const { mongoConnect } = require("./services/mongo.service");

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.on("error", (err) => {
  console.error("Failed to start the web server!!", err.message);
});

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoConnect();

    // Only start the server if `loadPlanetsData` successfully resolves
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
}

startServer();
