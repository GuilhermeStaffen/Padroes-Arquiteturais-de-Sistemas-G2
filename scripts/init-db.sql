CREATE DATABASE IF NOT EXISTS ticket_system;
USE ticket_system;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Users
INSERT IGNORE INTO users (id, username, is_admin, created_at) VALUES 
('admin1-id', 'admin1', TRUE, NOW()),
('admin2-id', 'admin2', TRUE, NOW()),
('user1-id', 'user1', FALSE, NOW()),
('user2-id', 'user2', FALSE, NOW());

