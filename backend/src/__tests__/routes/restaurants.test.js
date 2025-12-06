const request = require("supertest");
const express = require("express");
const restaurantsRouter = require("../../routes/restaurants");
const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurantsAndItems,
} = require("../../controllers/restaurantController");

jest.mock("../../controllers/restaurantController");

const app = express();
app.use(express.json());
app.use("/api/restaurants", restaurantsRouter);

describe("Restaurants Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/restaurants", () => {
    it("should call getAllRestaurants controller", async () => {
      getAllRestaurants.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get("/api/restaurants").expect(200);

      expect(getAllRestaurants).toHaveBeenCalled();
    });
  });

  describe("GET /api/restaurants/search", () => {
    it("should call searchRestaurantsAndItems controller", async () => {
      searchRestaurantsAndItems.mockImplementation((req, res) => {
        res.json({ restaurants: [], menuItems: [] });
      });

      await request(app).get("/api/restaurants/search?q=pizza").expect(200);

      expect(searchRestaurantsAndItems).toHaveBeenCalled();
    });
  });

  describe("GET /api/restaurants/:id", () => {
    it("should call getRestaurantById controller", async () => {
      getRestaurantById.mockImplementation((req, res) => {
        res.json({ id: 1, name: "Restaurant 1" });
      });

      await request(app).get("/api/restaurants/1").expect(200);

      expect(getRestaurantById).toHaveBeenCalled();
    });
  });

  describe("GET /api/restaurants/:id/menu", () => {
    it("should call getRestaurantMenu controller", async () => {
      getRestaurantMenu.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get("/api/restaurants/1/menu").expect(200);

      expect(getRestaurantMenu).toHaveBeenCalled();
    });
  });

  describe("POST /api/restaurants", () => {
    it("should call createRestaurant controller", async () => {
      createRestaurant.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, name: "New Restaurant" });
      });

      await request(app)
        .post("/api/restaurants")
        .send({ name: "New Restaurant" })
        .expect(201);

      expect(createRestaurant).toHaveBeenCalled();
    });
  });

  describe("PUT /api/restaurants/:id", () => {
    it("should call updateRestaurant controller", async () => {
      updateRestaurant.mockImplementation((req, res) => {
        res.json({ id: 1, name: "Updated Restaurant" });
      });

      await request(app)
        .put("/api/restaurants/1")
        .send({ name: "Updated Restaurant" })
        .expect(200);

      expect(updateRestaurant).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/restaurants/:id", () => {
    it("should call deleteRestaurant controller", async () => {
      deleteRestaurant.mockImplementation((req, res) => {
        res.json({ message: "Restaurant deleted" });
      });

      await request(app).delete("/api/restaurants/1").expect(200);

      expect(deleteRestaurant).toHaveBeenCalled();
    });
  });
});
