import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Zap, BarChart3, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';

interface Subject {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/subjects');
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      {isAuthenticated && user ? (
        <Header username={user.username} email={user.email} />
      ) : (
        <header className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src="/assets/memolearning-logo.png" alt="MemoLearning" className="h-8 w-8" />
                <h1 className="text-3xl font-bold text-gray-900">MemoLearning</h1>
              </Link>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </div>
            </div>
            <p className="mt-2 text-gray-600">Learn anything, anytime, at your own pace</p>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex gap-4">
              <Zap className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Learn at your pace</h3>
                <p className="text-sm text-gray-600">Progress through lessons at whatever speed works for you</p>
              </div>
            </div>
            <div className="flex gap-4">
              <BookOpen className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Expert-created content</h3>
                <p className="text-sm text-gray-600">Lessons developed by experienced educators</p>
              </div>
            </div>
            <div className="flex gap-4">
              <BarChart3 className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Track progress</h3>
                <p className="text-sm text-gray-600">Monitor your learning journey with detailed analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Choose a subject</h2>
        
        {loading ? (
          <div className="text-center text-gray-500">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="text-center text-gray-500">No subjects available yet</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.slug}`}
                className="group"
              >
                <Card className="h-full p-6 transition-all hover:shadow-lg hover:border-blue-300">
                  <div className="mb-4 text-4xl">{subject.icon || '📚'}</div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-sm text-gray-600">{subject.description}</p>
                  )}
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      className="w-full hover:bg-blue-50"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Explore →
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
