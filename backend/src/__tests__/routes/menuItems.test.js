const request = require("supertest");
const express = require("express");
const menuItemsRouter = require("../../routes/menuItems");
const {
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemRating,
  getPopularMenuItems,
} = require("../../controllers/menuItemController");

jest.mock("../../controllers/menuItemController");

const app = express();
app.use(express.json());
app.use("/api/menu-items", menuItemsRouter);

describe("MenuItems Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/menu-items/popular", () => {
    it("should call getPopularMenuItems controller", async () => {
      getPopularMenuItems.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get("/api/menu-items/popular").expect(200);

      expect(getPopularMenuItems).toHaveBeenCalled();
    });
  });

  describe("GET /api/menu-items/:id", () => {
    it("should call getMenuItemById controller", async () => {
      getMenuItemById.mockImplementation((req, res) => {
        res.json({ id: 1, name: "Burger" });
      });

      await request(app).get("/api/menu-items/1").expect(200);

      expect(getMenuItemById).toHaveBeenCalled();
    });
  });

  describe("GET /api/menu-items/:id/rating", () => {
    it("should call getMenuItemRating controller", async () => {
      getMenuItemRating.mockImplementation((req, res) => {
        res.json({ average_rating: 4.5, review_count: 10 });
      });

      await request(app).get("/api/menu-items/1/rating").expect(200);

      expect(getMenuItemRating).toHaveBeenCalled();
    });
  });

  describe("POST /api/menu-items", () => {
    it("should call createMenuItem controller", async () => {
      createMenuItem.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, name: "New Item" });
      });

      await request(app)
        .post("/api/menu-items")
        .send({ name: "New Item" })
        .expect(201);

      expect(createMenuItem).toHaveBeenCalled();
    });
  });

  describe("PUT /api/menu-items/:id", () => {
    it("should call updateMenuItem controller", async () => {
      updateMenuItem.mockImplementation((req, res) => {
        res.json({ id: 1, name: "Updated Item" });
      });

      await request(app)
        .put("/api/menu-items/1")
        .send({ name: "Updated Item" })
        .expect(200);

      expect(updateMenuItem).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/menu-items/:id", () => {
    it("should call deleteMenuItem controller", async () => {
      deleteMenuItem.mockImplementation((req, res) => {
        res.json({ message: "Item deleted" });
      });

      await request(app).delete("/api/menu-items/1").expect(200);

      expect(deleteMenuItem).toHaveBeenCalled();
    });
  });
});
