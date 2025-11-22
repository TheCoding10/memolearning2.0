import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/useAuth';

export function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-yellow-50 to-green-50 flex flex-col items-center justify-center px-4 py-8">
       <div className="w-full max-w-lg text-center mb-16">
         <div className="mb-10 flex justify-center">
           <img 
             src="/assets/mascot-logo.png" 
             alt="Memo Learning" 
             className="h-56 w-56 object-contain"
           />
         </div>
         
         <h1 className="text-7xl font-bold text-gray-900 mb-3">Memo Learning</h1>
         <p className="text-3xl text-gray-700">Learn Smarter. Achieve More.</p>
       </div>

       <Card className="w-full max-w-md p-12">
         <h2 className="mb-10 text-4xl font-bold text-gray-900">Create Account</h2>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-base text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="username" className="text-lg font-medium">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="mt-3 h-14 text-base"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-lg font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-3 h-14 text-base"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-lg font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-3 h-14 text-base"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-lg font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="mt-3 h-14 text-base"
            />
          </div>

          <Button type="submit" className="h-14 w-full text-lg font-semibold mt-8" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-base text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
