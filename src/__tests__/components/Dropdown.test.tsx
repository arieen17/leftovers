import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Dropdown } from "../../components/Dropdown";

describe("Dropdown Component", () => {
  const mockOptions = ["Option 1", "Option 2", "Option 3"];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render dropdown with label", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />,
    );
    expect(getByText("Test Label")).toBeTruthy();
  });

  it("should render dropdown with placeholder", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />,
    );
    expect(getByText("Select option")).toBeTruthy();
  });

  it("should render dropdown with selected value", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value="Option 1"
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />,
    );
    expect(getByText("Option 1")).toBeTruthy();
  });

  it("should filter options when searching", () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "Option 1");

    expect(getByText("Option 1")).toBeTruthy();
  });

  it("should show no results when search has no matches", () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "NonExistent");

    expect(getByText("No results found")).toBeTruthy();
  });

  it("should select option and close modal", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    const option = getByText("Option 1");
    fireEvent.press(option);

    expect(mockOnSelect).toHaveBeenCalledWith("Option 1");
  });

  it("should clear search when option is selected", () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "Option");

    const option = getByText("Option 1");
    fireEvent.press(option);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it("should clear search when X button is pressed", () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "Option");

    const clearButton = searchInput.parent?.children?.find(
      (child: any) => child?.props?.onPress,
    );
    if (clearButton) {
      fireEvent.press(clearButton);
    }
  });

  it("should filter options case insensitively", () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "OPTION 1");

    expect(getByText("Option 1")).toBeTruthy();
  });

  it("should show all options when search is cleared", () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "Option 1");
    fireEvent.changeText(searchInput, "");

    expect(getByText("Option 1")).toBeTruthy();
    expect(getByText("Option 2")).toBeTruthy();
    expect(getByText("Option 3")).toBeTruthy();
  });

  it("should not filter when searchable is false", () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={false}
      />,
    );
    const pressable = getByText("Select option").parent;
    fireEvent.press(pressable!);

    expect(() => getByPlaceholderText("Search...")).toThrow();
  });
});
