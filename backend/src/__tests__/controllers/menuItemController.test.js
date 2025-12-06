const {
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemRating,
  getPopularMenuItems,
} = require("../../controllers/menuItemController");
const MenuItem = require("../../models/MenuItem");

jest.mock("../../models/MenuItem");

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

      MenuItem.findById.mockResolvedValue(mockMenuItem);

      await getMenuItemById(req, res);

      expect(MenuItem.findById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockMenuItem);
    });

    it("should return 404 if menu item not found", async () => {
      req.params.id = "999";
      MenuItem.findById.mockResolvedValue(null);

      await getMenuItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu item not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      MenuItem.findById.mockRejectedValue(new Error("Database error"));

      await getMenuItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch menu item",
      });
    });
  });

  describe("createMenuItem", () => {
    it("should create menu item successfully", async () => {
      req.body = {
        restaurant_id: 1,
        name: "New Burger",
        price: "12.99",
        category: "Main Course",
      };
      const mockMenuItem = { id: 1, ...req.body };

      MenuItem.create.mockResolvedValue(mockMenuItem);

      await createMenuItem(req, res);

      expect(MenuItem.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMenuItem);
    });

    it("should return 500 on database error", async () => {
      req.body = { name: "New Burger" };
      MenuItem.create.mockRejectedValue(new Error("Database error"));

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
      const mockMenuItem = { id: 1, ...req.body };

      MenuItem.update.mockResolvedValue(mockMenuItem);

      await updateMenuItem(req, res);

      expect(MenuItem.update).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith(mockMenuItem);
    });

    it("should return 404 if menu item not found", async () => {
      req.params.id = "999";
      req.body = { name: "Updated Burger" };
      MenuItem.update.mockResolvedValue(null);

      await updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu item not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      req.body = { name: "Updated Burger" };
      MenuItem.update.mockRejectedValue(new Error("Database error"));

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

      MenuItem.delete.mockResolvedValue(mockMenuItem);

      await deleteMenuItem(req, res);

      expect(MenuItem.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Menu item deleted successfully",
        menuItem: mockMenuItem,
      });
    });

    it("should return 404 if menu item not found", async () => {
      req.params.id = "999";
      MenuItem.delete.mockResolvedValue(null);

      await deleteMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu item not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      MenuItem.delete.mockRejectedValue(new Error("Database error"));

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
        review_count: 10,
      };

      MenuItem.getAverageRating.mockResolvedValue(mockRatingStats);

      await getMenuItemRating(req, res);

      expect(MenuItem.getAverageRating).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockRatingStats);
    });

    it("should return 500 on database error", async () => {
      req.params.id = "1";
      MenuItem.getAverageRating.mockRejectedValue(new Error("Database error"));

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

      MenuItem.getPopularItems.mockResolvedValue(mockPopularItems);

      await getPopularMenuItems(req, res);

      expect(MenuItem.getPopularItems).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith(mockPopularItems);
    });

    it("should return popular menu items with custom limit", async () => {
      req.query = { limit: "5" };
      const mockPopularItems = [{ id: 1, name: "Burger", review_count: 50 }];

      MenuItem.getPopularItems.mockResolvedValue(mockPopularItems);

      await getPopularMenuItems(req, res);

      expect(MenuItem.getPopularItems).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(mockPopularItems);
    });

    it("should return 500 on database error", async () => {
      req.query = {};
      MenuItem.getPopularItems.mockRejectedValue(new Error("Database error"));

      await getPopularMenuItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch popular menu items",
      });
    });
  });
});
