-- Insert default admin user
INSERT INTO users (name, email, password, role, is_active, created_at) 
VALUES ('Admin User', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert sample authors
INSERT INTO authors (name, email, bio, avatar_url, created_at, updated_at) 
VALUES 
('Jane Smith', 'jane@example.com', 'Senior tech journalist with 10+ years of experience covering Silicon Valley and global tech trends.', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('John Doe', 'john@example.com', 'Political analyst specializing in international relations and global economics.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Emily Chen', 'emily@example.com', 'Full-stack developer and technical writer covering the latest in programming and technology.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Michael Rodriguez', 'michael@example.com', 'Gaming industry insider and reviewer with a passion for both indie and AAA titles.', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert sample article
INSERT INTO articles (slug, title, subtitle, content, excerpt, image_url, category, author_id, published_at, updated_at, is_featured, is_draft, view_count)
SELECT 
    'future-of-ai-technology',
    'O Futuro da IA',
    'A deep dive into the most significant AI developments of 2025',
    '<p>Artificial Intelligence continues to evolve at an unprecedented pace. In 2025, we''re seeing AI applications that were considered science fiction just a few years ago.</p><h2>Breakthrough Applications</h2><p>Perhaps the most significant breakthrough has been in healthcare, where AI-driven diagnostic tools are now achieving accuracy rates that surpass human specialists in several fields.</p>',
    'Exploring how AI and machine learning are revolutionizing industries in 2025, from healthcare diagnostics to autonomous manufacturing and beyond.',
    'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg',
    'TECH',
    a.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    true,
    false,
    0
FROM authors a WHERE a.email = 'jane@example.com'
ON CONFLICT (slug) DO NOTHING;

-- Insert tags for the sample article
INSERT INTO article_tags (article_id, tag)
SELECT a.id, 'AI' FROM articles a WHERE a.slug = 'future-of-ai-technology'
UNION ALL
SELECT a.id, 'Machine Learning' FROM articles a WHERE a.slug = 'future-of-ai-technology'
UNION ALL
SELECT a.id, 'Technology' FROM articles a WHERE a.slug = 'future-of-ai-technology'
UNION ALL
SELECT a.id, 'Innovation' FROM articles a WHERE a.slug = 'future-of-ai-technology'
ON CONFLICT DO NOTHING;