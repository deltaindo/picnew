-- Create registration_links table
CREATE TABLE IF NOT EXISTS registration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(12) NOT NULL UNIQUE,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  class_level VARCHAR(255),
  personnel_type VARCHAR(255),
  max_registrations INTEGER DEFAULT 25,
  current_registrations INTEGER DEFAULT 0,
  expiry_date TIMESTAMP,
  whatsapp_link VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_registration_links_token ON registration_links(token);
CREATE INDEX idx_registration_links_training_id ON registration_links(training_id);
CREATE INDEX idx_registration_links_status ON registration_links(status);
CREATE INDEX idx_registration_links_created_at ON registration_links(created_at DESC);

-- Add comments
COMMENT ON TABLE registration_links IS 'Stores registration links for training programs';
COMMENT ON COLUMN registration_links.token IS 'Unique token for the registration link (12 char alphanumeric)';
COMMENT ON COLUMN registration_links.status IS 'Link status: active, expired, or archived';
