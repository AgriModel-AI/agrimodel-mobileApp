export interface User {
  userId: number;
  names: string;
  profilePicture: string;
}

export interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
  userId: number;
  names: string;
  postId?: number;
}

export interface Post {
  user: User;
  postId: number;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  imageUrl: string;
  communityId: number;
  comments: Comment[];
}

export interface Community {
  communityId: number;
  name: string;
  image: string;
  description: string;
  createdAt: string;
  users: number;
  posts: number;
  joined: boolean;
}