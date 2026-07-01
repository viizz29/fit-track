```sql
-- Enable uuid-ossp extension for UUID generation in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- 1. Users Table
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    email_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- ================================
-- 2. Exercise Types Table
-- ================================
CREATE TABLE exercise_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_exercise_types_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_name UNIQUE(user_id, name)
);

CREATE INDEX idx_exercise_types_user_id ON exercise_types (user_id);

-- ================================
-- 3. Exercise Schedules Table
-- ================================
CREATE TYPE recurrence_type_enum AS ENUM ('HOURLY', 'DAILY', 'WEEKLY');

CREATE TABLE exercise_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    exercise_type_id UUID NOT NULL,
    recurrence_type recurrence_type_enum NOT NULL,
    recurrence_interval INTEGER NOT NULL CHECK (recurrence_interval > 0),
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_schedules_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedules_exercise_type FOREIGN KEY(exercise_type_id) REFERENCES exercise_types(id) ON DELETE CASCADE
);

CREATE INDEX idx_schedules_user_id ON exercise_schedules (user_id);
CREATE INDEX idx_schedules_exercise_type_id ON exercise_schedules (exercise_type_id);

-- ================================
-- 4. Exercise Completions Table
-- ================================
CREATE TABLE exercise_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL,
    completion_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_completions_schedule FOREIGN KEY(schedule_id) REFERENCES exercise_schedules(id) ON DELETE CASCADE
);

CREATE INDEX idx_completions_schedule_id ON exercise_completions (schedule_id);
CREATE INDEX idx_completions_datetime ON exercise_completions (completion_datetime);

-- ================================
-- 5. Email Notifications Table
-- ================================
CREATE TYPE notification_type_enum AS ENUM ('UPCOMING', 'MISSED');
CREATE TYPE email_status_enum AS ENUM ('SENT', 'FAILED');

CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    schedule_id UUID NOT NULL,
    notification_type notification_type_enum NOT NULL,
    sent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    email_status email_status_enum NOT NULL DEFAULT 'SENT',
    CONSTRAINT fk_notifications_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_schedule FOREIGN KEY(schedule_id) REFERENCES exercise_schedules(id) ON DELETE CASCADE,
    CONSTRAINT uq_notification_unique UNIQUE(user_id, schedule_id, notification_type, sent_timestamp)
);

CREATE INDEX idx_notifications_user_id ON email_notifications (user_id);
CREATE INDEX idx_notifications_schedule_id ON email_notifications (schedule_id);
CREATE INDEX idx_notifications_type_sent ON email_notifications (notification_type, sent_timestamp);

-- ================================
-- Triggers to update updated_at timestamp on modification
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_exercise_types_updated_at
BEFORE UPDATE ON exercise_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_exercise_schedules_updated_at
BEFORE UPDATE ON exercise_schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Notes on indexes for performance (applied above):
-- - users: email unique index
-- - exercise_types: user_id, unique on (user_id, name)
-- - exercise_schedules: user_id, exercise_type_id
-- - exercise_completions: schedule_id, completion_datetime
-- - email_notifications: user_id, schedule_id, (notification_type, sent_timestamp)
-- ================================
```