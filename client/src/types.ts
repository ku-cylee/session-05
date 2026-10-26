export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface PostInput {
  title: string;
  content: string;
}
