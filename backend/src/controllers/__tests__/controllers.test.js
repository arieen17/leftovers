const { signup, login } = require("../authController");
const User = require("../../models/User");
const { generateToken } = require("../../utils/jwt");
const bcrypt = require("bcryptjs");

jest.mock("../../models/User");
jest.mock("../../utils/jwt");
jest.mock("bcryptjs");

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

      // Verify database query was attempted with correct email
      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(User.findByEmail).toHaveBeenCalledTimes(1);
      // Verify no further queries were made after error
      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Server error during signup",
      });
    });

    it("should verify database query parameters match exactly", async () => {
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
      User.create.mockResolvedValue({ id: 1, ...userData, tier: "bronze" });

      await signup(req, res);

      // Verify exact parameters passed to database queries
      expect(User.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: "hashed_password",
          name: "Test User",
          birthday: "1990-01-01",
          phone_number: "1234567890",
          address: "123 Test St",
        })
      );
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
        mockUser.password
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
        mockUser.password
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

      // Verify database query was attempted with correct email
      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(User.findByEmail).toHaveBeenCalledTimes(1);
      // Verify no further queries were made after error
      expect(User.verifyPassword).not.toHaveBeenCalled();
      expect(generateToken).not.toHaveBeenCalled();
      // Verify error is properly handled and response is sent
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Server error during login",
      });
    });

    it("should handle database connection errors correctly", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      req.body = loginData;
      const connectionError = new Error("Connection to database lost");
      connectionError.code = "ECONNREFUSED";
      User.findByEmail.mockRejectedValue(connectionError);

      await login(req, res);

      // Verify error is caught and handled properly
      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(User.verifyPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Server error during login",
      });
    });
  });
});

// ============================================================================
// RESTAURANT CONTROLLER TESTS
// ===========================================================================

const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurantsAndItems,
} = require("../restaurantController");
const Restaurant = require("../../models/Restaurant");
const MenuItemModel = require("../../models/MenuItem");

jest.mock("../../models/Restaurant");
jest.mock("../../models/MenuItem");

describe("RestaurantController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getAllRestaurants", () => {
    it("should return all restaurants successfully", async () => {
      const mockRestaurants = [
        { id: 1, name: "Restaurant 1", address: "123 Main St" },
        { id: 2, name: "Restaurant 2", address: "456 Oak Ave" },
      ];

      Restaurant.findAll.mockResolvedValue(mockRestaurants);

      await getAllRestaurants(req, res);

      expect(Restaurant.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockRestaurants);
    });

    it("should return empty array if no restaurants found", async () => {
      Restaurant.findAll.mockResolvedValue([]);

      await getAllRestaurants(req, res);

      expect(Restaurant.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 on database error", async () => {
      const error = new Error("Database connection failed");
      Restaurant.findAll.mockRejectedValue(error);

      await getAllRestaurants(req, res);

      // Verify database query was attempted
      expect(Restaurant.findAll).toHaveBeenCalled();
      expect(Restaurant.findAll).toHaveBeenCalledTimes(1);
      // Verify error details are included in response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch restaurants",
        details: error.message,
      });
    });

    it("should verify database query is called with no parameters for findAll", async () => {
      Restaurant.findAll.mockResolvedValue([]);

      await getAllRestaurants(req, res);

      // Verify findAll is called with no arguments
      expect(Restaurant.findAll).toHaveBeenCalledWith();
      expect(Restaurant.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getRestaurantById", () => {
    it("should return restaurant by id successfully", async () => {
      req.params.id = "1";
      const mockRestaurant = {
        id: 1,
        name: "Restaurant 1",
        address: "123 Main St",
      };

      Restaurant.findById.mockResolvedValue(mockRestaurant);

      await getRestaurantById(req, res);

      expect(Restaurant.findById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockRestaurant);
    });

    it("should return 404 if restaurant not found", async () => {
      req.params.id = "999";
      Restaurant.findById.mockResolvedValue(null);

      await getRestaurantById(req, res);

      expect(Restaurant.findById).toHaveBeenCalledWith("999");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Restaurant not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      const dbError = new Error("Database query failed");
      Restaurant.findById.mockRejectedValue(dbError);

      await getRestaurantById(req, res);

      // Verify database query was attempted with correct ID
      expect(Restaurant.findById).toHaveBeenCalledWith("1");
      expect(Restaurant.findById).toHaveBeenCalledTimes(1);
      // Verify error is handled and response is sent
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch restaurant",
      });
    });

    it("should handle null result from database query correctly", async () => {
      req.params.id = "999";
      Restaurant.findById.mockResolvedValue(null);

      await getRestaurantById(req, res);

      // Verify query was made with correct ID
      expect(Restaurant.findById).toHaveBeenCalledWith("999");
      // Verify 404 is returned, not 500
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Restaurant not found",
      });
    });
  });

  describe("getRestaurantMenu", () => {
    it("should return restaurant menu successfully", async () => {
      req.params.id = "1";
      const mockMenu = [
        { id: 1, name: "Burger", price: "10.99" },
        { id: 2, name: "Pizza", price: "12.99" },
      ];

      Restaurant.getMenuWithRatings.mockResolvedValue(mockMenu);

      await getRestaurantMenu(req, res);

      expect(Restaurant.getMenuWithRatings).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockMenu);
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      Restaurant.getMenuWithRatings.mockRejectedValue(
        new Error("Database error")
      );

      await getRestaurantMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch menu",
      });
    });
  });

  describe("createRestaurant", () => {
    it("should create restaurant successfully", async () => {
      const restaurantData = {
        name: "New Restaurant",
        address: "789 Elm St",
        phone_number: "555-1234",
      };

      req.body = restaurantData;
      const mockRestaurant = { id: 1, ...restaurantData };

      Restaurant.create.mockResolvedValue(mockRestaurant);

      await createRestaurant(req, res);

      expect(Restaurant.create).toHaveBeenCalledWith(restaurantData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRestaurant);
    });

    it("should return 500 on database error", async () => {
      req.body = { name: "New Restaurant" };
      Restaurant.create.mockRejectedValue(new Error("Database error"));

      await createRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create restaurant",
      });
    });
  });

  describe("updateRestaurant", () => {
    it("should update restaurant successfully", async () => {
      req.params.id = "1";
      req.body = { name: "Updated Restaurant" };
      const mockRestaurant = { id: 1, name: "Updated Restaurant" };

      Restaurant.update.mockResolvedValue(mockRestaurant);

      await updateRestaurant(req, res);

      expect(Restaurant.update).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith(mockRestaurant);
    });

    it("should return 404 if restaurant not found", async () => {
      req.params.id = "999";
      req.body = { name: "Updated Restaurant" };
      Restaurant.update.mockResolvedValue(null);

      await updateRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Restaurant not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      req.body = { name: "Updated Restaurant" };
      Restaurant.update.mockRejectedValue(new Error("Database error"));

      await updateRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update restaurant",
      });
    });
  });

  describe("deleteRestaurant", () => {
    it("should delete restaurant successfully", async () => {
      req.params.id = "1";
      const mockRestaurant = { id: 1, name: "Restaurant 1" };

      Restaurant.delete.mockResolvedValue(mockRestaurant);

      await deleteRestaurant(req, res);

      expect(Restaurant.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Restaurant deleted successfully",
        restaurant: mockRestaurant,
      });
    });

    it("should return 404 if restaurant not found", async () => {
      req.params.id = "999";
      Restaurant.delete.mockResolvedValue(null);

      await deleteRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Restaurant not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      Restaurant.delete.mockRejectedValue(new Error("Database error"));

      await deleteRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to delete restaurant",
      });
    });
  });

  describe("searchRestaurantsAndItems", () => {
    it("should return search results successfully", async () => {
      req.query.q = "pizza";
      const mockRestaurants = [{ id: 1, name: "Pizza Place" }];
      const mockMenuItems = [{ id: 1, name: "Pepperoni Pizza" }];

      Restaurant.search.mockResolvedValue(mockRestaurants);
      MenuItemModel.search.mockResolvedValue(mockMenuItems);

      await searchRestaurantsAndItems(req, res);

      expect(Restaurant.search).toHaveBeenCalledWith("pizza");
      expect(MenuItemModel.search).toHaveBeenCalledWith("pizza");
      expect(res.json).toHaveBeenCalledWith({
        restaurants: mockRestaurants,
        menuItems: mockMenuItems,
      });
    });

    it("should return empty arrays if query is empty", async () => {
      req.query.q = "";

      await searchRestaurantsAndItems(req, res);

      expect(Restaurant.search).not.toHaveBeenCalled();
      expect(MenuItemModel.search).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        restaurants: [],
        menuItems: [],
      });
    });

    it("should return empty arrays if query is whitespace only", async () => {
      req.query.q = "   ";

      await searchRestaurantsAndItems(req, res);

      expect(Restaurant.search).not.toHaveBeenCalled();
      expect(MenuItemModel.search).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        restaurants: [],
        menuItems: [],
      });
    });

    it("should return 500 on database error", async () => {
      req.query.q = "pizza";
      const searchError = new Error("Database error");
      Restaurant.search.mockRejectedValue(searchError);

      await searchRestaurantsAndItems(req, res);

      // Verify both database queries were attempted with correct search term
      expect(Restaurant.search).toHaveBeenCalledWith("pizza");
      expect(MenuItemModel.search).not.toHaveBeenCalled(); // Should stop on first error
      // Verify error details are included
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to search",
        details: "Database error",
      });
    });

    it("should verify both database queries are called with same search term", async () => {
      req.query.q = "burger";
      Restaurant.search.mockResolvedValue([{ id: 1, name: "Burger Place" }]);
      MenuItemModel.search.mockResolvedValue([{ id: 1, name: "Cheeseburger" }]);

      await searchRestaurantsAndItems(req, res);

      // Verify both queries use the same search parameter
      expect(Restaurant.search).toHaveBeenCalledWith("burger");
      expect(MenuItemModel.search).toHaveBeenCalledWith("burger");
      expect(Restaurant.search).toHaveBeenCalledTimes(1);
      expect(MenuItemModel.search).toHaveBeenCalledTimes(1);
    });
  });
});

// ============================================================================
// REVIEW CONTROLLER TESTS
// ============================================================================

const {
  createReview,
  getMenuItemReviews,
  getUserReviews,
  getReviewById,
} = require("../reviewController");
const Review = require("../../models/Review");

jest.mock("../../models/Review");

describe("ReviewController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    it("should create review successfully with authenticated user", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        photos: [],
      };

      const mockReview = {
        id: 1,
        user_id: 1,
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        photos: [],
      };

      Review.create.mockResolvedValue(mockReview);

      await createReview(req, res);

      expect(Review.create).toHaveBeenCalledWith({
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        photos: [],
        user_id: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = null;
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
      };

      await createReview(req, res);

      expect(Review.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not authenticated",
      });
    });

    it("should return 400 if user already reviewed menu item", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
      };

      const error = new Error("Duplicate review");
      error.code = "23505"; // Unique violation

      Review.create.mockRejectedValue(error);

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "You have already reviewed this menu item",
      });
    });

    it("should return 400 if invalid foreign key", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 999,
        rating: 5,
        comment: "Great food!",
      };

      const error = new Error("Foreign key violation");
      error.code = "23503"; // Foreign key violation

      Review.create.mockRejectedValue(error);

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid user_id or menu_item_id",
      });
    });

    it("should return 500 on other errors", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
      };

      const dbError = new Error("Database error");
      Review.create.mockRejectedValue(dbError);

      await createReview(req, res);

      // Verify database query was attempted with correct data
      expect(Review.create).toHaveBeenCalledWith({
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        user_id: 1,
      });
      // Verify error is properly handled
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create review",
      });
    });

    it("should verify user_id is correctly added from authentication", async () => {
      req.user = { userId: 5 };
      req.body = {
        menu_item_id: 3,
        rating: 4,
        comment: "Good food",
      };

      const mockReview = {
        id: 1,
        user_id: 5,
        menu_item_id: 3,
        rating: 4,
        comment: "Good food",
      };

      Review.create.mockResolvedValue(mockReview);

      await createReview(req, res);

      // Verify user_id from req.user overrides any user_id in body
      expect(Review.create).toHaveBeenCalledWith({
        menu_item_id: 3,
        rating: 4,
        comment: "Good food",
        user_id: 5, // From req.user.userId, not from body
      });
      expect(Review.create).toHaveBeenCalledTimes(1);
    });

    it("should verify database constraint violations are handled correctly", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great!",
      };

      // Test unique constraint violation (user already reviewed this item)
      const uniqueError = new Error("Duplicate key");
      uniqueError.code = "23505";
      Review.create.mockRejectedValue(uniqueError);

      await createReview(req, res);

      // Verify query was attempted
      expect(Review.create).toHaveBeenCalled();
      // Verify specific error code is handled
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "You have already reviewed this menu item",
      });

      // Test foreign key constraint violation
      const fkError = new Error("Foreign key violation");
      fkError.code = "23503";
      Review.create.mockRejectedValue(fkError);

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid user_id or menu_item_id",
      });
    });
  });

  describe("getMenuItemReviews", () => {
    it("should return reviews for menu item successfully", async () => {
      req.params.menuItemId = "1";
      const mockReviews = [
        {
          id: 1,
          menu_item_id: 1,
          rating: 5,
          comment: "Great!",
          user_name: "John Doe",
        },
        {
          id: 2,
          menu_item_id: 1,
          rating: 4,
          comment: "Good!",
          user_name: "Jane Smith",
        },
      ];

      Review.findByMenuItem.mockResolvedValue(mockReviews);

      await getMenuItemReviews(req, res);

      expect(Review.findByMenuItem).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return 500 on database error", async () => {
      req.params.menuItemId = "1";
      Review.findByMenuItem.mockRejectedValue(new Error("Database error"));

      await getMenuItemReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch reviews",
      });
    });
  });

  describe("getUserReviews", () => {
    it("should return reviews by user successfully", async () => {
      req.params.userId = "1";
      const mockReviews = [
        {
          id: 1,
          user_id: 1,
          menu_item_id: 1,
          rating: 5,
          comment: "Great!",
        },
      ];

      Review.findByUser.mockResolvedValue(mockReviews);

      await getUserReviews(req, res);

      expect(Review.findByUser).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return 500 on database error", async () => {
      req.params.userId = "1";
      Review.findByUser.mockRejectedValue(new Error("Database error"));

      await getUserReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch user reviews",
      });
    });
  });

  describe("getReviewById", () => {
    it("should return review by id successfully", async () => {
      req.params.reviewId = "1";
      req.user = { userId: 1 };
      const mockReview = {
        id: 1,
        user_id: 1,
        menu_item_id: 1,
        rating: 5,
        comment: "Great!",
      };

      Review.findById.mockResolvedValue(mockReview);

      await getReviewById(req, res);

      expect(Review.findById).toHaveBeenCalledWith("1", 1);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return review by id with null userId if not authenticated", async () => {
      req.params.reviewId = "1";
      req.user = null;
      const mockReview = {
        id: 1,
        user_id: 2,
        menu_item_id: 1,
        rating: 5,
        comment: "Great!",
      };

      Review.findById.mockResolvedValue(mockReview);

      await getReviewById(req, res);

      expect(Review.findById).toHaveBeenCalledWith("1", null);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return 404 if review not found", async () => {
      req.params.reviewId = "999";
      req.user = { userId: 1 };
      Review.findById.mockResolvedValue(null);

      await getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Review not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.reviewId = "1";
      req.user = { userId: 1 };
      Review.findById.mockRejectedValue(new Error("Database error"));

      await getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch review",
      });
    });
  });
});

// ============================================================================
// MENU ITEM CONTROLLER TESTS
// ============================================================================

const {
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemRating,
  getPopularMenuItems,
} = require("../menuItemController");

describe("MenuItemController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getMenuItemById", () => {
    it("should return menu item by id successfully", async () => {
      req.params.id = "1";
      const mockMenuItem = {
        id: 1,
        name: "Burger",
        price: "10.99",
        restaurant_id: 1,
      };

      MenuItemModel.findById.mockResolvedValue(mockMenuItem);

      await getMenuItemById(req, res);

      expect(MenuItemModel.findById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockMenuItem);
    });

    it("should return 404 if menu item not found", async () => {
      req.params.id = "999";
      MenuItemModel.findById.mockResolvedValue(null);

      await getMenuItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu item not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      const dbError = new Error("Database query execution failed");
      MenuItemModel.findById.mockRejectedValue(dbError);

      await getMenuItemById(req, res);

      // Verify database query was attempted with correct ID
      expect(MenuItemModel.findById).toHaveBeenCalledWith("1");
      expect(MenuItemModel.findById).toHaveBeenCalledTimes(1);
      // Verify error is handled
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch menu item",
      });
    });

    it("should verify database query parameters for menu item lookup", async () => {
      req.params.id = "42";
      const mockMenuItem = {
        id: 42,
        name: "Pizza",
        price: "15.99",
      };
      MenuItemModel.findById.mockResolvedValue(mockMenuItem);

      await getMenuItemById(req, res);

      // Verify exact parameter passed to query
      expect(MenuItemModel.findById).toHaveBeenCalledWith("42");
      expect(MenuItemModel.findById).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockMenuItem);
    });
  });

  describe("createMenuItem", () => {
    it("should create menu item successfully", async () => {
      const menuItemData = {
        restaurant_id: 1,
        name: "New Burger",
        price: "12.99",
        category: "Main Course",
      };

      req.body = menuItemData;
      const mockMenuItem = { id: 1, ...menuItemData };

      MenuItemModel.create.mockResolvedValue(mockMenuItem);

      await createMenuItem(req, res);

      expect(MenuItemModel.create).toHaveBeenCalledWith(menuItemData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMenuItem);
    });

    it("should return 500 on database error", async () => {
      req.body = { name: "New Burger" };
      MenuItemModel.create.mockRejectedValue(new Error("Database error"));

      await createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create menu item",
      });
    });
  });

  describe("updateMenuItem", () => {
    it("should update menu item successfully", async () => {
      req.params.id = "1";
      req.body = { name: "Updated Burger", price: "13.99" };
      const mockMenuItem = { id: 1, name: "Updated Burger", price: "13.99" };

      MenuItemModel.update.mockResolvedValue(mockMenuItem);

      await updateMenuItem(req, res);

      expect(MenuItemModel.update).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith(mockMenuItem);
    });

    it("should return 404 if menu item not found", async () => {
      req.params.id = "999";
      req.body = { name: "Updated Burger" };
      MenuItemModel.update.mockResolvedValue(null);

      await updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu item not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      req.body = { name: "Updated Burger" };
      MenuItemModel.update.mockRejectedValue(new Error("Database error"));

      await updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update menu item",
      });
    });
  });

  describe("deleteMenuItem", () => {
    it("should delete menu item successfully", async () => {
      req.params.id = "1";
      const mockMenuItem = { id: 1, name: "Burger" };

      MenuItemModel.delete.mockResolvedValue(mockMenuItem);

      await deleteMenuItem(req, res);

      expect(MenuItemModel.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Menu item deleted successfully",
        menuItem: mockMenuItem,
      });
    });

    it("should return 404 if menu item not found", async () => {
      req.params.id = "999";
      MenuItemModel.delete.mockResolvedValue(null);

      await deleteMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu item not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      MenuItemModel.delete.mockRejectedValue(new Error("Database error"));

      await deleteMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to delete menu item",
      });
    });
  });

  describe("getMenuItemRating", () => {
    it("should return rating stats successfully", async () => {
      req.params.id = "1";
      const mockRatingStats = {
        average_rating: "4.5",
        total_reviews: 10,
        rating_distribution: { 5: 5, 4: 3, 3: 2 },
      };

      MenuItemModel.getAverageRating.mockResolvedValue(mockRatingStats);

      await getMenuItemRating(req, res);

      expect(MenuItemModel.getAverageRating).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockRatingStats);
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      MenuItemModel.getAverageRating.mockRejectedValue(
        new Error("Database error")
      );

      await getMenuItemRating(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch menu item rating",
      });
    });
  });

  describe("getPopularMenuItems", () => {
    it("should return popular menu items with default limit", async () => {
      req.query = {};
      const mockPopularItems = [
        { id: 1, name: "Burger", review_count: 50 },
        { id: 2, name: "Pizza", review_count: 45 },
      ];

      MenuItemModel.getPopularItems.mockResolvedValue(mockPopularItems);

      await getPopularMenuItems(req, res);

      expect(MenuItemModel.getPopularItems).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith(mockPopularItems);
    });

    it("should return popular menu items with custom limit", async () => {
      req.query = { limit: "5" };
      const mockPopularItems = [{ id: 1, name: "Burger", review_count: 50 }];

      MenuItemModel.getPopularItems.mockResolvedValue(mockPopularItems);

      await getPopularMenuItems(req, res);

      expect(MenuItemModel.getPopularItems).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(mockPopularItems);
    });

    it("should return 500 on database error", async () => {
      req.query = {};
      MenuItemModel.getPopularItems.mockRejectedValue(
        new Error("Database error")
      );

      await getPopularMenuItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch popular menu items",
      });
    });
  });
});

// ============================================================================
// USER CONTROLLER TESTS
// ============================================================================

const { updateUser } = require("../userController");

describe("UserController", () => {
  let req;
  let res;

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

    it("should update user successfully with null optional fields", async () => {
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

      expect(User.update).toHaveBeenCalledWith("999", {
        name: req.body.name,
        email: req.body.email,
        birthday: null,
        phone_number: null,
        address: null,
      });
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

      // Verify database query was attempted with correct parameters
      expect(User.update).toHaveBeenCalledWith("1", {
        name: "Updated Name",
        email: "updated@example.com",
        birthday: null,
        phone_number: null,
        address: null,
      });
      expect(User.update).toHaveBeenCalledTimes(1);
      // Verify error is handled
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update user profile",
      });
    });

    it("should verify database query is not called when validation fails", async () => {
      req.params.id = "1";
      req.body = {
        email: "test@example.com",
        // Missing required 'name' field
      };

      await updateUser(req, res);

      // Verify database query is NOT called when validation fails
      expect(User.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Name and email are required",
      });
    });

    it("should verify exact update data is passed to database query", async () => {
      req.params.id = "5";
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        birthday: "1990-05-15",
        phone_number: "555-1234",
        address: "123 Main St",
      };

      const mockUpdatedUser = { id: 5, ...req.body, tier: "bronze" };
      User.update.mockResolvedValue(mockUpdatedUser);

      await updateUser(req, res);

      // Verify exact data structure passed to database
      expect(User.update).toHaveBeenCalledWith("5", {
        name: "John Doe",
        email: "john@example.com",
        birthday: "1990-05-15",
        phone_number: "555-1234",
        address: "123 Main St",
      });
      expect(User.update).toHaveBeenCalledTimes(1);
    });
  });
});
