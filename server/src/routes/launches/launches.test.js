const request = require("supertest");
const { loadPlanetsData } = require("../../models/planets.model");
const {
  mongoConnect,
  mongoDisconnect,
} = require("../../services/mongo.service");
const app = require("./../../app");

const getApiUrl = function (path) {
  return `/v1/${path}`;
};

describe("Launches API", () => {
  // Connect to database before any request
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  // Disconnect after any test
  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    // Success case
    test("It should respond with 200 success", async () => {
      await request(app)
        .get(getApiUrl("launches"))
        .expect("Content-Type", /json/)
        .expect(200);

      /** Alternative to the above method */
      // const response = await request(app).get("/launches");
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "ZTM155",
      rocket: "ZTM Experimental IS1",
      target: "Kepler-62 f",
      launchDate: "February 17, 2030",
    };

    const launchDataWithoutDate = { ...completeLaunchData };
    delete launchDataWithoutDate.launchDate;

    const launchDataWithInvalidDate = { ...completeLaunchData };
    launchDataWithInvalidDate.launchDate = "hello date";

    // Success case
    test("It should respond with 200 success", async () => {
      // Success in sending POST request
      const response = await request(app)
        .post(getApiUrl("/launches"))
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      // Success in acquiring a valid launchDate
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);

      // Success in checking if `launchDataWithoutDate` is a subset of `response.body`
      // https://jestjs.io/docs/expect#tomatchobjectobject
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    // Failure case
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post(getApiUrl("/launches"))
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required Launch fields",
      });
    });
    test("It should catch invalid date", async () => {
      const response = await request(app)
        .post(getApiUrl("/launches"))
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
