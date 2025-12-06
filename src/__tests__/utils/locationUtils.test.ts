import {
  calculateDistance,
  formatDistance,
  getCenterPoint,
  getBoundingBox,
  Coordinates,
} from "../../utils/locationUtils";

describe("locationUtils", () => {
  describe("calculateDistance", () => {
    it("should calculate distance between two coordinates", () => {
      const coord1: Coordinates = { latitude: 34.0522, longitude: -118.2437 };
      const coord2: Coordinates = { latitude: 40.7128, longitude: -74.006 };

      const distance = calculateDistance(coord1, coord2);

      expect(distance).toBeGreaterThan(2400);
      expect(distance).toBeLessThan(2500);
    });

    it("should return 0 for same coordinates", () => {
      const coord: Coordinates = { latitude: 34.0522, longitude: -118.2437 };
      const distance = calculateDistance(coord, coord);
      expect(distance).toBe(0);
    });

    it("should calculate short distances correctly", () => {
      const coord1: Coordinates = { latitude: 34.0522, longitude: -118.2437 };
      const coord2: Coordinates = { latitude: 34.0622, longitude: -118.2537 };

      const distance = calculateDistance(coord1, coord2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10);
    });

    it("should round to 1 decimal place", () => {
      const coord1: Coordinates = { latitude: 34.0522, longitude: -118.2437 };
      const coord2: Coordinates = { latitude: 34.0622, longitude: -118.2537 };

      const distance = calculateDistance(coord1, coord2);
      const decimalPlaces = (distance.toString().split(".")[1] || "").length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  describe("formatDistance", () => {
    it("should format distance less than 0.1 miles", () => {
      expect(formatDistance(0.05)).toBe("< 0.1 mi");
      expect(formatDistance(0.0)).toBe("< 0.1 mi");
    });

    it("should format normal distances", () => {
      expect(formatDistance(1.5)).toBe("1.5 mi");
      expect(formatDistance(10)).toBe("10 mi");
      expect(formatDistance(100.7)).toBe("100.7 mi");
    });

    it("should handle zero distance", () => {
      expect(formatDistance(0)).toBe("< 0.1 mi");
    });
  });

  describe("getCenterPoint", () => {
    it("should calculate center point of multiple coordinates", () => {
      const coordinates: Coordinates[] = [
        { latitude: 34.0, longitude: -118.0 },
        { latitude: 35.0, longitude: -119.0 },
        { latitude: 36.0, longitude: -120.0 },
      ];

      const center = getCenterPoint(coordinates);

      expect(center.latitude).toBe(35.0);
      expect(center.longitude).toBe(-119.0);
    });

    it("should return zero coordinates for empty array", () => {
      const center = getCenterPoint([]);
      expect(center.latitude).toBe(0);
      expect(center.longitude).toBe(0);
    });

    it("should return the coordinate for single point", () => {
      const coordinates: Coordinates[] = [
        { latitude: 34.0522, longitude: -118.2437 },
      ];

      const center = getCenterPoint(coordinates);
      expect(center.latitude).toBe(34.0522);
      expect(center.longitude).toBe(-118.2437);
    });
  });

  describe("getBoundingBox", () => {
    it("should calculate bounding box for multiple coordinates", () => {
      const coordinates: Coordinates[] = [
        { latitude: 34.0, longitude: -118.0 },
        { latitude: 35.0, longitude: -119.0 },
        { latitude: 36.0, longitude: -120.0 },
      ];

      const box = getBoundingBox(coordinates);

      expect(box.minLat).toBe(34.0);
      expect(box.maxLat).toBe(36.0);
      expect(box.minLon).toBe(-120.0);
      expect(box.maxLon).toBe(-118.0);
    });

    it("should return zero box for empty array", () => {
      const box = getBoundingBox([]);
      expect(box.minLat).toBe(0);
      expect(box.maxLat).toBe(0);
      expect(box.minLon).toBe(0);
      expect(box.maxLon).toBe(0);
    });

    it("should return same values for single point", () => {
      const coordinates: Coordinates[] = [
        { latitude: 34.0522, longitude: -118.2437 },
      ];

      const box = getBoundingBox(coordinates);
      expect(box.minLat).toBe(34.0522);
      expect(box.maxLat).toBe(34.0522);
      expect(box.minLon).toBe(-118.2437);
      expect(box.maxLon).toBe(-118.2437);
    });
  });
});
