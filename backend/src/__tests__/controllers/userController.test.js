const {
  updateUser,
  getUserStats,
} = require("../../controllers/userController");
const User = require("../../models/User");

jest.mock("../../models/User");

describe("UserController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("updateUser", () => {
    it("should update user successfully with all fields", async () => {
      req.params.id = "1";
      req.body = {
        name: "Updated Name",
        email: "updated@example.com",
        birthday: "1990-01-01",
        phone_number: "1234567890",
        address: "123 Updated St",
      };

      const mockUpdatedUser = {
        id: 1,
        ...req.body,
        tier: "bronze",
      };

      User.update.mockResolvedValue(mockUpdatedUser);

      await updateUser(req, res);

      expect(User.update).toHaveBeenCalledWith("1", {
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        phone_number: req.body.phone_number,
        address: req.body.address,
      });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it("should update user with null optional fields", async () => {
      req.params.id = "1";
      req.body = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const mockUpdatedUser = {
        id: 1,
        name: req.body.name,
        email: req.body.email,
        birthday: null,
        phone_number: null,
        address: null,
      };

      User.update.mockResolvedValue(mockUpdatedUser);

      await updateUser(req, res);

      expect(User.update).toHaveBeenCalledWith("1", {
        name: req.body.name,
        email: req.body.email,
        birthday: null,
        phone_number: null,
        address: null,
      });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it("should return 400 if name is missing", async () => {
      req.params.id = "1";
      req.body = {
        email: "updated@example.com",
      };

      await updateUser(req, res);

      expect(User.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Name and email are required",
      });
    });

    it("should return 400 if email is missing", async () => {
      req.params.id = "1";
      req.body = {
        name: "Updated Name",
      };

      await updateUser(req, res);

      expect(User.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Name and email are required",
      });
    });

    it("should return 404 if user not found", async () => {
      req.params.id = "999";
      req.body = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      User.update.mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      req.body = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const dbError = new Error("Database update failed");
      User.update.mockRejectedValue(dbError);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update user profile",
      });
    });
  });

  describe("getUserStats", () => {
    it("should return user stats successfully", async () => {
      req.params.id = "1";
      const mockUser = {
        id: 1,
        xp: 100,
        likes_received: 5,
      };

      User.getUserProfile.mockResolvedValue(mockUser);

      await getUserStats(req, res);

      expect(User.getUserProfile).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        xp: 100,
        likes_received: 5,
      });
    });

    it("should return 0 for missing xp and likes_received", async () => {
      req.params.id = "1";
      const mockUser = {
        id: 1,
        xp: null,
        likes_received: null,
      };

      User.getUserProfile.mockResolvedValue(mockUser);

      await getUserStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        xp: 0,
        likes_received: 0,
      });
    });

    it("should return 404 if user not found", async () => {
      req.params.id = "999";
      User.getUserProfile.mockResolvedValue(null);

      await getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      const dbError = new Error("Database error");
      User.getUserProfile.mockRejectedValue(dbError);

      await getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch user stats",
      });
    });
  });
});
