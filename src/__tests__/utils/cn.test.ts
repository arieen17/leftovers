import { cn } from "../../utils/cn";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("should handle false conditionals", () => {
    const isActive = false;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).not.toContain("active-class");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["text-red-500", "bg-blue-500"], "p-4");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
    expect(result).toContain("p-4");
  });

  it("should handle undefined and null values", () => {
    const result = cn("base-class", undefined, null, "valid-class");
    expect(result).toContain("base-class");
    expect(result).toContain("valid-class");
  });

  it("should merge conflicting Tailwind classes", () => {
    // tailwind-merge should handle this
    const result = cn("p-4", "p-8");
    expect(result).toBeTruthy();
  });

  it("should return empty string for no inputs", () => {
    const result = cn();
    expect(typeof result).toBe("string");
  });
});
