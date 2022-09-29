const { Schema, model } = require("mongoose");

// Names of properties should be consistent across backend & frontend
const planetsSchema = new Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

// The 1st argument passed on is a `capitalized & Singular name`,
// Mongoose then converts it to a plural lowercase one that represents many documents.
module.exports = model("Planet", planetsSchema);
