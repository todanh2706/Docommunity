-- Create a dummy user if not exists to assign documents to
-- This ensures we have a valid user_id for the documents
INSERT INTO users (username, password, fullname, email, status, bio, avatar_url, phone_number)
SELECT 'testuser', 'password', 'Test User', 'test@example.com', true, 'Bio for test user', 'default.png', '123456789'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser');

-- Insert 1000 documents
-- Title: Document 1, Document 2, ...
-- Content: Static content as requested
-- Status: ACTIVE
-- Public: true
-- Owner: The 'testuser' created above
INSERT INTO documents (title, content, created_date, last_modified, is_public, status, user_id)
SELECT
    'Document ' || i,
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    CURRENT_DATE,
    CURRENT_DATE,
    true,
    'ACTIVE',
    (SELECT id FROM users WHERE username = 'testuser' LIMIT 1)
FROM generate_series(1, 1000) AS i;
