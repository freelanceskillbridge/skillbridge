import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  ExternalLink,
  Briefcase,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  submission_content: string;
  file_url: string | null;
  worker_file_url: string | null;
  file_name: string | null;
  worker_file_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback: string | null;
  payment_amount: number;
  created_at: string;
  reviewed_at: string | null;
  job: {
    id: string;
    title: string;
    category: { name: string } | null;
  } | null;
}

const Submissions = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch submissions with proper error handling
  const fetchSubmissions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('job_submissions')
        .select(`
          id,
          submission_content,
          file_url,
          worker_file_url,
          file_name,
          worker_file_name,
          status,
          admin_feedback,
          payment_amount,
          created_at,
          reviewed_at,
          job:jobs(
            id,
            title,
            category:job_categories(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load submissions',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        // Transform the data to match our interface
        const formattedData = data.map((item: any) => ({
          ...item,
          job: item.job ? {
            id: item.job.id,
            title: item.job.title,
            category: item.job.category
          } : null
        }));
        
        setSubmissions(formattedData);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, fetchSubmissions]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('submissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_submissions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh submissions when they change
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSubmissions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSubmissions();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  // Get the actual file URL (check both file_url and worker_file_url)
  const getFileUrl = (submission: Submission): string | null => {
    return submission.file_url || submission.worker_file_url;
  };

  // Get the actual file name
  const getFileName = (submission: Submission): string | null => {
    return submission.file_name || submission.worker_file_name || 'Submitted File';
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  const handleDownloadFile = async (submission: Submission) => {
    const fileUrl = getFileUrl(submission);
    const fileName = getFileName(submission);
    
    if (!fileUrl) {
      toast({
        title: 'No file available',
        description: 'This submission does not have an attached file',
        variant: 'destructive',
      });
      return;
    }

    try {
      // For Cloudinary URLs, we can download directly
      if (fileUrl.includes('cloudinary.com')) {
        window.open(fileUrl, '_blank');
      } else {
        // For other URLs, try to download
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName || 'submission_file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }
      
      toast({
        title: 'Download started',
        description: 'Your file download has started',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Could not download the file. Try opening it directly.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Submissions</h1>
            <p className="text-muted-foreground mt-1">
              Track the status of your submitted work
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="hero" asChild>
              <Link to="/jobs">Find More Jobs</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-xl font-bold text-foreground">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold text-foreground">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Updates are shown in real-time</span>
          </div>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const fileUrl = getFileUrl(submission);
              const fileName = getFileName(submission);
              
              return (
                <div key={submission.id} className="glass-card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(submission.status)}
                        <h3 className="font-semibold text-foreground">
                          {submission.job?.title || 'Unknown Job'}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(submission.status)}`}>
                          {submission.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>{submission.job?.category?.name || 'General'}</span>
                        <span>
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                        {submission.reviewed_at && (
                          <span>
                            Reviewed {new Date(submission.reviewed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Submission Content */}
                      {submission.submission_content && (
                        <div className="mt-3 p-3 rounded-lg bg-secondary/50">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Notes: </span>
                            {submission.submission_content}
                          </p>
                        </div>
                      )}
                      
                      {/* Admin Feedback */}
                      {submission.admin_feedback && (
                        <div className="mt-3 p-3 rounded-lg bg-blue-400/10 border border-blue-400/20">
                          <p className="text-sm text-blue-400">
                            <span className="font-medium">Admin Feedback: </span>
                            {submission.admin_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="text-center sm:text-right">
                        <div className="flex items-center justify-center sm:justify-end gap-1 text-primary">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xl font-bold">{submission.payment_amount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {submission.status === 'approved' ? 'Earned' : 
                           submission.status === 'rejected' ? 'Not Paid' : 'Potential'}
                        </p>
                      </div>
                      
                      {/* File Actions */}
                      {fileUrl && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="flex items-center gap-1"
                            title="View file"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(submission)}
                            className="flex items-center gap-1"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {statusFilter === 'all' ? 'No submissions yet' : 'No matching submissions'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter === 'all' 
                ? 'Start working on jobs to see your submissions here'
                : 'No submissions match the selected filter'}
            </p>
            <Button variant="hero" asChild>
              <Link to="/jobs">Browse Available Jobs</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Submissions;