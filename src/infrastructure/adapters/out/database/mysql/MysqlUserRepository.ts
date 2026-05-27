import { UserRepository, User } from '../../../../../domain/ports/out/UserRepository';
import { dbPool } from './MysqlConnection';
import { RowDataPacket } from 'mysql2/promise';

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: Date;
}

export class MysqlUserRepository implements UserRepository {
  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await dbPool.execute<UserRow[]>(
      'SELECT id, username, is_admin, created_at FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      isAdmin: Boolean(row.is_admin),
      createdAt: row.created_at,
    };
  }

  async findById(id: string): Promise<User | null> {
    const [rows] = await dbPool.execute<UserRow[]>(
      'SELECT id, username, is_admin, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      isAdmin: Boolean(row.is_admin),
      createdAt: row.created_at,
    };
  }
}