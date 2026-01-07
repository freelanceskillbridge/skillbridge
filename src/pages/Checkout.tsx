import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader2, Shield, ExternalLink, CreditCard, Lock, AlertCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const planDetails = {
    regular: { name: 'Regular', price: 15, tier: 'regular' },
    pro: { name: 'Pro', price: 25, tier: 'pro' },
    vip: { name: 'VIP', price: 49, tier: 'vip' },
  };

  const currentPlan = plan && plan in planDetails ? planDetails[plan as keyof typeof planDetails] : null;
  
  // CORRECT PayPal email - confirmed
  const paypalEmail = 'freelance.skillbridge@gmail.com';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!currentPlan) {
      navigate('/pricing');
      return;
    }
  }, [user, currentPlan, navigate]);

  const createPayPalLink = () => {
    if (!currentPlan || !user) return '#';
    
    const amount = currentPlan.price;
    const note = `SkillBridge ${currentPlan.name} Membership - ${user.email}`;
    const encodedNote = encodeURIComponent(note);
    
    // Direct PayPal Send Money link
    return `https://www.paypal.com/send?amount=${amount}&email=${paypalEmail}&note=${encodedNote}&currency_code=USD`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(paypalEmail);
    setCopied(true);
    toast({
      title: 'Email copied!',
      description: 'PayPal email copied to clipboard.',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayNow = async () => {
    if (!user || !currentPlan) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Generate PayPal link
      const paypalLink = createPayPalLink();
      
      // Open PayPal immediately
      setPaymentInitiated(true);
      
      // Open PayPal in new tab
      setTimeout(() => {
        try {
          const newWindow = window.open(paypalLink, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            setError('Popup blocked. Please click "Open PayPal Manually" below.');
          }
        } catch (err) {
          setError('Could not open PayPal. Please try the manual option below.');
        }
      }, 100);

      // Try to create transaction record
      try {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'subscription',
            amount: -currentPlan.price,
            status: 'pending',
            description: `${currentPlan.name} Membership - PayPal Payment Pending`,
            reference_id: `paypal_${Date.now()}_${user.id}`
          });

        if (transactionError) {
          console.warn('Transaction record not created:', transactionError);
        }
      } catch (dbError) {
        console.warn('Database operation failed:', dbError);
      }

      // Try to update profile
      try {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            membership_tier: currentPlan.tier,
            membership_expires_at: expiresAt.toISOString(),
            daily_tasks_used: 0,
            membership_status: 'pending_payment'
          })
          .eq('id', user.id);

        if (updateError) {
          console.warn('Profile update failed:', updateError);
        }

        await refreshProfile();
      } catch (profileError) {
        console.warn('Profile update failed:', profileError);
      }

      toast({
        title: 'Redirecting to PayPal',
        description: 'PayPal opened in a new tab. Please complete payment there.',
      });

      // Redirect to dashboard after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setError('Proceeding with PayPal payment. Contact support if you encounter issues.');
      
      // Still open PayPal even if there were errors
      const paypalLink = createPayPalLink();
      setTimeout(() => {
        window.open(paypalLink, '_blank', 'noopener,noreferrer');
      }, 100);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPayPal = () => {
    if (!currentPlan || !user) return;
    
    const amount = currentPlan.price;
    const note = `SkillBridge ${currentPlan.name} Membership - ${user.email}`;
    const encodedNote = encodeURIComponent(note);
    
    const paypalLink = `https://www.paypal.com/send?amount=${amount}&email=${paypalEmail}&note=${encodedNote}&currency_code=USD`;
    
    window.open(paypalLink, '_blank', 'noopener,noreferrer');
    setPaymentInitiated(true);
    
    toast({
      title: 'PayPal Opened',
      description: 'Complete payment in the PayPal window.',
    });
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (!currentPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="glass-card p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              Upgrade to {currentPlan.name} membership
            </p>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-foreground">
                {currentPlan.name} Membership
              </span>
              <span className="text-3xl font-bold text-primary">
                ${currentPlan.price}
                <span className="text-sm text-muted-foreground font-normal">/month</span>
              </span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Billed monthly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Guaranteed payments after verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Fast submission verification after job completion</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-400/10 border border-blue-400/20">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-400 font-medium mb-1">Secure PayPal Payment</p>
                    <p className="text-sm text-foreground">
                      Click "Pay Now" to open PayPal where amount and recipient are pre-filled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">PayPal Email:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyEmail}
                      className="h-7 w-7 p-0"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <div className="bg-primary/5 px-3 py-2 rounded-lg">
                    <code className="text-sm md:text-base font-bold text-primary">
                      {paypalEmail}
                    </code>
                  </div>
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    you can copy this email, log in to your paypal app, paste and make payments
                  </p>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Amount to Send:</span>
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">${currentPlan.price}.00</span>
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Monthly subscription</p>
                </div>
              </div>

              <div className="glass-card p-4">
                <h3 className="font-medium text-foreground mb-3">Step-by-Step Instructions:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground pl-5 list-decimal">
                  <li><strong>Click "Pay Now with PayPal" button below</strong></li>
                  <li>PayPal will open in a new tab with amount and email pre-filled</li>
                  <li>Log in to your PayPal account if prompted</li>
                  <li>Review the payment details and confirm</li>
                  <li>Complete the payment in PayPal</li>
                  <li>Return to SkillBridge dashboard</li>
                  <li>Your membership will be activated after verification</li>
                </ol>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-400 font-medium mb-1">Note</p>
                      <p className="text-sm text-foreground">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {paymentInitiated ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">PayPal Opened</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                PayPal should now be open in a new tab. Please complete your payment there.
                Your membership will be activated once payment is verified.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Returning to dashboard in a few seconds...</span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">If PayPal didn't open automatically:</p>
                <Button
                  onClick={handleManualPayPal}
                  variant="outline"
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open PayPal Manually
                </Button>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <span className="text-muted-foreground mb-2">Preparing PayPal...</span>
              <span className="text-xs text-muted-foreground">Please wait</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={handlePayNow}
                className="w-full h-14 text-lg font-semibold group"
                variant="hero"
                disabled={isProcessing}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay Now with PayPal
                <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="text-center">
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="ghost"
                  size="sm"
                >
                  Cancel and return to pricing
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              <p>Secure payment powered by PayPal</p>
            </div>
            <p>Need help? Contact freelance.skillbridge.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;