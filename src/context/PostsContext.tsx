import React, { createContext, useContext, useState, ReactNode } from "react";

export type Post = {
  id: string;
  restaurant: string;
  menuItem: string;
  rating: number;
  photo?: string;
  review: string;
  tags?: string[];
  createdAt: Date;
};

type PostsContextType = {
  posts: Post[];
  addPost: (post: Omit<Post, "id" | "createdAt">) => void;
  deletePost: (postId: string) => void;
};

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  const addPost = (postData: Omit<Post, "id" | "createdAt">) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, deletePost }}>
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
