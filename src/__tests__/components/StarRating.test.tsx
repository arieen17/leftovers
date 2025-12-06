import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { StarRating } from "../../components/StarRating";

describe("StarRating Component", () => {
  const mockOnRatingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without error", () => {
    const { getAllByTestId } = render(
      <StarRating rating={0} onRatingChange={mockOnRatingChange} />,
    );
    const stars = getAllByTestId(/star-/);
    expect(stars.length).toBe(5);
  });

  it("should render with default maxRating of 5", () => {
    const { getAllByTestId } = render(
      <StarRating rating={0} onRatingChange={mockOnRatingChange} />,
    );
    const stars = getAllByTestId(/star-/);
    expect(stars.length).toBe(5);
  });

  it("should render with custom maxRating", () => {
    const { getAllByTestId } = render(
      <StarRating
        rating={0}
        onRatingChange={mockOnRatingChange}
        maxRating={10}
      />,
    );
    const stars = getAllByTestId(/star-/);
    expect(stars.length).toBe(10);
  });

  it("should call onRatingChange when star is pressed", () => {
    const { getAllByTestId } = render(
      <StarRating rating={0} onRatingChange={mockOnRatingChange} />,
    );
    const stars = getAllByTestId(/star-/);
    if (stars.length > 2) {
      fireEvent.press(stars[2]);
      expect(mockOnRatingChange).toHaveBeenCalled();
    }
  });

  it("should render correct number of stars for rating", () => {
    const { getAllByTestId } = render(
      <StarRating rating={3} onRatingChange={mockOnRatingChange} />,
    );
    const stars = getAllByTestId(/star-/);
    expect(stars.length).toBe(5);
  });
});
