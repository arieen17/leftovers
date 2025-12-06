import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FormField } from "../../components/FormField";

describe("FormField Component", () => {
  const mockOnChangeText = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without error", () => {
    const { getByText, getByPlaceholderText } = render(
      <FormField
        label="Test Label"
        value=""
        placeholder="Test Placeholder"
        onChangeText={mockOnChangeText}
      />,
    );
    expect(getByText("Test Label")).toBeTruthy();
    expect(getByPlaceholderText("Test Placeholder")).toBeTruthy();
  });

  it("should display the correct label", () => {
    const { getByText } = render(
      <FormField
        label="Email"
        value=""
        placeholder="Enter email"
        onChangeText={mockOnChangeText}
      />,
    );
    expect(getByText("Email")).toBeTruthy();
  });

  it("should display the correct placeholder", () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Email"
        value=""
        placeholder="Enter your email"
        onChangeText={mockOnChangeText}
      />,
    );
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
  });

  it("should display the current value", () => {
    const { getByDisplayValue } = render(
      <FormField
        label="Email"
        value="test@example.com"
        placeholder="Enter email"
        onChangeText={mockOnChangeText}
      />,
    );
    expect(getByDisplayValue("test@example.com")).toBeTruthy();
  });

  it("should call onChangeText when text is entered", () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Email"
        value=""
        placeholder="Enter email"
        onChangeText={mockOnChangeText}
      />,
    );
    const input = getByPlaceholderText("Enter email");
    fireEvent.changeText(input, "new@example.com");
    expect(mockOnChangeText).toHaveBeenCalledWith("new@example.com");
  });

  it("should call onPress when input is focused", () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Email"
        value=""
        placeholder="Enter email"
        onChangeText={mockOnChangeText}
        onPress={mockOnPress}
      />,
    );
    const input = getByPlaceholderText("Enter email");
    fireEvent(input, "focus");
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("should be editable by default", () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Email"
        value=""
        placeholder="Enter email"
        onChangeText={mockOnChangeText}
      />,
    );
    const input = getByPlaceholderText("Enter email");
    expect(input.props.editable).toBe(true);
  });

  it("should not be editable when editable prop is false", () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Email"
        value="test@example.com"
        placeholder="Enter email"
        onChangeText={mockOnChangeText}
        editable={false}
      />,
    );
    const input = getByPlaceholderText("Enter email");
    expect(input.props.editable).toBe(false);
  });

  it("should render chevron icon", () => {
    const { getByTestId } = render(
      <FormField
        label="Email"
        value=""
        placeholder="Enter email"
        onChangeText={mockOnChangeText}
      />,
    );
    expect(getByTestId("chevron-right")).toBeTruthy();
  });
});
