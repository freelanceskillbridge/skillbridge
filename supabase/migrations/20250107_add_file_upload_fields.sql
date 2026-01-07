/*
  # Add File Upload Fields to Job Submissions and Jobs
  
  1. Changes to job_submissions
    - Add file_name column to store uploaded file name
    - Add file_url column to store Google Drive URL
    - Add file_size column to store file size in bytes
    - Add file_type column to store MIME type
    - Add google_drive_file_id to store Google Drive file ID
  
  2. Changes to jobs
    - Add job_file_url for admin-uploaded files
    - Add job_file_name for admin-uploaded file names
    - Add job_file_type for admin-uploaded file types
  
  3. Security
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Add columns to job_submissions if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_submissions' AND column_name = 'file_name') THEN
    ALTER TABLE public.job_submissions ADD COLUMN file_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_submissions' AND column_name = 'file_url') THEN
    ALTER TABLE public.job_submissions ADD COLUMN file_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_submissions' AND column_name = 'file_size') THEN
    ALTER TABLE public.job_submissions ADD COLUMN file_size BIGINT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_submissions' AND column_name = 'file_type') THEN
    ALTER TABLE public.job_submissions ADD COLUMN file_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_submissions' AND column_name = 'google_drive_file_id') THEN
    ALTER TABLE public.job_submissions ADD COLUMN google_drive_file_id TEXT;
  END IF;

  -- Add columns to jobs for admin-uploaded files
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'jobs' AND column_name = 'job_file_url') THEN
    ALTER TABLE public.jobs ADD COLUMN job_file_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'jobs' AND column_name = 'job_file_name') THEN
    ALTER TABLE public.jobs ADD COLUMN job_file_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'jobs' AND column_name = 'job_file_type') THEN
    ALTER TABLE public.jobs ADD COLUMN job_file_type TEXT;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.job_submissions.file_url IS 'Google Drive shareable URL for the uploaded work';
COMMENT ON COLUMN public.job_submissions.google_drive_file_id IS 'Google Drive file ID for direct API access if needed';
COMMENT ON COLUMN public.jobs.job_file_url IS 'Google Drive URL for job files uploaded by admin (hidden from workers)';
COMMENT ON COLUMN public.jobs.job_file_name IS 'File name for job files uploaded by admin';
COMMENT ON COLUMN public.jobs.job_file_type IS 'File type for job files uploaded by admin';