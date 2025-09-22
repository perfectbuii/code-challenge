-- Database schema initialization
-- This file contains table definitions and structure only

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_deleted_at ON resources(deleted_at);
