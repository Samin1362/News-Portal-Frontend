/**
 * Mirrors the backend comment DTOs (see backend/src/views/comment.view.ts).
 * Updated whenever the backend contract changes.
 */

export type CommentStatus = "pending" | "approved" | "rejected";

export interface CommentAuthorDTO {
  id: string;
  displayName: string;
  photoURL: string | null;
}

export interface CommentDTO {
  id: string;
  articleId: string;
  parentId: string | null;
  content: string;
  /** Null when the author account has been deleted. */
  author: CommentAuthorDTO | null;
  likeCount: number;
  /** True only when the signed-in caller has liked this comment. */
  hasLiked: boolean;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithRepliesDTO extends CommentDTO {
  replies: CommentDTO[];
  totalReplies: number;
}
