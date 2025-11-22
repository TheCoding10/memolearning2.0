import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

interface Stats {
  lessonsCompleted: number;
  exercisesAttempted: number;
  correctAnswers: number;
  accuracy: number | string;
  pointsEarned: number;
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/auth/stats/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header username={user.username} email={user.email} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="mb-2 text-4xl font-bold text-gray-900">Welcome, {user.username}!</h2>
          <p className="text-lg text-gray-600">{user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-5">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats?.lessonsCompleted || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Questions Attempted</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats?.exercisesAttempted || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats?.correctAnswers || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : `${stats?.accuracy || 0}%`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats?.pointsEarned || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

         {/* Continue Learning */}
         <div className="rounded-lg bg-white p-8">
           <h3 className="mb-6 text-2xl font-bold text-gray-900">Continue Learning</h3>
           <Link to="/home">
             <Button className="bg-blue-600 hover:bg-blue-700">
               Browse Courses →
             </Button>
           </Link>
         </div>
      </main>
    </div>
  );
}
