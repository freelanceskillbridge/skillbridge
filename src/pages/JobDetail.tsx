import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Send,
  Lock,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileIcon,
  Download,
  FolderX,
} from 'lucide-react';
import { uploadToCloudinary, formatFileSize, checkCloudinaryConfig, downloadFile } from '@/utils/cloudinary';

interface Job {
  id: string;
  title: string;
  description: string;
  instructions: string;
  payment_amount: number;
  difficulty: string;
  required_tier: string;
  estimated_time: string | null;
  deadline: string | null;
  submission_format: string | null;
  max_submissions: number | null;
  current_submissions: number;
  category: { name: string } | null;
  job_file_url: string | null;
  job_file_name: string | null;
  job_file_type: string | null;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Check Cloudinary config on load
    const config = checkCloudinaryConfig();
    if (config.isDemo) {
      console.warn(config.message);
      toast({
        title: 'Cloudinary Demo Mode',
        description: 'File uploads use temporary storage. For permanent storage, configure Cloudinary.',
        variant: 'default',
        duration: 5000,
      });
    }
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        const { data: jobData, error } = await supabase
          .from('jobs')
          .select('*, category:job_categories(name)')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching job:', error);
          toast({
            title: 'Error',
            description: 'Failed to load job details',
            variant: 'destructive',
          });
        } else if (jobData) {
          setJob(jobData as unknown as Job);
        }

        // Check if user has already submitted
        if (user) {
          const { data: submissionData } = await supabase
            .from('job_submissions')
            .select('id')
            .eq('job_id', id)
            .eq('user_id', user.id)
            .maybeSingle();

          setHasSubmitted(!!submissionData);
        }
      } catch (error) {
        console.error('Exception fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, user, toast]);

  const canAccessJob = () => {
    if (!job || !profile) return false;
    const tierHierarchy = ['none', 'regular', 'pro', 'vip'];
    const userTierIndex = tierHierarchy.indexOf(profile.membership_tier);
    const requiredTierIndex = tierHierarchy.indexOf(job.required_tier);
    return userTierIndex >= requiredTierIndex;
  };

  const canSubmit = () => {
    if (!profile || !job) return false;
    if (profile.membership_tier === 'none') return false;
    if (hasSubmitted) return false;
    
    // Check daily limit
    const dailyLimit = profile.membership_tier === 'vip' ? Infinity :
      profile.membership_tier === 'pro' ? 6 : 4;
    if (profile.daily_tasks_used >= dailyLimit) return false;
    
    return canAccessJob();
  };

  // Trigger file input click
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 100MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  // Handle job file download - DIRECT DOWNLOAD
  // Handle job file download - FIXED VERSION
  const handleDownloadJobFile = async () => {
    if (!job?.job_file_url) {
      toast({
        title: 'File not available',
        description: 'Job file is not available for download',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await downloadFile(
        job.job_file_url, 
        job.job_file_name || 'job_file'
      );
      
      if (!success) {
        throw new Error('Download failed');
      }
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the job file',
        variant: 'destructive',
      });
    }
  };

  // Handle work submission
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !job || !canSubmit()) return;

    // Validate required fields
    if (!uploadedFile && !submissionContent.trim()) {
      toast({
        title: 'Submission Required',
        description: 'Please either upload a file or enter submission content.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;

      // Upload file if provided
      if (uploadedFile) {
        try {
          setIsUploading(true);
          console.log('Starting file upload...');
          fileUrl = await uploadToCloudinary(uploadedFile);
          fileName = uploadedFile.name;
          fileType = uploadedFile.type;
          fileSize = uploadedFile.size;
          console.log('File upload completed:', { fileUrl, fileName });
          setIsUploading(false);
        } catch (uploadError: any) {
          console.error('File upload failed:', uploadError);
          toast({
            title: 'File upload failed',
            description: 'Failed to upload file. Please try submitting as text instead.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
      }

      // Create submission record
      const submissionData: any = {
        job_id: job.id,
        user_id: user.id,
        submission_content: submissionContent || (uploadedFile ? `File uploaded: ${fileName}` : 'Submitted work'),
        payment_amount: job.payment_amount,
        status: 'pending',
      };

      // Store file information if uploaded
      if (fileUrl) {
        // Store in multiple columns for compatibility
        submissionData.submission_url = fileUrl;  // For backward compatibility
        submissionData.file_url = fileUrl;        // New column
        submissionData.worker_file_url = fileUrl; // New column
        submissionData.file_name = fileName;
        submissionData.worker_file_name = fileName;
        if (fileType) submissionData.file_type = fileType;
        if (fileSize) submissionData.file_size = fileSize;
        
        console.log('Storing file data:', {
          submission_url: fileUrl,
          file_url: fileUrl,
          worker_file_url: fileUrl,
          file_name: fileName
        });
      }

      console.log('Submitting data to database:', submissionData);
      const { error: submissionError } = await supabase
        .from('job_submissions')
        .insert([submissionData]);

      if (submissionError) {
        console.error('Database submission error:', submissionError);
        throw submissionError;
      }

      // Update daily tasks used
      if (profile) {
        await supabase
          .from('profiles')
          .update({ daily_tasks_used: (profile.daily_tasks_used || 0) + 1 })
          .eq('id', user.id);
      }

      // Update job submission count
      await supabase
        .from('jobs')
        .update({ current_submissions: (job.current_submissions || 0) + 1 })
        .eq('id', job.id);

      toast({
        title: 'Submission Successful!',
        description: 'Your work has been submitted for review.',
      });
      
      setHasSubmitted(true);
      setUploadedFile(null);
      setSubmissionContent('');

      // Navigate to submissions page after a delay
      setTimeout(() => {
        navigate('/submissions');
      }, 1500);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit your work',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'hard':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This job may have been removed or doesn't exist.
          </p>
          <Button variant="outline" asChild>
            <Link to="/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{job.title}</h1>
                {!canAccessJob() && (
                  <Lock className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                  {job.category?.name || 'General'}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(job.difficulty)}`}>
                  {job.difficulty}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {job.required_tier.toUpperCase()} tier
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary">
                <DollarSign className="w-6 h-6" />
                <span className="text-3xl font-bold">{job.payment_amount}</span>
              </div>
              <p className="text-sm text-muted-foreground">per submission</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-secondary/30">
            {job.estimated_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{job.estimated_time}</span>
              </div>
            )}
            {job.submission_format && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{job.submission_format}</span>
              </div>
            )}
            {job.max_submissions && (
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Spots: </span>
                {job.current_submissions}/{job.max_submissions}
              </div>
            )}
            {job.deadline && (
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Deadline: </span>
                {new Date(job.deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* JOB FILE DOWNLOAD SECTION */}
          <div className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  job.job_file_url ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {job.job_file_url ? (
                    <Download className="w-5 h-5 text-primary" />
                  ) : (
                    <FolderX className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Job Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.job_file_url 
                      ? 'Download the required file to complete this job' 
                      : 'No uploaded files for this task'}
                  </p>
                </div>
              </div>
              
              {job.job_file_url ? (
                <Button
                  variant="hero"
                  size="sm"
                  onClick={handleDownloadJobFile}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No file available
                </div>
              )}
            </div>
            
            {job.job_file_url && job.job_file_name && (
              <div className="mt-3 pl-13">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileIcon className="w-3 h-3" />
                  <span>File: {job.job_file_name}</span>
                  {job.job_file_type && (
                    <span className="text-xs px-2 py-0.5 bg-secondary rounded">
                      {job.job_file_type}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Instructions</h2>
              <p className="text-foreground whitespace-pre-wrap">{job.instructions}</p>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        {!canAccessJob() ? (
          <div className="glass-card p-6 text-center">
            <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Upgrade Required
            </h3>
            <p className="text-muted-foreground mb-4">
              This job requires a {job.required_tier.toUpperCase()} membership or higher.
            </p>
            <Button variant="hero" asChild>
              <Link to="/pricing">View Membership Plans</Link>
            </Button>
          </div>
        ) : hasSubmitted ? (
          <div className="glass-card p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Already Submitted
            </h3>
            <p className="text-muted-foreground mb-4">
              You've already submitted work for this job. Check your submissions for status updates.
            </p>
            <Button variant="outline" asChild>
              <Link to="/submissions">View My Submissions</Link>
            </Button>
          </div>
        ) : (
          <div className="glass-card p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Submit Your Work</h2>
            
            <form onSubmit={handleSubmitWork} className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Upload Your Completed Work</Label>
                  <span className="text-sm text-muted-foreground">Recommended</span>
                </div>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar,.mp4,.mp3,.xls,.xlsx,.ppt,.pptx"
                  disabled={isUploading || isSubmitting}
                />
                
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select your completed work file
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your completed work file
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleFileUploadClick}
                      className="mx-auto"
                      disabled={isUploading || isSubmitting}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Maximum file size: 100MB
                    </p>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-4 bg-secondary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <FileIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground truncate max-w-[300px]">
                            {uploadedFile.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{formatFileSize(uploadedFile.size)}</span>
                            <span>•</span>
                            <span>{uploadedFile.type || 'Unknown type'}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-8 w-8 p-0"
                        disabled={isUploading || isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* OR Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              {/* Text Submission Alternative */}
              <div className="space-y-2">
                <Label htmlFor="submissionContent">Submit as Text (Alternative)</Label>
                <Textarea
                  id="submissionContent"
                  placeholder="If you prefer to submit as text, enter your completed work here..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={6}
                  disabled={isUploading || isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Use this if you cannot upload a file. File upload is preferred.
                </p>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                className="w-full py-6 text-lg"
                disabled={isSubmitting || isUploading || (!uploadedFile && !submissionContent.trim())}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {uploadedFile ? 'Submit Work with File' : 'Submit Work'}
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;