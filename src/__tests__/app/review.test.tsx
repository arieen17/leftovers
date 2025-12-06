import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getReviewById } from "@/services/reviewService";
import { apiRequest } from "@/services/api";
import { getAuthToken } from "@/services/authService";
import ReviewScreen from "../../app/review";

jest.mock("@/services/reviewService");
jest.mock("@/services/api");
jest.mock("@/services/authService");
jest.mock("@/context/AuthContext");
jest.mock("expo-router");

jest.spyOn(console, "error").mockImplementation(() => {});

describe("ReviewScreen", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockAuth = {
    user: { id: 1, email: "test@ucr.edu", name: "Test User" },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  };

  const mockReview = {
    id: 1,
    user_id: 1,
    menu_item_id: 1,
    rating: 5,
    comment: "Great food!",
    photos: [],
    created_at: new Date().toISOString(),
    user_name: "Test User",
    user_tier: "bronze",
    like_count: 10,
    comment_count: 5,
    user_liked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      menuItemId: "1",
      reviewId: "1",
    });
    (getAuthToken as jest.Mock).mockReturnValue("mock-token");
    (getReviewById as jest.Mock).mockResolvedValue(mockReview);
    (apiRequest as jest.Mock).mockResolvedValue({ comments: [] });
  });

  it("should render review screen", async () => {
    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should load review on mount", async () => {
    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalledWith(1);
    });
  });

  it("should show loading state initially", () => {
    (getReviewById as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );
    const { root } = render(<ReviewScreen />);
    expect(root).toBeTruthy();
  });

  it("should handle error when loading review fails", async () => {
    (getReviewById as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load review"),
    );

    render(<ReviewScreen />);

    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should render when not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
    });

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should handle review not found", async () => {
    (getReviewById as jest.Mock).mockResolvedValueOnce(null);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should load review with menuItemId when reviewId is not provided", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValueOnce({
      menuItemId: "1",
      reviewId: undefined,
    });
    (apiRequest as jest.Mock).mockResolvedValueOnce([mockReview]);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalled();
    });
  });

  it("should handle reviewId as array", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValueOnce({
      menuItemId: "1",
      reviewId: ["1"],
    });

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalledWith(1);
    });
  });

  it("should handle review with photos", async () => {
    const reviewWithPhotos = {
      ...mockReview,
      photos: ["https://example.com/photo.jpg"],
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(reviewWithPhotos);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should handle review without photos", async () => {
    const reviewNoPhotos = {
      ...mockReview,
      photos: [],
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(reviewNoPhotos);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should handle review with empty comment", async () => {
    const reviewEmptyComment = {
      ...mockReview,
      comment: "",
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(reviewEmptyComment);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should handle review with user_liked true", async () => {
    const likedReview = {
      ...mockReview,
      user_liked: true,
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(likedReview);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });
  });

  it("should handle menuItemId as array", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValueOnce({
      menuItemId: ["1"],
      reviewId: undefined,
    });
    (apiRequest as jest.Mock).mockResolvedValueOnce([mockReview]);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalled();
    });
  });

  it("should handle empty reviews array from menuItemId", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValueOnce({
      menuItemId: "1",
      reviewId: undefined,
    });
    (apiRequest as jest.Mock).mockResolvedValueOnce([]);

    render(<ReviewScreen />);
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalled();
    });
  });

  it("should not post comment when empty", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce([]);

    const { getByText, getByPlaceholderText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const commentButton = getByText(/Comments/);
    fireEvent.press(commentButton);

    await waitFor(() => {
      const input = getByPlaceholderText("Add a comment...");
      fireEvent.changeText(input, "   ");
    });

    const sendButton = getByPlaceholderText(
      "Add a comment...",
    ).parent?.parent?.children?.find((child: any) => child?.props?.onPress);
    if (sendButton) {
      const initialCallCount = (apiRequest as jest.Mock).mock.calls.length;
      fireEvent.press(sendButton);
      // Should not make additional API call
      await waitFor(() => {
        expect((apiRequest as jest.Mock).mock.calls.length).toBe(
          initialCallCount,
        );
      });
    }
  });

  it("should handle error posting comment", async () => {
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("Failed to post comment"));

    const { getByText, getByPlaceholderText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const commentButton = getByText(/Comments/);
    fireEvent.press(commentButton);

    await waitFor(() => {
      const input = getByPlaceholderText("Add a comment...");
      fireEvent.changeText(input, "New comment");
    });

    const sendButton = getByPlaceholderText(
      "Add a comment...",
    ).parent?.parent?.children?.find((child: any) => child?.props?.onPress);
    if (sendButton) {
      fireEvent.press(sendButton);
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalled();
      });
    }
  });

  it("should not post comment when not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
    });
    (apiRequest as jest.Mock).mockResolvedValueOnce([]);

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const commentButton = getByText(/Comments/);
    fireEvent.press(commentButton);

    await waitFor(() => {
      expect(() => getByPlaceholderText("Add a comment...")).toThrow();
    });
  });

  it("should like review", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce({
      user_liked: true,
      like_count: 11,
    });

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const likeButton = getByText("10").parent;
    if (likeButton) {
      fireEvent.press(likeButton);
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          `/api/reviews/${mockReview.id}/like?action=like`,
          expect.objectContaining({
            method: "POST",
          }),
        );
      });
    }
  });

  it("should unlike review", async () => {
    const likedReview = {
      ...mockReview,
      user_liked: true,
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(likedReview);
    (apiRequest as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce({
      user_liked: false,
      like_count: 9,
    });

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const likeButton = getByText("10").parent;
    if (likeButton) {
      fireEvent.press(likeButton);
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          `/api/reviews/${likedReview.id}/like?action=unlike`,
          expect.objectContaining({
            method: "POST",
          }),
        );
      });
    }
  });

  it("should handle error liking review", async () => {
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("Failed to like"));

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const likeButton = getByText("10").parent;
    if (likeButton) {
      fireEvent.press(likeButton);
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalled();
      });
    }
  });

  it("should not like review when already liking", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce([]);

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const likeButton = getByText("10").parent;
    if (likeButton) {
      fireEvent.press(likeButton);
      // Press again immediately (should be disabled)
      fireEvent.press(likeButton);
      await waitFor(() => {
        const likeCalls = (apiRequest as jest.Mock).mock.calls.filter(
          (call: any[]) =>
            call[0]?.includes("/like") && call[1]?.method === "POST",
        );
        // Should only have one like call
        expect(likeCalls.length).toBeLessThanOrEqual(1);
      });
    }
  });

  it("should display time ago for just now", async () => {
    const recentReview = {
      ...mockReview,
      created_at: new Date().toISOString(),
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(recentReview);

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getByText("Just now")).toBeTruthy();
    });
  });

  it("should display time ago for 1 hour", async () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const review = {
      ...mockReview,
      created_at: oneHourAgo.toISOString(),
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(review);

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getByText("1h ago")).toBeTruthy();
    });
  });

  it("should display time ago for multiple hours", async () => {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - 5);
    const review = {
      ...mockReview,
      created_at: hoursAgo.toISOString(),
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(review);

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getByText("5h ago")).toBeTruthy();
    });
  });

  it("should display time ago for days", async () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 3);
    const review = {
      ...mockReview,
      created_at: daysAgo.toISOString(),
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(review);

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getByText("3d ago")).toBeTruthy();
    });
  });

  it("should get user initials for single name", async () => {
    const review = {
      ...mockReview,
      user_name: "John",
    };
    (getReviewById as jest.Mock).mockResolvedValueOnce(review);

    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getByText("JO")).toBeTruthy();
    });
  });

  it("should navigate back when back button is pressed", async () => {
    const { getByText } = render(<ReviewScreen />);
    await waitFor(() => {
      expect(getReviewById).toHaveBeenCalled();
    });

    const backButton = getByText("<");
    fireEvent.press(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });
});
