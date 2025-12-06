const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurantsAndItems,
} = require("../../controllers/restaurantController");
const Restaurant = require("../../models/Restaurant");
const MenuItem = require("../../models/MenuItem");

jest.mock("../../models/Restaurant");
jest.mock("../../models/MenuItem");
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

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

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch restaurants",
        details: error.message,
      });
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

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch restaurant",
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
        new Error("Database error"),
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
      MenuItem.search.mockResolvedValue(mockMenuItems);

      await searchRestaurantsAndItems(req, res);

      expect(Restaurant.search).toHaveBeenCalledWith("pizza");
      expect(MenuItem.search).toHaveBeenCalledWith("pizza");
      expect(res.json).toHaveBeenCalledWith({
        restaurants: mockRestaurants,
        menuItems: mockMenuItems,
      });
    });

    it("should return empty arrays if query is empty", async () => {
      req.query.q = "";

      await searchRestaurantsAndItems(req, res);

      expect(Restaurant.search).not.toHaveBeenCalled();
      expect(MenuItem.search).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        restaurants: [],
        menuItems: [],
      });
    });

    it("should return empty arrays if query is whitespace only", async () => {
      req.query.q = "   ";

      await searchRestaurantsAndItems(req, res);

      expect(Restaurant.search).not.toHaveBeenCalled();
      expect(MenuItem.search).not.toHaveBeenCalled();
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

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to search",
        details: "Database error",
      });
    });
  });
});
