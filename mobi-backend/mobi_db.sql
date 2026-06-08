CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,

  target_answers TEXT,
  acceptable_answers TEXT,

  next_activity TEXT,

  teach_prompt TEXT,
  teach_tone TEXT,

  ask_prompt TEXT,
  max_attempts INTEGER,
  hint1 TEXT,
  hint2 TEXT,
  hint3 TEXT,

  correct_prompt TEXT,
  correct_tone TEXT,
  reward TEXT,

  support_prompt TEXT,
  support_tone TEXT,
  failed_action TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE activities
DROP COLUMN prerequisite;



-- Create learners table
CREATE TABLE learners (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthday DATE NOT NULL,
  age INTEGER,
  diagnosis TEXT NOT NULL,
  profile_picture_url TEXT,
  bio_description TEXT,
  guardian_first_name TEXT NOT NULL,
  guardian_last_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  guardian_email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better search performance
CREATE INDEX idx_learners_guardian_email ON learners(guardian_email);
CREATE INDEX idx_learners_name ON learners(first_name, last_name);

-- Function to auto-calculate age
CREATE OR REPLACE FUNCTION update_learner_age()
RETURNS TRIGGER AS $$
BEGIN
  NEW.age = EXTRACT(YEAR FROM age(NEW.birthday));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update age on insert/update
CREATE TRIGGER trigger_update_learner_age
BEFORE INSERT OR UPDATE OF birthday ON learners
FOR EACH ROW
EXECUTE FUNCTION update_learner_age();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learners_updated_at
BEFORE UPDATE ON learners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Add next_activity column to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS next_activity TEXT;


-- Optional: Add audio URL columns (for future use)
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS teach_audio_url TEXT,
ADD COLUMN IF NOT EXISTS correct_audio_url TEXT,
ADD COLUMN IF NOT EXISTS support_audio_url TEXT;



-- Add image/photo columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS activity_image_url TEXT,
ADD COLUMN IF NOT EXISTS teach_image_url TEXT,
ADD COLUMN IF NOT EXISTS correct_image_url TEXT,
ADD COLUMN IF NOT EXISTS support_image_url TEXT;


-- Add all missing columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS next_activity TEXT,
ADD COLUMN IF NOT EXISTS activity_image_url TEXT,
ADD COLUMN IF NOT EXISTS teach_image_url TEXT,
ADD COLUMN IF NOT EXISTS correct_image_url TEXT,
ADD COLUMN IF NOT EXISTS support_image_url TEXT;

-- Verify columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'activities'
ORDER BY ordinal_position;


ALTER TABLE learners
ADD CONSTRAINT unique_learner
UNIQUE (
  first_name,
  last_name,
  birthday
);