import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const handleAuthCallback = useCallback(async () => {
    try {
      console.log('Auth callback received:', {
        token: searchParams.get('token')?.substring(0, 20),
        type: searchParams.get('type'),
        email: searchParams.get('email'),
        code: searchParams.get('code')
      });

      // Check for error first
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        throw new Error(errorDescription || error);
      }

      // Get token from URL
      const token = searchParams.get('token') || searchParams.get('token_hash');
      const type = searchParams.get('type') || 'signup';

      if (token) {
        // Verify OTP token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (verifyError) throw verifyError;
      } else {
        // If no token, check for session directly
        console.log('No token found, checking existing session...');
      }

      // Get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session) {
        console.log('Session obtained:', session.user.email);
        setStatus('success');
        setMessage('Successfully authenticated! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // If no session, redirect to auth page
        setStatus('error');
        setMessage('No session found. Redirecting to login...');
        setTimeout(() => navigate('/auth'), 2000);
      }

    } catch (error: any) {
      console.error('Auth callback error:', error);
      setStatus('error');
      
      if (error.message?.includes('expired')) {
        setMessage('Verification link has expired. Please request a new one.');
      } else if (error.message?.includes('invalid')) {
        setMessage('Invalid verification link.');
      } else if (error.message?.includes('already confirmed')) {
        // User is already confirmed, redirect to login
        setStatus('success');
        setMessage('Email already confirmed. Redirecting to login...');
        setTimeout(() => navigate('/auth'), 1500);
      } else {
        setMessage(error.message || 'Authentication failed');
      }
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  const resendVerification = async () => {
    const email = searchParams.get('email');
    if (!email) {
      setMessage('No email found to resend verification');
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      setMessage(`New verification email sent to ${email}`);
    } catch (error: any) {
      setMessage(`Failed to resend: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Completing authentication...</h1>
            <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Success!</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="pt-4">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                className="w-full mt-2"
              >
                Go to Login
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Authentication Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="space-y-2 pt-4">
              {searchParams.get('email') && (
                <Button onClick={resendVerification} variant="outline" className="w-full">
                  Resend Verification Email
                </Button>
              )}
              <Button onClick={() => navigate('/auth')} className="w-full">
                Return to Login
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                Go to Homepage
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;