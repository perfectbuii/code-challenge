-- Database seed data
-- This file contains sample data for development and testing

-- Insert sample resources
INSERT INTO resources (name, description, category) VALUES 
    ('User Management API', 'API for managing user accounts', 'Authentication'),
    ('Payment Gateway', 'Integration with payment services', 'Finance'),
    ('Email Service', 'Service for sending emails', 'Communication'),
    ('File Storage', 'Cloud file storage solution', 'Storage'),
    ('Analytics Dashboard', 'Real-time analytics dashboard', 'Analytics')
ON CONFLICT (id) DO NOTHING;
