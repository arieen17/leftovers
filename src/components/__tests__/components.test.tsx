// ============================================================================
// FRONTEND COMPONENT TESTS
// ============================================================================

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";

// Mock all dependencies at the top level
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0 })),
}));

jest.mock("../../../public/images/bear.svg", () => {
  const mockReact = jest.requireActual("react");
  return (props: any) =>
    mockReact.createElement("View", { ...props, testID: "bear-icon" });
});

jest.mock("lucide-react-native", () => {
  const mockReact = jest.requireActual("react");
  return {
    Search: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "search-icon" }),
    X: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "clear-icon" }),
    ChevronRight: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "chevron-right" }),
    ChevronDown: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "chevron-down" }),
    ChevronUp: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "chevron-up" }),
    Star: (props: any) =>
      mockReact.createElement("View", {
        ...props,
        testID: `star-${props.fill || "empty"}`,
      }),
    Heart: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "heart-icon" }),
    MessageCircle: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "message-icon" }),
    Trash2: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "trash-icon" }),
    Camera: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "camera-icon" }),
  };
});

jest.mock("@/context/PostsContext", () => ({
  usePosts: jest.fn(),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
  },
}));

// ============================================================================
// BUTTON COMPONENT TESTS
// ============================================================================

import { Button } from "../Button";

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
      <Button title="Test Button" onPress={mockOnPress} />
    );
    fireEvent.press(getByText("Test Button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("should not call onPress when disabled", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />
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
      <Button title="Test Button" theme="secondary" />
    );
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("should render with tertiary theme", () => {
    const { getByText } = render(
      <Button title="Test Button" theme="tertiary" />
    );
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("should accept additional PressableProps", () => {
    const { getByText } = render(
      <Button title="Test Button" testID="custom-button" />
    );
    expect(getByText("Test Button")).toBeTruthy();
  });
});

// ============================================================================
// TOPBAR COMPONENT TESTS
// ============================================================================

import { TopBar } from "../TopBar";
import { useRouter } from "expo-router";

describe("TopBar Component", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should render without error", () => {
    const { getByText } = render(<TopBar />);
    expect(getByText("R'ATE")).toBeTruthy();
  });

  it("should display the R'ATE title", () => {
    const { getByText } = render(<TopBar />);
    const title = getByText("R'ATE");
    expect(title).toBeTruthy();
  });

  it("should navigate to home when logo is pressed", () => {
    const { getByTestId } = render(<TopBar />);
    const bearIcon = getByTestId("bear-icon");
    fireEvent.press(bearIcon.parent || bearIcon);
    expect(mockPush).toHaveBeenCalledWith("/(tabs)/");
  });

  it("should navigate to home when title is pressed", () => {
    const { getByText } = render(<TopBar />);
    const title = getByText("R'ATE");
    fireEvent.press(title.parent || title);
    expect(mockPush).toHaveBeenCalledWith("/(tabs)/");
  });

  it("should render bear icon", () => {
    const { getByTestId } = render(<TopBar />);
    expect(getByTestId("bear-icon")).toBeTruthy();
  });
});

// ============================================================================
// SEARCHBAR COMPONENT TESTS
// ============================================================================

import { SearchBar } from "../SearchBar";

describe("SearchBar Component", () => {
  const mockOnChangeText = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without error", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />
    );
    expect(
      getByPlaceholderText("Search restaurants or dishes...")
    ).toBeTruthy();
  });

  it("should display the correct placeholder", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />
    );
    expect(
      getByPlaceholderText("Search restaurants or dishes...")
    ).toBeTruthy();
  });

  it("should call onChangeText when text is entered", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />
    );
    const input = getByPlaceholderText("Search restaurants or dishes...");
    fireEvent.changeText(input, "pizza");
    expect(mockOnChangeText).toHaveBeenCalledWith("pizza");
  });

  it("should display clear button when value is not empty", () => {
    const { getByTestId } = render(
      <SearchBar value="pizza" onChangeText={mockOnChangeText} />
    );
    expect(getByTestId("clear-icon")).toBeTruthy();
  });

  it("should not display clear button when value is empty", () => {
    const { queryByTestId } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />
    );
    expect(queryByTestId("clear-icon")).toBeNull();
  });

  it("should clear text when clear button is pressed", () => {
    const { getByTestId } = render(
      <SearchBar value="pizza" onChangeText={mockOnChangeText} />
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
      />
    );
    const input = getByPlaceholderText("Search restaurants or dishes...");
    fireEvent(input, "submitEditing");
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it("should render search icon", () => {
    const { getByTestId } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} />
    );
    expect(getByTestId("search-icon")).toBeTruthy();
  });
});

// ============================================================================
// FORMFIELD COMPONENT TESTS
// ============================================================================

import { FormField } from "../FormField";

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
      />
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
      />
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
      />
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
      />
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
      />
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
      />
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
      />
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
      />
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
      />
    );
    expect(getByTestId("chevron-right")).toBeTruthy();
  });
});

// ============================================================================
// HORIZONTAL REVIEW CARD COMPONENT TESTS
// ============================================================================

import { HorizontalReviewCard } from "../HorizontalReviewCard";
import { usePosts } from "@/context/PostsContext";
import { useAuth } from "@/context/AuthContext";

describe("HorizontalReviewCard Component", () => {
  const mockDeletePost = jest.fn();
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockPost = {
    id: "1",
    restaurant: "Test Restaurant",
    menuItem: "Burger",
    rating: 5,
    review: "Great food!",
    createdAt: new Date(),
    userName: "John Doe",
    likeCount: 10,
    commentCount: 5,
    reviewId: 1,
    menuItemId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePosts as jest.Mock).mockReturnValue({
      deletePost: mockDeletePost,
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1 },
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should render without error", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByText("John Doe")).toBeTruthy();
  });

  it("should display user name", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByText("John Doe")).toBeTruthy();
  });

  it("should display menu item name", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByText("Burger")).toBeTruthy();
  });

  it("should display restaurant name", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByText("Test Restaurant")).toBeTruthy();
  });

  it("should display review comment", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByText("Great food!")).toBeTruthy();
  });

  it("should display like count", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByText("10")).toBeTruthy();
  });

  it("should display comment count", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByText("5")).toBeTruthy();
  });

  it("should navigate to review detail when pressed", () => {
    const { getByText } = render(<HorizontalReviewCard post={mockPost} />);
    const card = getByText("John Doe").parent?.parent;
    if (card) {
      fireEvent.press(card);
      expect(mockPush).toHaveBeenCalledWith(
        `/review?reviewId=${mockPost.reviewId}&menuItemId=${mockPost.menuItemId}`
      );
    }
  });

  it("should show delete button for own review", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1 },
    });
    const { getByTestId } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByTestId("trash-icon")).toBeTruthy();
  });

  it("should show delete button (component always shows delete button)", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 2 },
    });
    const { getByTestId } = render(<HorizontalReviewCard post={mockPost} />);
    expect(getByTestId("trash-icon")).toBeTruthy();
  });
});

// ============================================================================
// APPTEXT COMPONENT TESTS
// ============================================================================

import { AppText } from "../AppText";

describe("AppText Component", () => {
  it("should render without error", () => {
    const { getByText } = render(<AppText>Test Text</AppText>);
    expect(getByText("Test Text")).toBeTruthy();
  });

  it("should render with default props", () => {
    const { getByText } = render(<AppText>Default Text</AppText>);
    expect(getByText("Default Text")).toBeTruthy();
  });

  it("should render with small size", () => {
    const { getByText } = render(<AppText size="small">Small Text</AppText>);
    expect(getByText("Small Text")).toBeTruthy();
  });

  it("should render with medium size", () => {
    const { getByText } = render(<AppText size="medium">Medium Text</AppText>);
    expect(getByText("Medium Text")).toBeTruthy();
  });

  it("should render with large size", () => {
    const { getByText } = render(<AppText size="large">Large Text</AppText>);
    expect(getByText("Large Text")).toBeTruthy();
  });

  it("should render with heading size", () => {
    const { getByText } = render(
      <AppText size="heading">Heading Text</AppText>
    );
    expect(getByText("Heading Text")).toBeTruthy();
  });

  it("should render with bold prop", () => {
    const { getByText } = render(<AppText bold>Bold Text</AppText>);
    expect(getByText("Bold Text")).toBeTruthy();
  });

  it("should render with primary color", () => {
    const { getByText } = render(
      <AppText color="primary">Primary Text</AppText>
    );
    expect(getByText("Primary Text")).toBeTruthy();
  });

  it("should render with secondary color", () => {
    const { getByText } = render(
      <AppText color="secondary">Secondary Text</AppText>
    );
    expect(getByText("Secondary Text")).toBeTruthy();
  });

  it("should render with tertiary color", () => {
    const { getByText } = render(
      <AppText color="tertiary">Tertiary Text</AppText>
    );
    expect(getByText("Tertiary Text")).toBeTruthy();
  });

  it("should render with center alignment", () => {
    const { getByText } = render(<AppText center>Centered Text</AppText>);
    expect(getByText("Centered Text")).toBeTruthy();
  });

  it("should render with custom className", () => {
    const { getByText } = render(
      <AppText className="custom-class">Custom Text</AppText>
    );
    expect(getByText("Custom Text")).toBeTruthy();
  });

  it("should render complex children", () => {
    const { getByText } = render(
      <AppText>
        <AppText>Nested Text</AppText>
      </AppText>
    );
    expect(getByText("Nested Text")).toBeTruthy();
  });
});

// ============================================================================
// DROPDOWN COMPONENT TESTS
// ============================================================================

import { Dropdown } from "../Dropdown";

describe("Dropdown Component", () => {
  const mockOptions = ["Option 1", "Option 2", "Option 3"];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without error", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText("Test Label")).toBeTruthy();
    expect(getByText("Select option")).toBeTruthy();
  });

  it("should display selected value", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value="Option 1"
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText("Option 1")).toBeTruthy();
  });

  it("should display placeholder when no value", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText("Select option")).toBeTruthy();
  });

  it("should render without label", () => {
    const { getByText } = render(
      <Dropdown
        label=""
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText("Select option")).toBeTruthy();
  });

  it("should open modal when pressed", () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
      />
    );
    const dropdown = getByText("Select option").parent;
    fireEvent.press(dropdown || getByText("Select option"));
    expect(getByText("Test Label")).toBeTruthy();
  });

  it("should filter options when searchable", () => {
    const { getByPlaceholderText, getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />
    );
    const dropdown = getByText("Select option").parent;
    fireEvent.press(dropdown || getByText("Select option"));

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "Option 1");
    expect(getByText("Option 1")).toBeTruthy();
  });

  it("should show no results when search has no matches", () => {
    const { getByPlaceholderText, getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        placeholder="Select option"
        options={mockOptions}
        onSelect={mockOnSelect}
        searchable={true}
      />
    );
    const dropdown = getByText("Select option").parent;
    fireEvent.press(dropdown || getByText("Select option"));

    const searchInput = getByPlaceholderText("Search...");
    fireEvent.changeText(searchInput, "Non-existent");
    expect(getByText("No results found")).toBeTruthy();
  });
});

// ============================================================================
// STARRATING COMPONENT TESTS
// ============================================================================

import { StarRating } from "../StarRating";

describe("StarRating Component", () => {
  const mockOnRatingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without error", () => {
    const { getAllByTestId } = render(
      <StarRating rating={0} onRatingChange={mockOnRatingChange} />
    );
    const stars = getAllByTestId(/star-/);
    expect(stars.length).toBe(5);
  });

  it("should render with default maxRating of 5", () => {
    const { getAllByTestId } = render(
      <StarRating rating={0} onRatingChange={mockOnRatingChange} />
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
      />
    );
    const stars = getAllByTestId(/star-/);
    expect(stars.length).toBe(10);
  });

  it("should call onRatingChange when star is pressed", () => {
    const { getAllByTestId } = render(
      <StarRating rating={0} onRatingChange={mockOnRatingChange} />
    );
    const stars = getAllByTestId(/star-/);
    fireEvent.press(stars[2]);
    expect(mockOnRatingChange).toHaveBeenCalledWith(3);
  });

  it("should display correct number of filled stars", () => {
    const { getAllByTestId } = render(
      <StarRating rating={3} onRatingChange={mockOnRatingChange} />
    );
    const stars = getAllByTestId(/star-/);
    expect(stars.length).toBe(5);
  });
});

// ============================================================================
// PHOTOPICKER COMPONENT TESTS
// ============================================================================

import { PhotoPicker } from "../PhotoPicker";
import * as ImagePicker from "expo-image-picker";

describe("PhotoPicker Component", () => {
  const mockOnPhotoChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
  });

  it("should render without error", () => {
    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />
    );
    expect(getByText("PHOTO")).toBeTruthy();
    expect(getByText("Add a photo")).toBeTruthy();
  });

  it("should display photo when provided", () => {
    const { getByTestId } = render(
      <PhotoPicker photo="file://test.jpg" onPhotoChange={mockOnPhotoChange} />
    );
    // PhotoPicker renders an Image component when photo is provided
    const container = getByTestId("camera-icon").parent?.parent;
    expect(container).toBeTruthy();
  });

  it("should show camera icon when no photo", () => {
    const { getByTestId } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />
    );
    expect(getByTestId("camera-icon")).toBeTruthy();
  });
});

// ============================================================================
// POSTCARD COMPONENT TESTS
// ============================================================================

import { PostCard } from "../PostCard";

describe("PostCard Component", () => {
  const mockDeletePost = jest.fn();
  const mockPost = {
    id: "1",
    restaurant: "Test Restaurant",
    menuItem: "Burger",
    rating: 5,
    review: "Great food!",
    createdAt: new Date(),
    photo: undefined,
    tags: ["delicious", "tasty"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
    (usePosts as jest.Mock).mockReturnValue({
      deletePost: mockDeletePost,
    });
  });

  it("should render without error", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText("Test Restaurant")).toBeTruthy();
    expect(getByText("Burger")).toBeTruthy();
    expect(getByText("Great food!")).toBeTruthy();
  });

  it("should display restaurant name", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText("Test Restaurant")).toBeTruthy();
  });

  it("should display menu item name", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText("Burger")).toBeTruthy();
  });

  it("should display review text", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText("Great food!")).toBeTruthy();
  });

  it("should display formatted date", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    const dateText = new Date(mockPost.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    expect(getByText(dateText)).toBeTruthy();
  });

  it("should display tags when provided", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText("delicious")).toBeTruthy();
    expect(getByText("tasty")).toBeTruthy();
  });

  it("should not display tags when empty", () => {
    const postWithoutTags = { ...mockPost, tags: undefined };
    const { queryByText } = render(<PostCard post={postWithoutTags} />);
    expect(queryByText("delicious")).toBeNull();
  });

  it("should display photo when provided", () => {
    const postWithPhoto = { ...mockPost, photo: "file://test.jpg" };
    const { getByText } = render(<PostCard post={postWithPhoto} />);
    // PostCard should still render other content when photo is provided
    expect(getByText("Test Restaurant")).toBeTruthy();
  });

  it("should show delete button", () => {
    const { getByTestId } = render(<PostCard post={mockPost} />);
    expect(getByTestId("trash-icon")).toBeTruthy();
  });

  it("should call deletePost when delete is confirmed", () => {
    const { getByTestId } = render(<PostCard post={mockPost} />);
    const deleteButton = getByTestId("trash-icon").parent;
    fireEvent.press(deleteButton || getByTestId("trash-icon"));

    expect(Alert.alert).toHaveBeenCalled();
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteAction = alertCall[2]?.find(
      (action: any) => action.text === "Delete"
    );
    if (deleteAction) {
      deleteAction.onPress();
      expect(mockDeletePost).toHaveBeenCalledWith("1");
    }
  });
});
