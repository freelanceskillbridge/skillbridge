import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError('');
    setVerificationSent(false);

    try {
      if (isSignUp) {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setApiError('This email is already registered. Please sign in instead.');
          } else {
            setApiError(error.message);
          }
        } else {
          // Successfully signed up - show verification message
          setVerificationSent(true);
          // Clear form data except email
          setFormData(prev => ({
            fullName: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
            email: prev.email, // Keep email for reference
          }));
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setApiError('Invalid email or password. Please try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setApiError('Please verify your email address before logging in. Check your inbox for the verification email.');
          } else {
            setApiError(error.message);
          }
        }
      }
    } catch (err) {
      setApiError('An unexpected error occurred. Please try again.');
    }

    setIsSubmitting(false);
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: 'bg-gray-200', text: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Strong'];
    
    return {
      strength,
      color: colors[strength - 1] || 'bg-gray-200',
      text: texts[strength - 1] || '',
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Skill<span className="text-primary">Bridge</span>
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? 'Start your freelancing journey today'
                : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Verification Success Message */}
          {verificationSent && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Verification Email Sent!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    A verification email has been sent to <strong>{formData.email}</strong>. 
                    Please check your inbox and verify your email address to continue.
                  </p>
                  <div className="mt-3 text-sm text-green-800 space-y-1">
                    <p className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Can't find the email? Check your spam folder.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Once verified, click "Login" to access your dashboard.</span>
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVerificationSent(false);
                        setIsSignUp(false);
                      }}
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && !verificationSent && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {isSignUp && formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.strength >= 4 ? 'text-green-600' :
                      passwordStrength.strength >= 3 ? 'text-yellow-600' :
                      passwordStrength.strength >= 2 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                    />
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      At least 6 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        /\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      One number
                    </li>
                  </ul>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{' '}
                        <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
                          <DialogTrigger asChild>
                            <button 
                              type="button" 
                              className="text-primary hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowTermsDialog(true);
                              }}
                            >
                              Terms of Service
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Terms of Service</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 text-sm">
                              <p><strong>Last Updated:</strong> January 7, 2025</p>
                              
                              <section>
                                <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                                <p>By accessing or using SkillBridge, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our platform.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">2. User Accounts</h3>
                                <p>You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">3. Freelancer Responsibilities</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Complete jobs with due care and professionalism</li>
                                  <li>Submit original work that does not infringe on others' rights</li>
                                  <li>Meet deadlines as specified in job descriptions</li>
                                  <li>Maintain honest and professional communication</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">4. Payments & Fees</h3>
                                <p>SkillBridge handles payments between clients and freelancers. We charge a service fee of 10% on all completed jobs. Payments are processed within 3-5 business days after job approval.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">5. Prohibited Activities</h3>
                                <p>You agree not to engage in any of the following prohibited activities:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Submitting plagiarized or copyrighted material</li>
                                  <li>Creating multiple accounts</li>
                                  <li>Attempting to circumvent the payment system</li>
                                  <li>Harassing other users or staff</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">6. Termination</h3>
                                <p>We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">7. Limitation of Liability</h3>
                                <p>SkillBridge shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
                              </section>
                            </div>
                          </DialogContent>
                        </Dialog>{' '}
                        and{' '}
                        <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
                          <DialogTrigger asChild>
                            <button 
                              type="button" 
                              className="text-primary hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowPrivacyDialog(true);
                              }}
                            >
                              Privacy Policy
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Privacy Policy</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 text-sm">
                              <p><strong>Last Updated:</strong> January 7, 2025</p>
                              
                              <section>
                                <h3 className="font-semibold mb-2">1. Information We Collect</h3>
                                <p>We collect information you provide directly to us, including:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Name, email address, and contact information</li>
                                  <li>Account credentials</li>
                                  <li>Payment information</li>
                                  <li>Job submissions and communications</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Provide, maintain, and improve our services</li>
                                  <li>Process transactions and send related information</li>
                                  <li>Send you technical notices and support messages</li>
                                  <li>Respond to your comments and questions</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">3. Information Sharing</h3>
                                <p>We do not sell your personal information. We may share your information:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>With service providers who assist in our operations</li>
                                  <li>To comply with legal obligations</li>
                                  <li>To protect rights and safety</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">4. Data Security</h3>
                                <p>We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">5. Your Rights</h3>
                                <p>You have the right to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Access your personal information</li>
                                  <li>Correct inaccurate data</li>
                                  <li>Request deletion of your data</li>
                                  <li>Object to our use of your data</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">6. Cookies</h3>
                                <p>We use cookies and similar technologies to track activity on our platform and hold certain information to improve user experience.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">7. Contact Us</h3>
                                <p>If you have questions about this Privacy Policy, please contact us at privacy@skillbridge.com</p>
                              </section>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        You must agree to our Terms of Service and Privacy Policy to create an account.
                      </p>
                      {errors.acceptTerms && (
                        <p className="text-sm text-destructive">{errors.acceptTerms}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              disabled={isSubmitting || verificationSent}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                  setApiError('');
                  setVerificationSent(false);
                }}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-secondary/20 border-l border-border p-12">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Join Thousands of Professionals
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Access curated jobs, guaranteed payments, and build your professional reputation on the most trusted freelancing platform.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div>
              <div className="text-2xl font-bold text-foreground">$2M+</div>
              <div>Paid to freelancers</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div>Satisfaction rate</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <div className="text-2xl font-bold text-foreground">24/7</div>
              <div>Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;