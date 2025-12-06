const request = require("supertest");
const express = require("express");
const authRouter = require("../../routes/auth");
const { signup, login } = require("../../controllers/authController");

jest.mock("../../controllers/authController");

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/auth/test", () => {
    it("should return test message", async () => {
      const response = await request(app).get("/api/auth/test").expect(200);

      expect(response.body).toEqual({
        message: "Auth routes are working! 🎉",
      });
    });
  });

  describe("POST /api/auth/signup", () => {
    it("should call signup controller", async () => {
      signup.mockImplementation((req, res) => {
        res.json({ message: "User created" });
      });

      await request(app)
        .post("/api/auth/signup")
        .send({ email: "test@example.com", password: "password123" })
        .expect(200);

      expect(signup).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should call login controller", async () => {
      login.mockImplementation((req, res) => {
        res.json({ message: "Login successful" });
      });

      await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" })
        .expect(200);

      expect(login).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/verify-ucr-email", () => {
    it("should return TODO message", async () => {
      const response = await request(app)
        .post("/api/auth/verify-ucr-email")
        .expect(200);

      expect(response.body).toEqual({
        message: "UCR email verification - TODO",
      });
    });
  });
});
