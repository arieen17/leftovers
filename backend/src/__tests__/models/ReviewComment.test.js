const ReviewComment = require("../../models/ReviewComment");
const pool = require("../../../database/config");

jest.mock("../../../database/config");

describe("ReviewComment Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new comment", async () => {
      const commentData = {
        user_id: 1,
        review_id: 1,
        comment: "Great review!",
      };
      const mockComment = { id: 1, ...commentData };
      pool.query.mockResolvedValue({ rows: [mockComment] });

      const result = await ReviewComment.create(commentData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO review_comments"),
        [commentData.user_id, commentData.review_id, commentData.comment],
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe("getByReviewId", () => {
    it("should get comments by review id without userId", async () => {
      const mockComments = [
        { id: 1, review_id: 1, comment: "Nice!", user_name: "John" },
      ];
      pool.query.mockResolvedValue({ rows: mockComments });

      const result = await ReviewComment.getByReviewId(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1],
      );
      expect(result).toEqual(mockComments);
    });

    it("should get comments by review id with userId", async () => {
      const mockComments = [
        { id: 1, review_id: 1, comment: "Nice!", user_liked: false },
      ];
      pool.query.mockResolvedValue({ rows: mockComments });

      const result = await ReviewComment.getByReviewId(1, 2);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1, 2],
      );
      expect(result).toEqual(mockComments);
    });
  });

  describe("likeComment", () => {
    it("should like a comment", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1, like_count: 5 }] });

      const result = await ReviewComment.likeComment(1, 1);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(result).toEqual({ like_count: 5, user_liked: true });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should unlike if already liked", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({});

      ReviewComment.unlikeComment = jest.fn().mockResolvedValue({
        like_count: 4,
        user_liked: false,
      });

      const result = await ReviewComment.likeComment(1, 1);

      expect(ReviewComment.unlikeComment).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ like_count: 4, user_liked: false });
    });
  });

  describe("update", () => {
    it("should update comment", async () => {
      const mockUpdatedComment = {
        id: 1,
        comment: "Updated comment",
        updated_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockUpdatedComment] });

      const result = await ReviewComment.update(1, "Updated comment");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE review_comments"),
        ["Updated comment", 1],
      );
      expect(result).toEqual(mockUpdatedComment);
    });
  });

  describe("delete", () => {
    it("should delete comment", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1, review_id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({});

      const result = await ReviewComment.delete(1);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(result).toEqual({ id: 1 });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should throw error if comment not found", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [] });

      await expect(ReviewComment.delete(999)).rejects.toThrow(
        "Comment not found",
      );
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});
