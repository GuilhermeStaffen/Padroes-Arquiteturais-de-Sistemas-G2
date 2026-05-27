export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
