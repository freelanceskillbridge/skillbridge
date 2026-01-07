import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  Lock,
  ArrowRight,
  Briefcase,
  Upload,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  payment_amount: number;
  difficulty: string;
  required_tier: string;
  estimated_time: string | null;
  deadline: string | null;
  category: { name: string } | null;
}

const Jobs = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const [jobsResult, categoriesResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, title, description, payment_amount, difficulty, required_tier, estimated_time, deadline, category:job_categories(name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase.from('job_categories').select('id, name').order('name'),
      ]);

      if (jobsResult.data) {
        setJobs(jobsResult.data as unknown as Job[]);
      }
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const canAccessJob = (requiredTier: string) => {
    const tierHierarchy = ['none', 'regular', 'pro', 'vip'];
    const userTierIndex = tierHierarchy.indexOf(profile?.membership_tier || 'none');
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
    return userTierIndex >= requiredTierIndex;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'pro':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'regular':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category?.name === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || job.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Available Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Browse and claim jobs that match your skills
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-4">
            {filteredJobs.map((job) => {
              const isAccessible = canAccessJob(job.required_tier);
              return (
                <Link
                  key={job.id}
                  to={isAccessible ? `/jobs/${job.id}` : '/pricing'}
                  className={`glass-card p-6 transition-all hover:border-primary/30 ${
                    !isAccessible ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                        {!isAccessible && (
                          <Lock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                          {job.category?.name || 'General'}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${getDifficultyColor(job.difficulty)}`}>
                          {job.difficulty}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${getTierColor(job.required_tier)}`}>
                          {job.required_tier.toUpperCase()}
                        </span>
                        {job.estimated_time && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {job.estimated_time}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-primary">
                          <DollarSign className="w-5 h-5" />
                          <span className="text-2xl font-bold">{job.payment_amount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">per task</p>
                      </div>
                      <Button variant={isAccessible ? 'hero' : 'outline'} size="sm">
                        {isAccessible ? (
                          <>
                            View Job
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          'Upgrade'
                        )}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check back later for new opportunities
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Jobs;