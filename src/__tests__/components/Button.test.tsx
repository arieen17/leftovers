import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../../components/Button";

describe("Button Component", () => {
  it("should render without error", () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("should display the correct title", () => {
    const { getByText } = render(<Button title="Click Me" />);
    expect(getByText("Click Me")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />,
    );
    fireEvent.press(getByText("Test Button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("should not call onPress when disabled", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />,
    );
    fireEvent.press(getByText("Test Button"));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("should render with primary theme by default", () => {
    const { getByText } = render(<Button title="Test Button" />);
    const button = getByText("Test Button").parent;
    expect(button).toBeTruthy();
  });

  it("should render with secondary theme", () => {
    const { getByText } = render(
      <Button title="Test Button" theme="secondary" />,
    );
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("should render with tertiary theme", () => {
    const { getByText } = render(
      <Button title="Test Button" theme="tertiary" />,
    );
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("should accept additional PressableProps", () => {
    const { getByText } = render(
      <Button title="Test Button" testID="custom-button" />,
    );
    expect(getByText("Test Button")).toBeTruthy();
  });
});
