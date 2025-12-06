const {
  getUserRecommendations,
} = require("../../controllers/recommendationController");
const { getRecommendations } = require("../../algorithms/recommendations");

jest.mock("../../algorithms/recommendations");

describe("RecommendationController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getUserRecommendations", () => {
    it("should return recommendations successfully", async () => {
      req.query.user_id = "1";
      const mockRecommendations = [
        { menu_item_id: 1, score: 1.0 },
        { menu_item_id: 4, score: 0.8 },
      ];

      getRecommendations.mockResolvedValue(mockRecommendations);

      await getUserRecommendations(req, res);

      expect(getRecommendations).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        user_id: 1,
        recommendations: mockRecommendations,
      });
    });

    it("should parse user_id as integer", async () => {
      req.query.user_id = "42";
      const mockRecommendations = [{ menu_item_id: 1, score: 1.0 }];

      getRecommendations.mockResolvedValue(mockRecommendations);

      await getUserRecommendations(req, res);

      expect(getRecommendations).toHaveBeenCalledWith(42);
      expect(res.json).toHaveBeenCalledWith({
        user_id: 42,
        recommendations: mockRecommendations,
      });
    });

    it("should handle string user_id", async () => {
      req.query.user_id = "123";
      const mockRecommendations = [{ menu_item_id: 1, score: 1.0 }];

      getRecommendations.mockResolvedValue(mockRecommendations);

      await getUserRecommendations(req, res);

      expect(getRecommendations).toHaveBeenCalledWith(123);
    });

    it("should return 500 on error", async () => {
      req.query.user_id = "1";
      const error = new Error("Recommendation service error");

      getRecommendations.mockRejectedValue(error);

      await getUserRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to get recommendations",
      });
    });

    it("should handle missing user_id", async () => {
      req.query.user_id = undefined;
      const mockRecommendations = [{ menu_item_id: 1, score: 1.0 }];

      getRecommendations.mockResolvedValue(mockRecommendations);

      await getUserRecommendations(req, res);

      expect(getRecommendations).toHaveBeenCalledWith(NaN);
    });
  });
});
