import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { loginSchema, signupSchema, sanitizeInput } from '@/lib/validation';
import { rateLimiter, RATE_LIMITS, handleRateLimit } from '@/lib/rateLimiter';
import { cn } from '@/lib/utils';

const Auth = () => {
  const { user, signIn, signUp, loading, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit (5 auth attempts per minute)
    const rateLimitKey = `auth:${isLogin ? 'login' : 'signup'}`;
    if (!rateLimiter.checkLimit(rateLimitKey, RATE_LIMITS.AUTH_ATTEMPT)) {
      const resetTime = rateLimiter.getResetTime(rateLimitKey);
      toast.error(handleRateLimit(resetTime).message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      const sanitizedFirstName = sanitizeInput(firstName);
      const sanitizedLastName = sanitizeInput(lastName);
      const sanitizedPhone = sanitizeInput(phoneNumber);

      // Validate inputs
      if (isLogin) {
        const validation = loginSchema.safeParse({ 
          email: sanitizedEmail, 
          password 
        });
        
        if (!validation.success) {
          const errors = validation.error.errors.map(e => e.message).join(', ');
          toast.error(errors);
          setIsSubmitting(false);
          return;
        }
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsSubmitting(false);
          return;
        }

        const validation = signupSchema.safeParse({ 
          email: sanitizedEmail, 
          password,
          confirmPassword 
        });
        
        if (!validation.success) {
          const errors = validation.error.errors.map(e => e.message).join(', ');
          toast.error(errors);
          setIsSubmitting(false);
          return;
        }

        // Validate name fields
        if (!sanitizedFirstName || !sanitizedLastName) {
          toast.error('First and last name are required');
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = isLogin 
        ? await signIn(sanitizedEmail, password)
        : await signUp(sanitizedEmail, password, { 
            firstName: sanitizedFirstName, 
            lastName: sanitizedLastName, 
            phoneNumber: sanitizedPhone 
          });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
          
          // Log failed login attempt
          if (isLogin) {
            try {
              const { supabase } = await import('@/integrations/supabase/client');
              await supabase.functions.invoke('log-failed-login', {
                body: {
                  email: sanitizedEmail,
                  ip_address: null,
                  user_agent: navigator.userAgent
                }
              });
            } catch (logError) {
              console.error('Failed to log failed login:', logError);
            }
          }
        } else if (error.message.includes('User already registered')) {
          toast.error('This email is already registered. Try signing in instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        // Clear rate limit on successful auth
        rateLimiter.clearKey(rateLimitKey);
        
        if (!isLogin) {
          toast.success('Account created! Please check your email to verify your account.');
        } else {
          // toast.success('Welcome back!');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const sanitizedEmail = sanitizeInput(resetEmail.toLowerCase().trim());
      const { error } = await resetPassword(sanitizedEmail);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading usage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel - Brand/Image */}
      <div className="hidden lg:flex w-1/2 bg-muted relative overflow-hidden items-center justify-center text-white">
        <div className="absolute inset-0 bg-love-gradient opacity-90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
        
        <div className="relative z-20 flex flex-col items-center text-center p-12 max-w-xl">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl mb-8 shadow-love animate-float">
            <Heart size={64} className="text-white fill-current" />
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Love Beyond Borders</h1>
          <p className="text-xl font-medium text-white/90 leading-relaxed">
            Close the distance with the app designed for hearts that beat in different time zones.
          </p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl z-10" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl z-10" />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          
          <div className="text-center lg:text-left">
             <div className="flex justify-center lg:justify-start mb-6 lg:hidden">
              <div className="love-gradient rounded-xl p-2.5 shadow-love">
                <Heart className="text-white fill-white" size={24} />
              </div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {showForgotPassword 
                ? 'Reset Password' 
                : (isLogin ? 'Welcome back' : 'Create an account')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {showForgotPassword
                ? 'Enter your email to receive valid reset instructions'
                : (isLogin 
                  ? 'Enter your details to access your account' 
                  : 'Start your journey to bridge the distance')}
            </p>
          </div>

          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11" 
                variant="love"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : 'Send Reset Link'}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      required={!isLogin}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required={!isLogin}
                      className="h-11"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300 delay-75">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-11"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11"
                />
              </div>

              {!isLogin && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300 delay-100">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required={!isLogin}
                      className="h-11"
                    />
                    <div className="text-xs text-muted-foreground mt-2 space-y-1 bg-muted/50 p-2 rounded-md">
                      <p className="font-medium">Password requirements:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                        <li>12+ characters</li>
                        <li>Uppercase & lowercase & number</li>
                        <li>Special character (e.g. !@#$)</li>
                      </ul>
                    </div>
                 </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-base group" 
                variant="love"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                   <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                   </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {!showForgotPassword && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
          )}

          {!showForgotPassword && (
             <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;