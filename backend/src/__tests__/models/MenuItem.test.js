const MenuItem = require("../../models/MenuItem");
const pool = require("../../../database/config");

jest.mock("../../../database/config");

describe("MenuItem Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should find menu item by id with ratings", async () => {
      const mockMenuItem = {
        id: 1,
        name: "Burger",
        average_rating: 4.5,
        review_count: 10,
      };
      pool.query.mockResolvedValue({ rows: [mockMenuItem] });

      const result = await MenuItem.findById(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT menu_items.*"),
        [1],
      );
      expect(result).toEqual(mockMenuItem);
    });

    it("should return undefined when menu item not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MenuItem.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should create a new menu item", async () => {
      const menuItemData = {
        restaurant_id: 1,
        name: "New Burger",
        description: "Delicious burger",
        price: "10.99",
        category: "Main Course",
        image_url: "http://example.com/image.jpg",
        tags: ["spicy", "popular"],
      };
      const mockMenuItem = { id: 1, ...menuItemData };
      pool.query.mockResolvedValue({ rows: [mockMenuItem] });

      const result = await MenuItem.create(menuItemData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO menu_items"),
        [
          menuItemData.restaurant_id,
          menuItemData.name,
          menuItemData.description,
          menuItemData.price,
          menuItemData.category,
          menuItemData.image_url,
          menuItemData.tags,
        ],
      );
      expect(result).toEqual(mockMenuItem);
    });
  });

  describe("update", () => {
    it("should update menu item with all fields", async () => {
      const updateData = { name: "Updated Burger", price: "12.99" };
      const mockUpdatedItem = { id: 1, ...updateData };
      pool.query.mockResolvedValue({ rows: [mockUpdatedItem] });

      const result = await MenuItem.update(1, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE menu_items"),
        expect.arrayContaining([updateData.name, updateData.price, 1]),
      );
      expect(result).toEqual(mockUpdatedItem);
    });

    it("should throw error when no fields to update", async () => {
      await expect(MenuItem.update(1, {})).rejects.toThrow(
        "No fields to update",
      );
    });

    it("should ignore undefined fields", async () => {
      const updateData = { name: "New Name", price: undefined };
      const mockUpdatedItem = { id: 1, name: "New Name" };
      pool.query.mockResolvedValue({ rows: [mockUpdatedItem] });

      const result = await MenuItem.update(1, updateData);

      expect(result).toEqual(mockUpdatedItem);
    });
  });

  describe("delete", () => {
    it("should delete menu item by id", async () => {
      const mockDeletedItem = { id: 1, name: "Deleted Item" };
      pool.query.mockResolvedValue({ rows: [mockDeletedItem] });

      const result = await MenuItem.delete(1);

      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM menu_items WHERE id = $1 RETURNING *",
        [1],
      );
      expect(result).toEqual(mockDeletedItem);
    });
  });

  describe("getAverageRating", () => {
    it("should get average rating for menu item", async () => {
      const mockRating = { average_rating: 4.5, review_count: 15 };
      pool.query.mockResolvedValue({ rows: [mockRating] });

      const result = await MenuItem.getAverageRating(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT AVG(rating)"),
        [1],
      );
      expect(result).toEqual(mockRating);
    });
  });

  describe("search", () => {
    it("should search menu items by name", async () => {
      const mockResults = [{ id: 1, name: "Pizza" }];
      pool.query.mockResolvedValue({ rows: mockResults });

      const result = await MenuItem.search("pizza");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT menu_items.*"),
        ["%pizza%"],
      );
      expect(result).toEqual(mockResults);
    });

    it("should search menu items by category", async () => {
      const mockResults = [{ id: 1, category: "Dessert" }];
      pool.query.mockResolvedValue({ rows: mockResults });

      const result = await MenuItem.search("dessert");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(menu_items.category) LIKE LOWER"),
        ["%dessert%"],
      );
      expect(result).toEqual(mockResults);
    });
  });

  describe("getPopularItems", () => {
    it("should get popular items with default limit", async () => {
      const mockItems = [
        { id: 1, name: "Burger", review_count: 50 },
        { id: 2, name: "Pizza", review_count: 45 },
      ];
      pool.query.mockResolvedValue({ rows: mockItems });

      const result = await MenuItem.getPopularItems();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [10],
      );
      expect(result).toEqual(mockItems);
    });

    it("should get popular items with custom limit", async () => {
      const mockItems = [{ id: 1, name: "Burger", review_count: 50 }];
      pool.query.mockResolvedValue({ rows: mockItems });

      const result = await MenuItem.getPopularItems(5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [5],
      );
      expect(result).toEqual(mockItems);
    });
  });
});
