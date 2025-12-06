const request = require("supertest");
const express = require("express");
const userRouter = require("../../routes/user");
const {
  updateUser,
  getUserStats,
} = require("../../controllers/userController");

jest.mock("../../controllers/userController");
jest.mock("../../middleware/auth", () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1 };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/test", () => {
    it("should return test message", async () => {
      const response = await request(app).get("/api/users/test").expect(200);

      expect(response.body).toEqual({
        message: "User routes are working!",
      });
    });
  });

  describe("GET /api/users/:id/stats", () => {
    it("should call getUserStats controller", async () => {
      getUserStats.mockImplementation((req, res) => {
        res.json({ xp: 100, likes_received: 5 });
      });

      await request(app).get("/api/users/1/stats").expect(200);

      expect(getUserStats).toHaveBeenCalled();
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should call updateUser controller with authentication", async () => {
      updateUser.mockImplementation((req, res) => {
        res.json({ id: 1, name: "Updated User" });
      });

      await request(app)
        .put("/api/users/1")
        .send({ name: "Updated User" })
        .expect(200);

      expect(updateUser).toHaveBeenCalled();
    });
  });
});
