const { getRecommendations } = require("../../algorithms/recommendations");

describe("Recommendations Algorithm", () => {
  describe("getRecommendations", () => {
    it("should return recommendations for user 3", async () => {
      const recommendations = await getRecommendations(3);

      expect(recommendations).toHaveLength(5);
      expect(recommendations[0]).toEqual({
        menu_item_id: 1,
        score: 1.0,
      });
      expect(recommendations[1]).toEqual({
        menu_item_id: 4,
        score: 0.8,
      });
    });

    it("should return recommendations with decreasing scores", async () => {
      const recommendations = await getRecommendations(1);

      expect(recommendations.length).toBeGreaterThan(0);
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].score).toBeGreaterThanOrEqual(
          recommendations[i + 1].score,
        );
      }
    });

    it("should return recommendations with valid structure", async () => {
      const recommendations = await getRecommendations(1);

      recommendations.forEach((rec) => {
        expect(rec).toHaveProperty("menu_item_id");
        expect(rec).toHaveProperty("score");
        expect(typeof rec.menu_item_id).toBe("number");
        expect(typeof rec.score).toBe("number");
        expect(rec.score).toBeGreaterThanOrEqual(0);
        expect(rec.score).toBeLessThanOrEqual(1);
      });
    });
  });
});
