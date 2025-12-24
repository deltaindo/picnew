-- Migration: Create registration_links table
-- This creates the missing registration_links table that's referenced by the links routes

CREATE TABLE IF NOT EXISTS registration_links (
    id SERIAL PRIMARY KEY,
    token VARCHAR(50) UNIQUE NOT NULL,
    training_id INT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    class_level VARCHAR(255),
    personnel_type VARCHAR(255),
    max_registrations INT DEFAULT 25,
    current_registrations INT DEFAULT 0,
    expiry_date TIMESTAMP,
    whatsapp_link TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registration_links_token ON registration_links(token);
CREATE INDEX IF NOT EXISTS idx_registration_links_training_id ON registration_links(training_id);

-- Verify table creation
SELECT 'registration_links table created successfully' as status;
