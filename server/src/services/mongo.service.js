const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URL;

mongoose.connection.once("open", () =>
  console.log(`MongoDB connection succeeded!`)
);
mongoose.connection.on("error", (error) =>
  console.error("MongoDB connection failed!", error)
);

async function mongoConnect() {
  await mongoose.connect(MONGO_URI);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
