# # drop table reviews;
# # drop table experience_images;
# # drop table experiences;
# # drop table experience_categories;
# # drop table users;
#
#
# CREATE DATABASE IF NOT EXISTS mybeezdb;
# USE mybeezdb;
#
# -- USERS TABLE (FROM INCOMING SCHEMA)
# CREATE TABLE IF NOT EXISTS users (
#                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
#                                      first_name VARCHAR(100) NOT NULL,
#                                      last_name VARCHAR(100) NOT NULL,
#                                      email VARCHAR(100) NOT NULL UNIQUE,
#                                      password_hash VARCHAR(255) NOT NULL,
#                                      role ENUM('ADMIN', 'HOST', 'USER') NOT NULL DEFAULT 'USER',
#                                      summary TEXT,
#                                      profile_picture_url VARCHAR(255),
#                                      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );
#
# -- EXPERIENCE CATEGORIES TABLE (FROM INCOMING SCHEMA)
# CREATE TABLE IF NOT EXISTS experience_categories (
#                                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
#                                                      name VARCHAR(100) NOT NULL,
#                                                      description TEXT
# );
#
# -- EXPERIENCES TABLE (FROM INCOMING SCHEMA)
# CREATE TABLE IF NOT EXISTS experiences (
#                                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
#                                            host_id BIGINT,
#                                            category_id BIGINT,
#                                            title VARCHAR(255),
#                                            description TEXT,
#                                            location TEXT,
#                                            duration_minutes INT,
#                                            session_type ENUM('Individual', 'Group'),
#                                            image_url VARCHAR(255),
#                                            rating FLOAT DEFAULT 0.0,
#                                            group_price_per_person INT,
#                                            private_price INT,
#                                            group_min_attendees INT,
#                                            group_max_attendees INT,
#                                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#                                            FOREIGN KEY (host_id) REFERENCES users(id),
#                                            FOREIGN KEY (category_id) REFERENCES experience_categories(id)
# );
#
# -- EXPERIENCE IMAGES TABLE (FROM INCOMING SCHEMA)
# CREATE TABLE IF NOT EXISTS experience_images (
#                                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
#                                                  experience_id BIGINT NOT NULL,
#                                                  image_url VARCHAR(255) NOT NULL,
#                                                  FOREIGN KEY (experience_id) REFERENCES experiences(id)
# );
#
# -- REVIEWS TABLE (FROM INCOMING SCHEMA)
# CREATE TABLE IF NOT EXISTS reviews (
#                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
#                                        experience_id BIGINT NOT NULL,
#                                        reviewer_name VARCHAR(100) NOT NULL,
#                                        review_text TEXT,
#                                        rating INT CHECK (rating BETWEEN 1 AND 5),
#                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                                        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
# );
#
# -- WISHLIST ITEMS TABLE (ADDED FROM YOUR SCHEMA AND ADAPTED)
# CREATE TABLE IF NOT EXISTS wishlist_items (
#                                               id BIGINT PRIMARY KEY AUTO_INCREMENT,
#                                               user_id BIGINT,
#                                               experience_id BIGINT,
#                                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                                               FOREIGN KEY (user_id) REFERENCES users(id),
#                                               FOREIGN KEY (experience_id) REFERENCES experiences(id)
# );
