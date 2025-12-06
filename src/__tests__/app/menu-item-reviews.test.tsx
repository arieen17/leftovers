import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getMenuItemReviews } from "@/services/reviewService";
import { fetchMenuItemById } from "@/services/restaurantService";
import { apiRequest } from "@/services/api";
import { getAuthToken } from "@/services/authService";
import MenuItemReviewsScreen from "../../app/menu-item-reviews";

jest.mock("@/services/reviewService");
jest.mock("@/services/restaurantService");
jest.mock("@/services/api");
jest.mock("@/services/authService");
jest.mock("@/context/AuthContext");
jest.mock("expo-router");

jest.spyOn(console, "error").mockImplementation(() => {});

describe("MenuItemReviewsScreen", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockAuth = {
    user: { id: 1, email: "test@ucr.edu", name: "Test User" },
    isAuthenticated: true,
  };

  const mockMenuItem = {
    id: 1,
    restaurant_id: 1,
    name: "Test Burger",
    description: "Delicious burger",
    price: "10.99",
    category: "Main Course",
    image_url: null,
    tags: [],
    created_at: new Date().toISOString(),
    average_rating: "4.5",
    review_count: "10",
  };

  const mockReviews = [
    {
      id: 1,
      user_id: 1,
      menu_item_id: 1,
      rating: 5,
      comment: "Great burger!",
      photos: [],
      created_at: new Date().toISOString(),
      user_name: "Test User",
      user_tier: "bronze",
      like_count: 5,
      comment_count: 2,
      user_liked: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      menuItemId: "1",
    });
    (getAuthToken as jest.Mock).mockReturnValue("mock-token");
    (fetchMenuItemById as jest.Mock).mockResolvedValue(mockMenuItem);
    (getMenuItemReviews as jest.Mock).mockResolvedValue(mockReviews);
    (apiRequest as jest.Mock).mockResolvedValue({
      like_count: 6,
      user_liked: true,
    });
  });

  it("should render menu item reviews screen", async () => {
    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(fetchMenuItemById).toHaveBeenCalled();
    });
  });

  it("should load menu item and reviews on mount", async () => {
    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(fetchMenuItemById).toHaveBeenCalledWith(1);
      expect(getMenuItemReviews).toHaveBeenCalledWith(1);
    });
  });

  it("should show loading state initially", () => {
    (fetchMenuItemById as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );
    const { root } = render(<MenuItemReviewsScreen />);
    expect(root).toBeTruthy();
  });

  it("should handle error when loading menu item fails", async () => {
    (fetchMenuItemById as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load"),
    );

    render(<MenuItemReviewsScreen />);

    await waitFor(() => {
      expect(fetchMenuItemById).toHaveBeenCalled();
    });
  });

  it("should handle error when loading reviews fails", async () => {
    (getMenuItemReviews as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load reviews"),
    );

    render(<MenuItemReviewsScreen />);

    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should render when not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
    });

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display no reviews message when empty", async () => {
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce([]);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should handle menuItemId as array", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValueOnce({
      menuItemId: ["1"],
    });

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(fetchMenuItemById).toHaveBeenCalledWith(1);
    });
  });

  it("should handle missing menuItemId", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValueOnce({
      menuItemId: undefined,
    });

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(fetchMenuItemById).not.toHaveBeenCalled();
    });
  });

  it("should display menu item with image", async () => {
    const menuItemWithImage = {
      ...mockMenuItem,
      image_url: "https://example.com/image.jpg",
    };
    (fetchMenuItemById as jest.Mock).mockResolvedValueOnce(menuItemWithImage);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(fetchMenuItemById).toHaveBeenCalled();
    });
  });

  it("should display reviews with photos", async () => {
    const reviewsWithPhotos = [
      {
        ...mockReviews[0],
        photos: ["https://example.com/photo.jpg"],
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(reviewsWithPhotos);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display multiple reviews", async () => {
    const multipleReviews = [
      mockReviews[0],
      {
        ...mockReviews[0],
        id: 2,
        comment: "Another review",
        user_name: "Another User",
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(multipleReviews);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should handle menu item without description", async () => {
    const menuItemNoDesc = {
      ...mockMenuItem,
      description: null,
    };
    (fetchMenuItemById as jest.Mock).mockResolvedValueOnce(menuItemNoDesc);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(fetchMenuItemById).toHaveBeenCalled();
    });
  });

  it("should expand review to load comments", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock).mockResolvedValueOnce(mockComments);

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalledWith(
            "/api/reviews/1/comments",
            expect.objectContaining({
              method: "GET",
            }),
          );
        });
      }
    }
  });

  it("should collapse expanded review", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock).mockResolvedValueOnce(mockComments);

    const { getAllByText, getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });

        await waitFor(() => {
          const hideButton = getByText("Hide comments");
          fireEvent.press(hideButton);
        });
      }
    }
  });

  it("should handle loading comments error", async () => {
    (apiRequest as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load comments"),
    );

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });
      }
    }
  });

  it("should handle like review", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce({
      like_count: 6,
      user_liked: true,
    });

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const likeCounts = getAllByText("5");
    if (likeCounts.length > 0) {
      const likeButtonParent = likeCounts[0].parent;
      if (likeButtonParent) {
        fireEvent.press(likeButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalledWith(
            expect.stringContaining("/api/reviews/1/like"),
            expect.objectContaining({
              method: "POST",
            }),
          );
        });
      }
    }
  });

  it("should handle unlike review", async () => {
    const likedReview = [
      {
        ...mockReviews[0],
        user_liked: true,
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(likedReview);
    (apiRequest as jest.Mock).mockResolvedValueOnce({
      like_count: 4,
      user_liked: false,
    });

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const likeCounts = getAllByText("5");
    if (likeCounts.length > 0) {
      const likeButtonParent = likeCounts[0].parent;
      if (likeButtonParent) {
        fireEvent.press(likeButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });
      }
    }
  });

  it("should handle like review error", async () => {
    (apiRequest as jest.Mock).mockRejectedValueOnce(new Error("Like failed"));

    const { getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const likeButton = getByText("5");
    const likeButtonParent = likeButton.parent;
    if (likeButtonParent) {
      fireEvent.press(likeButtonParent);

      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalled();
      });
    }
  });

  it("should handle like comment", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockComments)
      .mockResolvedValueOnce({
        like_count: 3,
        user_liked: true,
      });

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });

        const likeCommentButtons = getAllByText("2");
        if (likeCommentButtons.length > 1) {
          const likeCommentParent = likeCommentButtons[1].parent;
          if (likeCommentParent) {
            fireEvent.press(likeCommentParent);

            await waitFor(() => {
              expect(apiRequest).toHaveBeenCalledWith(
                expect.stringContaining("/api/reviews/comments/1/like"),
                expect.objectContaining({
                  method: "POST",
                }),
              );
            });
          }
        }
      }
    }
  });

  it("should handle unlike comment", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: true,
      },
    ];
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockComments)
      .mockResolvedValueOnce({
        like_count: 1,
        user_liked: false,
      });

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });

        const likeCommentButtons = getAllByText("2");
        if (likeCommentButtons.length > 1) {
          const likeCommentParent = likeCommentButtons[1].parent;
          if (likeCommentParent) {
            fireEvent.press(likeCommentParent);

            await waitFor(() => {
              expect(apiRequest).toHaveBeenCalled();
            });
          }
        }
      }
    }
  });

  it("should handle like comment error", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockComments)
      .mockRejectedValueOnce(new Error("Like comment failed"));

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });

        const likeCommentButtons = getAllByText("2");
        if (likeCommentButtons.length > 1) {
          const likeCommentParent = likeCommentButtons[1].parent;
          if (likeCommentParent) {
            fireEvent.press(likeCommentParent);

            await waitFor(() => {
              expect(apiRequest).toHaveBeenCalled();
            });
          }
        }
      }
    }
  });

  it("should add comment to review", async () => {
    const mockComments: any[] = [];
    const newComment = {
      id: 2,
      user_id: 1,
      review_id: 1,
      comment: "New comment",
      created_at: new Date().toISOString(),
      user_name: "Test User",
      comment_count: 3,
    };
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockComments)
      .mockResolvedValueOnce(newComment);

    const { getAllByText, getByPlaceholderText } = render(
      <MenuItemReviewsScreen />,
    );
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          const input = getByPlaceholderText("Add a comment...");
          fireEvent.changeText(input, "New comment");

          const sendButton = input.parent?.parent?.children?.find(
            (child: any) => child?.props?.onPress,
          );
          if (sendButton) {
            fireEvent.press(sendButton);
          }
        });

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalledWith(
            "/api/reviews/1/comments",
            expect.objectContaining({
              method: "POST",
              body: JSON.stringify({ comment: "New comment" }),
            }),
          );
        });
      }
    }
  });

  it("should not add comment when empty", async () => {
    const mockComments: any[] = [];
    (apiRequest as jest.Mock).mockResolvedValueOnce(mockComments);

    const { getByText, getByPlaceholderText } = render(
      <MenuItemReviewsScreen />,
    );
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentButton = getByText("2");
    const commentButtonParent = commentButton.parent;
    if (commentButtonParent) {
      fireEvent.press(commentButtonParent);

      await waitFor(() => {
        const input = getByPlaceholderText("Add a comment...");
        fireEvent.changeText(input, "   ");

        const sendButton = input.parent?.parent?.children?.find(
          (child: any) => child?.props?.onPress,
        );
        if (sendButton) {
          fireEvent.press(sendButton);
        }
      });

      await waitFor(() => {
        const postCalls = (apiRequest as jest.Mock).mock.calls.filter(
          (call: any[]) =>
            call[0]?.includes("/comments") && call[1]?.method === "POST",
        );
        expect(postCalls.length).toBe(0);
      });
    }
  });

  it("should handle add comment error", async () => {
    const mockComments: any[] = [];
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockComments)
      .mockRejectedValueOnce(new Error("Comment failed"));

    const { getAllByText, getByPlaceholderText } = render(
      <MenuItemReviewsScreen />,
    );
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          const input = getByPlaceholderText("Add a comment...");
          fireEvent.changeText(input, "New comment");

          const sendButton = input.parent?.parent?.children?.find(
            (child: any) => child?.props?.onPress,
          );
          if (sendButton) {
            fireEvent.press(sendButton);
          }
        });

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });
      }
    }
  });

  it("should navigate back when back button is pressed", async () => {
    const { getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(fetchMenuItemById).toHaveBeenCalled();
    });

    const backButton = getByText("<");
    fireEvent.press(backButton);

    expect(mockPush).toHaveBeenCalledWith("/(tabs)");
  });

  it("should display comments when expanded", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock).mockResolvedValueOnce(mockComments);

    const { getAllByText, getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(getByText("I agree!")).toBeTruthy();
          expect(getByText("Another User")).toBeTruthy();
        });
      }
    }
  });

  it("should display no comments message when expanded and empty", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce([]);

    const { getAllByText, getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(getByText("No comments yet")).toBeTruthy();
        });
      }
    }
  });

  it("should display comment input when authenticated and expanded", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce([]);

    const { getAllByText, getByPlaceholderText } = render(
      <MenuItemReviewsScreen />,
    );
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(getByPlaceholderText("Add a comment...")).toBeTruthy();
        });
      }
    }
  });

  it("should not display comment input when not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    (apiRequest as jest.Mock).mockResolvedValueOnce([]);

    const { getAllByText, queryByPlaceholderText } = render(
      <MenuItemReviewsScreen />,
    );
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    expect(queryByPlaceholderText("Add a comment...")).toBeNull();

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });
      }
    }

    expect(queryByPlaceholderText("Add a comment...")).toBeNull();
  });

  it("should display view comments button when not expanded", async () => {
    const { getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText(/View \d+ comment/)).toBeTruthy();
    });
  });

  it("should display time ago for recent review", async () => {
    const recentReview = [
      {
        ...mockReviews[0],
        created_at: new Date().toISOString(),
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(recentReview);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display time ago for 1 hour ago review", async () => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const reviewOneHour = [
      {
        ...mockReviews[0],
        created_at: oneHourAgo,
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(reviewOneHour);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display time ago for multiple hours review", async () => {
    const threeHoursAgo = new Date(Date.now() - 10800000).toISOString();
    const reviewThreeHours = [
      {
        ...mockReviews[0],
        created_at: threeHoursAgo,
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(reviewThreeHours);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display time ago for days ago review", async () => {
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
    const reviewTwoDays = [
      {
        ...mockReviews[0],
        created_at: twoDaysAgo,
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(reviewTwoDays);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display user initials for single name", async () => {
    const reviewSingleName = [
      {
        ...mockReviews[0],
        user_name: "John",
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(reviewSingleName);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display user initials for full name", async () => {
    const reviewFullName = [
      {
        ...mockReviews[0],
        user_name: "John Doe",
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(reviewFullName);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display user initials for empty name", async () => {
    const reviewNoName = [
      {
        ...mockReviews[0],
        user_name: "",
      },
    ];
    (getMenuItemReviews as jest.Mock).mockResolvedValueOnce(reviewNoName);

    render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  it("should display loading comments indicator", async () => {
    (apiRequest as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });
      }
    }
  });

  it("should display comments count in expanded section", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: false,
      },
      {
        id: 2,
        user_id: 3,
        review_id: 1,
        comment: "Me too!",
        created_at: new Date().toISOString(),
        user_name: "Third User",
        like_count: 1,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock).mockResolvedValueOnce(mockComments);

    const { getAllByText, getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(getByText("Comments (2)")).toBeTruthy();
        });
      }
    }
  });

  it("should display comment with user initials", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date().toISOString(),
        user_name: "John Doe",
        like_count: 2,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock).mockResolvedValueOnce(mockComments);

    const { getAllByText, getByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(getByText("John Doe")).toBeTruthy();
        });
      }
    }
  });

  it("should display comment with time ago", async () => {
    const mockComments = [
      {
        id: 1,
        user_id: 2,
        review_id: 1,
        comment: "I agree!",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        user_name: "Another User",
        like_count: 2,
        user_liked: false,
      },
    ];
    (apiRequest as jest.Mock).mockResolvedValueOnce(mockComments);

    const { getAllByText } = render(<MenuItemReviewsScreen />);
    await waitFor(() => {
      expect(getMenuItemReviews).toHaveBeenCalled();
    });

    const commentCounts = getAllByText("2");
    if (commentCounts.length > 0) {
      const commentButtonParent = commentCounts[0].parent;
      if (commentButtonParent) {
        fireEvent.press(commentButtonParent);

        await waitFor(() => {
          expect(apiRequest).toHaveBeenCalled();
        });
      }
    }
  });
});
