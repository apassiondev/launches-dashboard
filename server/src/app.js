const express = require("express");
const { join } = require("path");
const cors = require("cors");
const morgan = require("morgan");
const apiRouter = require("./routes/api");

const app = express();

// Middleware
// CORS will apply to all of our requests, so place it on top.
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

// Routing
app.use("/v1", apiRouter);

// Serve the build React frontend
// IMPORTANT: Use '*' to catch the URL path that is not found in any of the above routes
// e.g: When Express sees one of the above paths that dont match any of our routes, it passes it
// on to our React app at index.html so that the frontend can handle the routing.
app.get("/*", (req, res) =>
  res.sendFile(join(__dirname, "..", "public", "index.html"))
);

module.exports = app;
