import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SearchBar } from "../../components/SearchBar";

describe("SearchBar Component", () => {
  const mockOnChangeText = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without error", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />,
    );
    expect(
      getByPlaceholderText("Search restaurants or dishes..."),
    ).toBeTruthy();
  });

  it("should display the correct placeholder", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />,
    );
    expect(
      getByPlaceholderText("Search restaurants or dishes..."),
    ).toBeTruthy();
  });

  it("should call onChangeText when text is entered", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />,
    );
    const input = getByPlaceholderText("Search restaurants or dishes...");
    fireEvent.changeText(input, "pizza");
    expect(mockOnChangeText).toHaveBeenCalledWith("pizza");
  });

  it("should display clear button when value is not empty", () => {
    const { getByTestId } = render(
      <SearchBar value="pizza" onChangeText={mockOnChangeText} />,
    );
    expect(getByTestId("clear-icon")).toBeTruthy();
  });

  it("should not display clear button when value is empty", () => {
    const { queryByTestId } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />,
    );
    expect(queryByTestId("clear-icon")).toBeNull();
  });

  it("should clear text when clear button is pressed", () => {
    const { getByTestId } = render(
      <SearchBar value="pizza" onChangeText={mockOnChangeText} />,
    );
    const clearButton = getByTestId("clear-icon").parent;
    fireEvent.press(clearButton || getByTestId("clear-icon"));
    expect(mockOnChangeText).toHaveBeenCalledWith("");
  });

  it("should call onSearch when submitted", () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value="pizza"
        onChangeText={mockOnChangeText}
        onSearch={mockOnSearch}
      />,
    );
    const input = getByPlaceholderText("Search restaurants or dishes...");
    fireEvent(input, "submitEditing");
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it("should render search icon", () => {
    const { getByTestId } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />,
    );
    expect(getByTestId("search-icon")).toBeTruthy();
  });
});
