const { authenticate } = require("../../middleware/auth");
const { verifyToken } = require("../../utils/jwt");

jest.mock("../../utils/jwt");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
    // Suppress console.log during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("authenticate", () => {
    it("should call next() when token is valid", () => {
      const token = "valid_token_here";
      req.header.mockReturnValue(`Bearer ${token}`);
      verifyToken.mockReturnValue({ userId: 1 });

      authenticate(req, res, next);

      expect(req.header).toHaveBeenCalledWith("Authorization");
      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual({ userId: 1 });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 when no Authorization header", () => {
      req.header.mockReturnValue(null);

      authenticate(req, res, next);

      expect(req.header).toHaveBeenCalledWith("Authorization");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied. No token provided.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when Authorization header is empty", () => {
      req.header.mockReturnValue("");

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied. No token provided.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should extract token from Bearer format", () => {
      const token = "my_token_123";
      req.header.mockReturnValue(`Bearer ${token}`);
      verifyToken.mockReturnValue({ userId: 2 });

      authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual({ userId: 2 });
      expect(next).toHaveBeenCalled();
    });

    it("should handle token without Bearer prefix", () => {
      const token = "token_without_bearer";
      req.header.mockReturnValue(token);
      verifyToken.mockReturnValue({ userId: 3 });

      authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual({ userId: 3 });
      expect(next).toHaveBeenCalled();
    });

    it("should return 401 when token verification fails", () => {
      const token = "invalid_token";
      req.header.mockReturnValue(`Bearer ${token}`);
      const error = new Error("Invalid token");
      verifyToken.mockImplementation(() => {
        throw error;
      });

      authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid token",
        message: error.message,
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should handle token with extra spaces", () => {
      const token = "token_with_spaces";
      req.header.mockReturnValue(`Bearer  ${token}  `);
      verifyToken.mockReturnValue({ userId: 4 });

      authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(` ${token}  `);
    });

    it("should set req.user with decoded token data", () => {
      const token = "valid_token";
      const decoded = { userId: 5, email: "test@example.com" };
      req.header.mockReturnValue(`Bearer ${token}`);
      verifyToken.mockReturnValue(decoded);

      authenticate(req, res, next);

      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalled();
    });
  });
});
