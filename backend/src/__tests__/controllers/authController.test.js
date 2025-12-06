const { signup, login } = require("../../controllers/authController");
const User = require("../../models/User");
const { generateToken } = require("../../utils/jwt");
const bcrypt = require("bcryptjs");

jest.mock("../../models/User");
jest.mock("../../utils/jwt");
jest.mock("bcryptjs");
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("AuthController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        birthday: "1990-01-01",
        phone_number: "1234567890",
        address: "123 Test St",
      };

      req.body = userData;

      User.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_password");

      const mockUser = {
        id: 1,
        email: userData.email,
        name: userData.name,
        tier: "bronze",
        birthday: userData.birthday,
        phone_number: userData.phone_number,
        address: userData.address,
      };
      User.create.mockResolvedValue(mockUser);
      generateToken.mockReturnValue("mock_jwt_token");

      await signup(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        password: "hashed_password",
        name: userData.name,
        birthday: userData.birthday,
        phone_number: userData.phone_number,
        address: userData.address,
      });
      expect(generateToken).toHaveBeenCalledWith(mockUser.id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        token: "mock_jwt_token",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          tier: mockUser.tier,
          birthday: mockUser.birthday,
          phone_number: mockUser.phone_number,
          address: mockUser.address,
        },
      });
    });

    it("should return 400 if user already exists", async () => {
      const userData = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      };

      req.body = userData;
      User.findByEmail.mockResolvedValue({ id: 1, email: userData.email });

      await signup(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User already exists",
      });
    });

    it("should return 500 on server error", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      req.body = userData;
      User.findByEmail.mockRejectedValue(new Error("Database error"));

      await signup(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Server error during signup",
      });
    });
  });

  describe("login", () => {
    it("should login user successfully with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      req.body = loginData;

      const mockUser = {
        id: 1,
        email: loginData.email,
        name: "Test User",
        tier: "bronze",
        birthday: "1990-01-01",
        phone_number: "1234567890",
        address: "123 Test St",
        password: "hashed_password",
      };

      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(true);
      generateToken.mockReturnValue("mock_jwt_token");

      await login(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(User.verifyPassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(generateToken).toHaveBeenCalledWith(mockUser.id);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: "mock_jwt_token",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          tier: mockUser.tier,
          birthday: mockUser.birthday,
          phone_number: mockUser.phone_number,
          address: mockUser.address,
        },
      });
    });

    it("should return 400 if user does not exist", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      req.body = loginData;
      User.findByEmail.mockResolvedValue(null);

      await login(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(User.verifyPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });

    it("should return 400 if password is invalid", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      req.body = loginData;

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: "hashed_password",
      };

      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(false);

      await login(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(User.verifyPassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });

    it("should return 500 on server error", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      req.body = loginData;
      const dbError = new Error("Database connection failed");
      User.findByEmail.mockRejectedValue(dbError);

      await login(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Server error during login",
      });
    });
  });
});
