-- Fix File Upload Schema Issues

-- 1. Ensure all file columns exist
DO $$ 
BEGIN
  -- Add missing columns to job_submissions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_submissions' AND column_name = 'worker_file_url') THEN
    ALTER TABLE public.job_submissions ADD COLUMN worker_file_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_submissions' AND column_name = 'worker_file_name') THEN
    ALTER TABLE public.job_submissions ADD COLUMN worker_file_name TEXT;
  END IF;

  -- Ensure job file columns exist in jobs table
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

-- 2. Copy existing file_url to worker_file_url for compatibility
UPDATE public.job_submissions 
SET worker_file_url = file_url,
    worker_file_name = file_name
WHERE file_url IS NOT NULL AND worker_file_url IS NULL;

-- 3. Add helpful comments
COMMENT ON COLUMN public.job_submissions.file_url IS 'Cloudinary URL for worker uploaded file (primary storage)';
COMMENT ON COLUMN public.job_submissions.worker_file_url IS 'Alias for file_url - used in admin interface';
COMMENT ON COLUMN public.job_submissions.file_name IS 'Original filename from worker upload';
COMMENT ON COLUMN public.job_submissions.worker_file_name IS 'Alias for file_name';

COMMENT ON COLUMN public.jobs.job_file_url IS 'Cloudinary URL for job files uploaded by admin';
COMMENT ON COLUMN public.jobs.job_file_name IS 'Filename for job files uploaded by admin';
COMMENT ON COLUMN public.jobs.job_file_type IS 'File type for job files uploaded by admin';

-- 4. Create a view for admin submissions that combines both file systems
CREATE OR REPLACE VIEW admin_submissions_view AS
SELECT 
  js.id,
  js.job_id,
  js.user_id,
  js.submission_content,
  js.status,
  js.payment_amount,
  js.created_at,
  js.file_url,
  js.file_name,
  js.file_size,
  js.file_type,
  js.worker_file_url,
  js.worker_file_name,
  COALESCE(js.worker_file_url, js.file_url) as display_file_url,
  COALESCE(js.worker_file_name, js.file_name) as display_file_name,
  j.title as job_title,
  p.email as user_email,
  p.full_name as user_name
FROM job_submissions js
LEFT JOIN jobs j ON js.job_id = j.id
LEFT JOIN profiles p ON js.user_id = p.id;