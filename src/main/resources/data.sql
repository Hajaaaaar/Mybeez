-- Step 1: Disable foreign key checks to allow truncating
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Truncate all tables to ensure a clean slate
TRUNCATE TABLE wishlist_items;
TRUNCATE TABLE reviews;
TRUNCATE TABLE experience_images;
TRUNCATE TABLE availability;
TRUNCATE TABLE experience_session_types;
TRUNCATE TABLE experience_tags;
TRUNCATE TABLE experiences;
TRUNCATE TABLE locations;
TRUNCATE TABLE experience_categories;
TRUNCATE TABLE users;

-- Step 3: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 4: Insert fresh data into the corrected schema

-- USERS (Hosts 1-3, User 4, Admin 5)
INSERT INTO users (
    id, first_name, last_name, email, password_hash, role, summary, profile_picture_url,
    created_at, updated_at, registration_date,
    active, banned, deleted
) VALUES
      (1, 'Lina', 'Smith', 'lina@example.com', '$2a$10$ocZhKCyRuzeWOekkUH41C.6Hli8YLi0u5DPGD1MnGQLwsYTvncxYO', 'HOST', 'Passionate yoga teacher and wellness coach.', '/images/yoga1.jpg', NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0'),
      (2, 'James', 'Brown', 'james@example.com', '$2a$10$ocZhKCyRuzeWOekkUH41C.6Hli8YLi0u5DPGD1MnGQLwsYTvncxYO', 'HOST', 'Creative photographer and experienced tour guide.', '/images/photography2.jpg', NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0'),
      (3, 'Amina', 'Bennani', 'amina@example.com', '$2a$10$ocZhKCyRuzeWOekkUH41C.6Hli8YLi0u5DPGD1MnGQLwsYTvncxYO', 'HOST', 'Skilled chef specializing in authentic Moroccan cuisine.', '/images/cooking3.jpg', NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0'),
      (4, 'John', 'Doe', 'john.doe@example.com', '$2a$10$Pr3sF5a2xW3y4S5b6c7D8e.G9H0i1J2k3L4m5N6o7P8q9R0s1T2u', 'USER', 'Regular user for testing.', NULL, NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0'),
      (5, 'Mohamed', 'Sheekh', 'Mohamedsheekhadmin@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa8cVnM6mEwQzJcV2FsdzjG8y0VY5c5e', 'ADMIN', 'System administrator.', '/images/admin.jpg', NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0'),
      (6, 'Shashank', 'Ramesha', 'shashank@gmail.com', '$2a$10$0SaeCTgfwDUvN/i8wpS2B.RBAauHw.7csV6Wg/dWDfycwg92IucrG', 'HOST', 'The main host for testing.', NULL, NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0'),
      (7, 'Test', 'User', 'testuser@example.com', '$2a$10$ocZhKCyRuzeWOekkUH41C.6Hli8YLi0u5DPGD1MnGQLwsYTvncxYO', 'USER', 'Account for login testing.', NULL, NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0'),
      (8, 'Test', 'Admin', 'testadmin@example.com', '$2a$10$ocZhKCyRuzeWOekkUH41C.6Hli8YLi0u5DPGD1MnGQLwsYTvncxYO', 'ADMIN', 'Account for admin login testing.', NULL, NOW(), NOW(), CURRENT_TIMESTAMP, b'1', b'0', b'0');


-- CATEGORIES
INSERT INTO experience_categories (id, name, description) VALUES
                                                              (1, 'Food & Drink', 'Cooking classes, wine tastings, and food tours.'),
                                                              (2, 'Arts & Culture', 'Museum tours, pottery, painting classes, and concerts.'),
                                                              (3, 'Nature & Outdoors', 'Hiking, kayaking, stargazing, and wildlife tours.'),
                                                              (4, 'Fitness & Wellness', 'Yoga, gym classes, meditation retreats, and mindfulness workshops.'),
                                                              (5, 'Entertainment', 'Comedy shows, live music, themed parties, and local gigs.'),
                                                              (6, 'Workshops & Skills', 'Crafting, coding, public speaking, and other skills.');


-- LOCATIONS
INSERT INTO locations (id, address, city, postcode) VALUES
                                                        (1, 'Cardiff Bay', 'Cardiff', 'CF10 4GA'),
                                                        (2, 'Central London', 'London', 'WC2N 5DN'),
                                                        (3, 'Souk Semmarine', 'Marrakesh', '40000'),
                                                        (4, 'Cardiff Castle', 'Cardiff', 'CF10 3RB'),
                                                        (5, 'Gower Peninsula', 'Swansea', 'SA3 1DE');

-- EXPERIENCES
INSERT INTO experiences (id, title, description, status, host_id, category_id, location_id, group_price_per_person, private_price_per_session, created_at, updated_at, duration_in_minutes, rating)
VALUES
    (1, 'Sunset Yoga by the Sea', 'Join us for a calming sunset yoga session overlooking the waves of Cardiff Bay.', 'APPROVED', 1, 4, 1, 25.00, 120.00, NOW(), NOW(), 90, 4.5),
    (2, 'Street Photography Masterclass', 'Explore urban photography techniques in this hands-on city tour experience.', 'APPROVED', 2, 2, 2, 60.00, 80.00, NOW(), NOW(), 120, 5.0),
    (3, 'Moroccan Cooking Experience', 'Learn to make traditional Moroccan tagines and mint tea with a local chef.', 'APPROVED', 3, 1, 3, 30.00, 150.00, NOW(), NOW(), 150, 4.5),
    (4, 'Cardiff History Tour', 'A walking tour of Cardiff Castle and surrounding historic sites.', 'PENDING', 6, 2, 4, 35.00, 140.00, NOW(), NOW(), 180, NULL),
    (5, 'Gower Coastline Hike', 'A beautiful and challenging hike along the stunning Gower coastline.', 'APPROVED', 6, 3, 5, 50.00, 200.00, NOW(), NOW(), 240, NULL),
    (6, 'Baking Welsh Cakes', 'A fun and delicious workshop learning to make traditional Welsh cakes.', 'COMPLETED', 6, 1, 1, 40.00, 160.00, NOW(), NOW(), 90, NULL);


-- IMAGES
INSERT INTO experience_images (experience_id, url, public_id) VALUES
                                                                  (1, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100259/yoga1_v8udtz.jpg', 'img_y1'),
                                                                  (1, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100259/yoga2_uhckkl.jpg', 'img_y2'),
                                                                  (1, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100259/yoga3_li6ig6.png', 'img_y3'),
                                                                  (1, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100259/yoga4_t77bus.webp', 'img_y4'),
                                                                  (1, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100259/yoga5_duv9s6.jpg', 'img_y5'),
                                                                  (2, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100258/photography1_ew75ql.jpg', 'img_p1'),
                                                                  (2, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100258/photography2_ph4pcb.jpg', 'img_p2'),
                                                                  (2, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100258/photography3_sl1x2c.jpg', 'img_p3'),
                                                                  (2, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100259/photography4_wcw2pt.jpg', 'img_p4'),
                                                                  (3, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100258/cooking1_yghokb.jpg', 'img_c1'),
                                                                  (3, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100257/cooking2_cnrm6y.jpg', 'img_c2'),
                                                                  (3, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100257/cooking3_rfikv8.jpg', 'img_c3'),
                                                                  (3, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1755100258/cooking4_fxu2om.jpg', 'img_c4'),
                                                                  (4, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1753136499/vabgqhszu694jhq1uuny.jpg', 'img_h1'),
                                                                  (5, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1753136499/vabgqhszu694jhq1uuny.jpg', 'img_h2'),
                                                                  (6, 'https://res.cloudinary.com/dxzxsw8qn/image/upload/v1753136499/vabgqhszu694jhq1uuny.jpg', 'img_h3');


-- AVAILABILITY
DELETE FROM availability WHERE experience_id = 4;
INSERT INTO availability (date, start_time, end_time, capacity, experience_id) VALUES
                                                                                   ('2025-08-01', '10:00:00', '13:00:00', 10, 4),
                                                                                   ('2025-08-03', '09:00:00', '12:00:00', 8, 4),
                                                                                   ('2025-08-08', '14:00:00', '17:00:00', 12, 4),
                                                                                   ('2025-08-12', '10:30:00', '13:30:00', 6, 4),
                                                                                   ('2025-08-15', '16:00:00', '19:00:00', 10, 4),
                                                                                   ('2025-08-22', '11:00:00', '14:00:00', 8, 4),
                                                                                   ('2025-08-25', '15:00:00', '18:00:00', 10, 4),
                                                                                   ('2025-08-28', '09:30:00', '12:30:00', 12, 4);

DELETE FROM availability WHERE experience_id = 5;
INSERT INTO availability (date, start_time, end_time, capacity, experience_id) VALUES
                                                                                   ('2025-08-05', '09:00:00', '13:00:00', 8, 5),
                                                                                   ('2025-08-02', '08:00:00', '12:00:00', 6, 5),
                                                                                   ('2025-08-07', '13:00:00', '17:00:00', 10, 5),
                                                                                   ('2025-08-10', '10:00:00', '14:00:00', 8, 5),
                                                                                   ('2025-08-14', '15:00:00', '19:00:00', 12, 5),
                                                                                   ('2025-08-18', '09:00:00', '13:00:00', 8, 5),
                                                                                   ('2025-08-21', '14:00:00', '18:00:00', 10, 5),
                                                                                   ('2025-08-26', '11:00:00', '15:00:00', 6, 5),
                                                                                   ('2025-08-30', '16:00:00', '20:00:00', 8, 5);

DELETE FROM availability WHERE experience_id = 6;
INSERT INTO availability (date, start_time, end_time, capacity, experience_id) VALUES
                                                                                   ('2025-08-20', '14:00:00', '15:30:00', 10, 6),
                                                                                   ('2025-08-04', '10:00:00', '11:30:00', 12, 6),
                                                                                   ('2025-08-06', '13:30:00', '15:00:00', 8, 6),
                                                                                   ('2025-08-09', '15:00:00', '16:30:00', 10, 6),
                                                                                   ('2025-08-13', '11:30:00', '13:00:00', 6, 6),
                                                                                   ('2025-08-16', '14:30:00', '16:00:00', 12, 6),
                                                                                   ('2025-08-19', '10:30:00', '12:00:00', 8, 6),
                                                                                   ('2025-08-23', '16:30:00', '18:00:00', 10, 6),
                                                                                   ('2025-08-27', '12:00:00', '13:30:00', 8, 6),
                                                                                   ('2025-08-29', '09:00:00', '10:30:00', 12, 6);
-- SESSION TYPES
INSERT INTO experience_session_types (experience_id, session_type) VALUES
                                                                       (1, 'GROUP'), (1, 'PRIVATE'),
                                                                       (2, 'GROUP'), (2, 'PRIVATE'),
                                                                       (3, 'GROUP'), (3, 'PRIVATE'),
                                                                       (4, 'GROUP'),(4, 'PRIVATE'),
                                                                       (5, 'PRIVATE'),
                                                                       (6, 'GROUP'), (6, 'PRIVATE');

-- REVIEWS
INSERT INTO reviews (experience_id, reviewer_name, review_text, rating, created_at, updated_at, status)
VALUES
    (1, 'David Chen', 'An amazing and calming yoga session by the sea.', 5, NOW(), NOW(), 'PENDING'),
    (1, 'Emily Nguyen', 'Loved the peaceful setting and flow.', 4, NOW(), NOW(), 'PENDING'),
    (2, 'Alex Patel', 'Learned a lot about street photography. Highly recommended!', 5, NOW(), NOW(), 'PENDING'),
    (3, 'John Smith', 'Authentic Moroccan experience, would go again!', 4, NOW(), NOW(), 'PENDING'),
    (3, 'Fatima Zahra', 'Incredible food, atmosphere, and instruction.', 5, NOW(), NOW(), 'PENDING');



-- WISHLIST
INSERT INTO wishlist_items (user_id, experience_id)
VALUES
    (4, 1),
    (4, 3);

INSERT INTO experience_session_types (experience_id, session_type)
VALUES
    (1, 'GROUP'),
    (1, 'PRIVATE'),
    (2, 'GROUP'),
    (2, 'PRIVATE'),
    (3, 'GROUP'),
    (3, 'PRIVATE');

INSERT INTO availability (experience_id, date, start_time, end_time, capacity) VALUES
-- Sample availability for 'Sunset Yoga by the Sea' (experience_id = 1)
(1, '2025-07-23', '18:00:00', '19:30:00', 10),
(1, '2025-07-24', '18:00:00', '19:30:00', 9),
(1, '2025-07-25', '18:00:00', '19:30:00', 14),
(1, '2025-07-26', '10:00:00', '11:30:00', 15),
(1, '2025-07-27', '18:00:00', '19:30:00', 15),
(1, '2025-08-05', '18:00:00', '19:30:00', 12),
(1, '2025-07-25', '18:00:00', '19:30:00', 1),
(1, '2025-07-26', '10:00:00', '11:30:00', 1),
(1, '2025-07-27', '18:00:00', '19:30:00', 1),

-- Sample availability for 'Street Photography Masterclass' (experience_id = 2)
(2, '2025-07-27', '13:00:00', '15:00:00', 8),
(2, '2025-08-10', '13:00:00', '15:00:00', 8),
(2, '2025-07-30', '18:00:00', '19:30:00', 1),
(2, '2025-08-5', '10:00:00', '11:30:00', 1),

-- Sample availability for 'Morrocan Cooking Class' (experience_id = 3)
(3, '2025-08-27', '13:00:00', '15:00:00', 8),
(3, '2025-09-10', '13:00:00', '15:00:00', 8),
(3, '2025-08-25', '18:00:00', '19:30:00', 1),
(3, '2025-09-01', '10:00:00', '11:30:00', 1);

INSERT INTO coupons (code, discount_percentage, expiry_date, is_active, created_at)
VALUES ('SUMMER20', 20.00, '2025-09-30', true, NOW());


INSERT INTO personal_schedule_entries (host_id, title, description, start_time, end_time, created_at, updated_at)
VALUES
    -- JULY 2025 (3 entries)
    (6, 'Team Meeting', 'Weekly team sync for MyBeez platform', '2025-07-15 10:00:00', '2025-07-15 11:30:00', NOW(), NOW()),
    (6, 'Dentist Appointment', 'Regular dental checkup', '2025-07-22 15:00:00', '2025-07-22 16:00:00', NOW(), NOW()),
    (6, 'Weekend Camping', 'Camping trip to Pembrokeshire', '2025-07-26 09:00:00', '2025-07-27 18:00:00', NOW(), NOW()),

    -- AUGUST 2025 (3 entries)
    (6, 'Birthday Party', 'Friend\'s birthday celebration', '2025-08-05 19:00:00', '2025-08-05 23:00:00', NOW(), NOW()),
    (6, 'Code Review', 'Review pull requests and merge code', '2025-08-14 13:00:00', '2025-08-14 15:00:00', NOW(), NOW()),
    (6, 'Wedding', 'Friend\'s wedding ceremony', '2025-08-24 12:00:00', '2025-08-24 23:00:00', NOW(), NOW()),

    -- SEPTEMBER 2025 (3 entries)
    (6, 'Team Meeting', 'Weekly team sync for MyBeez platform', '2025-09-08 10:00:00', '2025-09-08 11:30:00', NOW(), NOW()),
    (6, 'Rugby Match', 'Wales vs England at Principality', '2025-09-14 14:00:00', '2025-09-14 18:00:00', NOW(), NOW()),
    (6, 'Conference', 'Tech conference in Bristol', '2025-09-26 08:00:00', '2025-09-26 18:00:00', NOW(), NOW());