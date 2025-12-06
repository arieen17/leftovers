const User = require("../../models/User");
const pool = require("../../../database/config");
const bcrypt = require("bcryptjs");

jest.mock("../../../database/config");
jest.mock("bcryptjs");

describe("User Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
      };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail("test@example.com");

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = $1",
        ["test@example.com"],
      );
      expect(result).toEqual(mockUser);
    });

    it("should return undefined when user not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail("nonexistent@example.com");

      expect(result).toBeUndefined();
    });
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        [1],
      );
      expect(result).toEqual(mockUser);
    });

    it("should return undefined when user not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "new@example.com",
        password: "hashed_password",
        name: "New User",
        birthday: "1990-01-01",
        phone_number: "1234567890",
        address: "123 Test St",
      };
      const mockUser = { id: 1, ...userData, tier: "bronze" };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.create(userData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        [
          userData.email,
          userData.password,
          userData.name,
          userData.birthday,
          userData.phone_number,
          userData.address,
        ],
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("verifyPassword", () => {
    it("should verify password correctly", async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await User.verifyPassword("plain", "hashed");

      expect(bcrypt.compare).toHaveBeenCalledWith("plain", "hashed");
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await User.verifyPassword("wrong", "hashed");

      expect(result).toBe(false);
    });
  });

  describe("update", () => {
    it("should update user with all fields", async () => {
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
        birthday: "1990-01-01",
      };
      const mockUpdatedUser = { id: 1, ...updateData };
      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });

      const result = await User.update(1, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users"),
        expect.arrayContaining([
          updateData.name,
          updateData.email,
          updateData.birthday,
          1,
        ]),
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it("should update user with partial fields", async () => {
      const updateData = { name: "New Name" };
      const mockUpdatedUser = { id: 1, name: "New Name" };
      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });

      const result = await User.update(1, updateData);

      expect(result).toEqual(mockUpdatedUser);
    });

    it("should throw error when no fields to update", async () => {
      await expect(User.update(1, {})).rejects.toThrow("No fields to update");
    });

    it("should ignore undefined fields", async () => {
      const updateData = { name: "New Name", email: undefined };
      const mockUpdatedUser = { id: 1, name: "New Name" };
      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });

      const result = await User.update(1, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users"),
        expect.arrayContaining(["New Name", 1]),
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe("getUserProfile", () => {
    it("should get user profile by id", async () => {
      const mockProfile = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        tier: "bronze",
        xp: 100,
        likes_received: 5,
      };
      pool.query.mockResolvedValue({ rows: [mockProfile] });

      const result = await User.getUserProfile(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT id, email, name, tier, xp, likes_received",
        ),
        [1],
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe("addXP", () => {
    it("should add XP to user", async () => {
      const mockResult = { id: 1, xp: 150, likes_received: 5 };
      pool.query.mockResolvedValue({ rows: [mockResult] });

      const result = await User.addXP(1, 50);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users"),
        [50, 1],
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("incrementLikes", () => {
    it("should increment likes received by default amount", async () => {
      const mockResult = { id: 1, xp: 100, likes_received: 6 };
      pool.query.mockResolvedValue({ rows: [mockResult] });

      const result = await User.incrementLikes(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users"),
        [1, 1],
      );
      expect(result).toEqual(mockResult);
    });

    it("should increment likes received by custom amount", async () => {
      const mockResult = { id: 1, xp: 100, likes_received: 10 };
      pool.query.mockResolvedValue({ rows: [mockResult] });

      const result = await User.incrementLikes(1, 5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users"),
        [5, 1],
      );
      expect(result).toEqual(mockResult);
    });
  });
});
