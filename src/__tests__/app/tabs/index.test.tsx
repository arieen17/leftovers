import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { usePosts } from "@/context/PostsContext";
import { useAuth } from "@/context/AuthContext";
import { searchRestaurantsAndItems } from "@/services/restaurantService";
import { getPopularItems } from "@/services/recommendationService";
import HomeScreen from "../../../app/(tabs)/index";

jest.mock("@/services/restaurantService");
jest.mock("@/services/recommendationService");
jest.mock("@/context/PostsContext");
jest.mock("@/context/AuthContext");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn((callback) => {
    callback();
  }),
}));
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

jest.spyOn(console, "error").mockImplementation(() => {});

describe("HomeScreen (Tabs Index)", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockLoadUserReviews = jest.fn();
  const mockPosts = [
    {
      id: "1",
      restaurant: "Test Restaurant",
      menuItem: "Burger",
      rating: 5,
      review: "Great!",
      createdAt: new Date(),
      userName: "Test User",
      likeCount: 10,
      commentCount: 5,
      reviewId: 1,
      menuItemId: 1,
    },
  ];

  const mockPostsContext = {
    posts: mockPosts,
    loadUserReviews: mockLoadUserReviews,
  };

  const mockAuth = {
    isAuthenticated: true,
    user: { id: 1, email: "test@ucr.edu", name: "Test User" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePosts as jest.Mock).mockReturnValue(mockPostsContext);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (getPopularItems as jest.Mock).mockResolvedValue([]);
    (searchRestaurantsAndItems as jest.Mock).mockResolvedValue({
      restaurants: [],
      menuItems: [],
    });
  });

  it("should render home screen", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Most Popular Dishes")).toBeTruthy();
    expect(getByText("Your Reviews")).toBeTruthy();
  });

  it("should display TopBar and SearchBar", () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    expect(
      getByPlaceholderText("Search restaurants or dishes..."),
    ).toBeTruthy();
  });

  it("should load popular items on mount", async () => {
    const popularItems = [
      {
        id: 1,
        restaurant_id: 1,
        name: "Popular Burger",
        description: "Delicious burger",
        price: "10.99",
        category: "Main",
        image_url: null,
        tags: [],
        created_at: new Date().toISOString(),
        restaurant_name: "Test Restaurant",
        average_rating: "4.5",
        review_count: "10",
      },
    ];

    (getPopularItems as jest.Mock).mockResolvedValueOnce(popularItems);

    render(<HomeScreen />);

    await waitFor(() => {
      expect(getPopularItems).toHaveBeenCalledWith(5);
    });
  });

  it("should load user reviews when authenticated", () => {
    render(<HomeScreen />);
    expect(mockLoadUserReviews).toHaveBeenCalled();
  });

  it("should update search query", () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    const searchInput = getByPlaceholderText("Search restaurants or dishes...");
    fireEvent.changeText(searchInput, "pizza");
    expect(searchInput.props.value).toBe("pizza");
  });

  it("should perform search when search button is pressed", async () => {
    const mockResults = {
      restaurants: [
        {
          id: 1,
          name: "Pizza Place",
          address: "123 Main St",
          cuisine_type: "Italian",
        },
      ],
      menuItems: [],
    };

    (searchRestaurantsAndItems as jest.Mock).mockResolvedValueOnce(mockResults);

    const { getByPlaceholderText } = render(<HomeScreen />);
    const searchInput = getByPlaceholderText("Search restaurants or dishes...");

    fireEvent.changeText(searchInput, "pizza");
    fireEvent(searchInput, "submitEditing");

    await waitFor(() => {
      expect(searchRestaurantsAndItems).toHaveBeenCalledWith("pizza");
    });
  });

  it("should display no results message when search returns empty", async () => {
    (searchRestaurantsAndItems as jest.Mock).mockResolvedValueOnce({
      restaurants: [],
      menuItems: [],
    });

    const { getByPlaceholderText, getByText } = render(<HomeScreen />);
    const searchInput = getByPlaceholderText("Search restaurants or dishes...");

    fireEvent.changeText(searchInput, "nonexistent");
    fireEvent(searchInput, "submitEditing");

    await waitFor(() => {
      expect(getByText("No results found")).toBeTruthy();
    });
  });

  it("should display user reviews", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Test Restaurant")).toBeTruthy();
    expect(getByText("Burger")).toBeTruthy();
  });

  it("should handle error when loading popular items fails", async () => {
    (getPopularItems as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load"),
    );

    render(<HomeScreen />);

    await waitFor(() => {
      expect(getPopularItems).toHaveBeenCalled();
    });
  });

  it("should handle error when search fails", async () => {
    (searchRestaurantsAndItems as jest.Mock).mockRejectedValueOnce(
      new Error("Search failed"),
    );

    const { getByPlaceholderText } = render(<HomeScreen />);
    const searchInput = getByPlaceholderText("Search restaurants or dishes...");

    fireEvent.changeText(searchInput, "pizza");
    fireEvent(searchInput, "submitEditing");

    await waitFor(() => {
      expect(searchRestaurantsAndItems).toHaveBeenCalled();
    });
  });
});
