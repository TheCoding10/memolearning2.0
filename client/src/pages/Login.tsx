import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-yellow-50 to-green-50 flex flex-col items-center justify-center px-4">
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
         <h2 className="mb-10 text-4xl font-bold text-gray-900">Sign In</h2>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-base text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button type="submit" className="h-14 w-full text-lg font-semibold" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-base text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}
