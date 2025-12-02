import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getUserReviews,
  type Review as UserReview,
} from "@/services/userService";
import { deleteReview } from "@/services/reviewService";
import { useAuth } from "./AuthContext";

export type Post = {
  id: string;
  restaurant: string;
  menuItem: string;
  rating: number;
  photo?: string;
  review: string;
  tags?: string[];
  createdAt: Date;
  reviewId?: number;
  menuItemId?: number;
  userName?: string;
  likeCount?: number;
  commentCount?: number;
};

type PostsContextType = {
  posts: Post[];
  addPost: (post: Omit<Post, "id" | "createdAt">) => void;
  deletePost: (postId: string) => Promise<void>;
  updatePost: (
    reviewId: number,
    updates: { likeCount?: number; commentCount?: number }
  ) => void;
  loadUserReviews: () => Promise<void>;
  loading: boolean;
};

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Convert backend Review to Post format
const convertReviewToPost = (review: UserReview): Post => {
  return {
    id: `review-${review.id}`,
    restaurant: review.restaurant_name || "Unknown Restaurant",
    menuItem: review.menu_item_name || "Unknown Item",
    rating: review.rating,
    photo:
      review.photos && review.photos.length > 0 ? review.photos[0] : undefined,
    review: review.comment || "",
    tags: review.tags || [],
    createdAt: new Date(review.created_at),
    reviewId: review.id,
    menuItemId: review.menu_item_id,
    userName: review.user_name,
    likeCount: review.like_count ?? 0,
    commentCount: review.comment_count ?? 0,
  };
};

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const loadUserReviews = async () => {
    if (!user || !isAuthenticated) {
      setPosts([]);
      return;
    }

    try {
      setLoading(true);
      const reviews = await getUserReviews(user.id);
      const convertedPosts = reviews.map(convertReviewToPost);
      // Sort by creation date, newest first
      convertedPosts.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      setPosts(convertedPosts);
    } catch (error) {
      console.error("Error loading user reviews:", error);
      // Don't clear posts on error, just log it
    } finally {
      setLoading(false);
    }
  };

  // Load reviews when user logs in or changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserReviews();
    } else {
      // Clear posts when user logs out
      setPosts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const addPost = (postData: Omit<Post, "id" | "createdAt">) => {
    const newPost: Post = {
      ...postData,
      id: postData.reviewId
        ? `review-${postData.reviewId}`
        : Date.now().toString(),
      createdAt: new Date(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const deletePost = async (postId: string) => {
    // Find the post to get the reviewId
    const postToDelete = posts.find((post) => post.id === postId);

    if (!postToDelete) {
      console.warn("Post not found for deletion:", postId);
      return;
    }

    // If it's a review from the backend (has reviewId), delete it from the backend
    if (postToDelete.reviewId) {
      try {
        await deleteReview(postToDelete.reviewId);
        // Remove from local state after successful deletion
        setPosts((prev) => prev.filter((post) => post.id !== postId));
      } catch (error) {
        console.error("Failed to delete review from backend:", error);
        // Still remove from local state even if backend call fails
        // (optimistic update - user sees it removed immediately)
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        throw error; // Re-throw so UI can show error if needed
      }
    } else {
      // If it's a local-only post (no reviewId), just remove from state
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    }
  };

  const updatePost = (
    reviewId: number,
    updates: { likeCount?: number; commentCount?: number }
  ) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.reviewId === reviewId
          ? {
              ...post,
              likeCount:
                updates.likeCount !== undefined
                  ? updates.likeCount
                  : post.likeCount,
              commentCount:
                updates.commentCount !== undefined
                  ? updates.commentCount
                  : post.commentCount,
            }
          : post
      )
    );
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        addPost,
        deletePost,
        updatePost,
        loadUserReviews,
        loading,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
