# Database Schema Specification

## Overview
This document provides the complete database schema design for the Real-time Scoreboard System, including table structures, relationships, indexes, and optimization strategies.

## Table Specifications

### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_password_length CHECK (length(password_hash) >= 60)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE is_active = true;
CREATE INDEX idx_users_username ON users(username) WHERE is_active = true;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Purpose**: Store user account information with authentication data
**Estimated Rows**: 1M+ users
**Growth Rate**: ~1000 new users/day
**Query Patterns**: Lookup by email/username (authentication), role-based queries

### 2. User Scores Table

```sql
CREATE TABLE user_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_score BIGINT DEFAULT 0,
    lifetime_score BIGINT DEFAULT 0,
    rank_position INTEGER,
    best_rank INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT user_scores_user_id_unique UNIQUE (user_id),
    CONSTRAINT user_scores_current_score_positive CHECK (current_score >= 0),
    CONSTRAINT user_scores_lifetime_score_positive CHECK (lifetime_score >= 0),
    CONSTRAINT user_scores_rank_positive CHECK (rank_position > 0)
);

-- Performance Indexes
CREATE UNIQUE INDEX idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX idx_user_scores_current_score_desc ON user_scores(current_score DESC, last_updated ASC);
CREATE INDEX idx_user_scores_rank_position ON user_scores(rank_position) WHERE rank_position IS NOT NULL;
CREATE INDEX idx_user_scores_last_updated ON user_scores(last_updated);

-- Partial index for top performers
CREATE INDEX idx_user_scores_top_1000 ON user_scores(current_score DESC) 
    WHERE rank_position <= 1000;

-- Triggers
CREATE TRIGGER update_user_scores_updated_at
    BEFORE UPDATE ON user_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Purpose**: Store current and lifetime scores for each user
**Estimated Rows**: 1M+ records (1:1 with users)
**Growth Rate**: Minimal (grows with users)
**Query Patterns**: Leaderboard queries (ORDER BY score DESC), user rank lookups

### 3. Score History Table (Partitioned)

```sql
-- Parent table
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_change BIGINT NOT NULL,
    score_before BIGINT NOT NULL,
    score_after BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_source VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Monthly partitions (example for 2025)
CREATE TABLE score_history_2025_01 PARTITION OF score_history
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE score_history_2025_02 PARTITION OF score_history
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- ... continue for each month

-- Indexes on partitions
CREATE INDEX idx_score_history_2025_01_user_id ON score_history_2025_01(user_id);
CREATE INDEX idx_score_history_2025_01_created_at ON score_history_2025_01(created_at);
CREATE INDEX idx_score_history_2025_01_action_type ON score_history_2025_01(action_type);

-- Function to create new partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
    
    -- Create indexes
    EXECUTE format('CREATE INDEX idx_%s_user_id ON %I(user_id)', partition_name, partition_name);
    EXECUTE format('CREATE INDEX idx_%s_created_at ON %I(created_at)', partition_name, partition_name);
    EXECUTE format('CREATE INDEX idx_%s_action_type ON %I(action_type)', partition_name, partition_name);
END;
$$ LANGUAGE plpgsql;
```

**Purpose**: Track all score changes with full audit trail
**Estimated Rows**: 100M+ records (high volume)
**Growth Rate**: ~100k new records/day
**Query Patterns**: User history queries (by user_id + date range), analytics queries

### 4. Leaderboard Snapshots Table

```sql
CREATE TABLE leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type VARCHAR(20) NOT NULL DEFAULT 'all-time',
    top_10_data JSONB NOT NULL,
    snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_users INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_period_type CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all-time')),
    CONSTRAINT top_10_data_not_empty CHECK (jsonb_array_length(top_10_data) > 0)
);

-- Indexes
CREATE INDEX idx_leaderboard_snapshots_period_time ON leaderboard_snapshots(period_type, snapshot_time DESC);
CREATE INDEX idx_leaderboard_snapshots_created_at ON leaderboard_snapshots(created_at);

-- GIN index for JSONB queries
CREATE INDEX idx_leaderboard_snapshots_top_10_gin ON leaderboard_snapshots USING GIN (top_10_data);
```

**Purpose**: Store periodic leaderboard snapshots for historical analysis
**Estimated Rows**: 50k+ records
**Growth Rate**: ~100 snapshots/day
**Query Patterns**: Historical leaderboard lookups, trend analysis

### 5. Audit Logs Table (Partitioned)

```sql
-- Parent table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    before_data JSONB,
    after_data JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes
CREATE INDEX idx_audit_logs_2025_01_user_id ON audit_logs_2025_01(user_id);
CREATE INDEX idx_audit_logs_2025_01_created_at ON audit_logs_2025_01(created_at);
CREATE INDEX idx_audit_logs_2025_01_action ON audit_logs_2025_01(action);
CREATE INDEX idx_audit_logs_2025_01_resource ON audit_logs_2025_01(resource_type, resource_id);
CREATE INDEX idx_audit_logs_2025_01_ip_address ON audit_logs_2025_01(ip_address);
```

**Purpose**: Complete audit trail for security and compliance
**Estimated Rows**: 500M+ records
**Growth Rate**: ~1M records/day
**Query Patterns**: Security investigations, compliance reporting, user activity tracking

### 6. Authentication Tables

#### Refresh Tokens
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT refresh_tokens_token_hash_unique UNIQUE (token_hash),
    CONSTRAINT refresh_tokens_expires_future CHECK (expires_at > CURRENT_TIMESTAMP)
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash) WHERE NOT is_revoked;

-- Cleanup expired tokens
CREATE INDEX idx_refresh_tokens_cleanup ON refresh_tokens(expires_at) WHERE NOT is_revoked;
```

#### User Sessions
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_sessions_session_token_unique UNIQUE (session_token)
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id) WHERE is_active;
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token) WHERE is_active;
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

## Materialized Views

### Top 10 Real-time Leaderboard
```sql
CREATE MATERIALIZED VIEW top_10_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY us.current_score DESC, us.last_updated ASC) AS rank,
    u.id as user_id,
    u.username,
    u.first_name,
    u.last_name,
    us.current_score,
    us.last_updated
FROM user_scores us
JOIN users u ON us.user_id = u.id
WHERE u.is_active = true 
  AND us.current_score > 0
ORDER BY us.current_score DESC, us.last_updated ASC
LIMIT 10;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_top_10_leaderboard_rank ON top_10_leaderboard(rank);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_top_10_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY top_10_leaderboard;
END;
$$ LANGUAGE plpgsql;
```

### User Rank Lookup View
```sql
CREATE MATERIALIZED VIEW user_rank_lookup AS
SELECT 
    u.id as user_id,
    u.username,
    us.current_score,
    ROW_NUMBER() OVER (ORDER BY us.current_score DESC, us.last_updated ASC) AS rank_position
FROM user_scores us
JOIN users u ON us.user_id = u.id
WHERE u.is_active = true 
  AND us.current_score > 0
ORDER BY us.current_score DESC, us.last_updated ASC;

-- Index for fast user rank lookups
CREATE UNIQUE INDEX idx_user_rank_lookup_user_id ON user_rank_lookup(user_id);
CREATE INDEX idx_user_rank_lookup_rank ON user_rank_lookup(rank_position);
```

## Functions and Triggers

### Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Rank Update Function
```sql
CREATE OR REPLACE FUNCTION update_user_ranks()
RETURNS void AS $$
BEGIN
    -- Update all user ranks based on current scores
    WITH ranked_users AS (
        SELECT 
            us.user_id,
            ROW_NUMBER() OVER (ORDER BY us.current_score DESC, us.last_updated ASC) AS new_rank
        FROM user_scores us
        JOIN users u ON us.user_id = u.id
        WHERE u.is_active = true
    )
    UPDATE user_scores us
    SET rank_position = ru.new_rank,
        best_rank = LEAST(COALESCE(us.best_rank, ru.new_rank), ru.new_rank)
    FROM ranked_users ru
    WHERE us.user_id = ru.user_id;
END;
$$ LANGUAGE plpgsql;
```

### Score Update Trigger
```sql
CREATE OR REPLACE FUNCTION log_score_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert score history record
    INSERT INTO score_history (
        user_id,
        score_change,
        score_before,
        score_after,
        action_type,
        action_source
    ) VALUES (
        NEW.user_id,
        NEW.current_score - OLD.current_score,
        OLD.current_score,
        NEW.current_score,
        'score_update',
        'user_action'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_score_change
    AFTER UPDATE OF current_score ON user_scores
    FOR EACH ROW
    WHEN (OLD.current_score IS DISTINCT FROM NEW.current_score)
    EXECUTE FUNCTION log_score_change();
```
