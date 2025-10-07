import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { loginSchema, signupSchema, sanitizeInput } from '@/lib/validation';
import { rateLimiter, RATE_LIMITS, handleRateLimit } from '@/lib/rateLimiter';

const Auth = () => {
  const { user, signIn, signUp, loading, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const validation = signupSchema.safeParse({ 
          email: sanitizedEmail, 
          password,
          confirmPassword: password // Same password for now
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
          toast.success('Welcome back!');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-light via-white to-love-coral/10 p-4">
      {showForgotPassword ? (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full p-2">
                <img 
                  src="/logo.png" 
                  alt="Love Beyond Borders Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                variant="love"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
                className="text-love-heart"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full p-2">
              <img 
                src="/logo.png" 
                alt="Love Beyond Borders Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
            Love Beyond Borders
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Welcome back to your love story' : 'Start your love journey today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required={!isLogin}
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
                placeholder="your@email.com"
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {!isLogin && (
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <p className="font-medium">Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>At least 12 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>
              )}
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-love-heart hover:underline mt-1"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              variant="love"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-love-heart"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default Auth;