import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';

interface Course {
  id: number;
  subject_id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  duration_hours: number;
  order_index: number;
}

interface Subject {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  courses: Course[];
}

export function SubjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubject() {
      try {
        const response = await fetch(`/api/subjects/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSubject(data);
      } catch (error) {
        console.error('Failed to fetch subject:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchSubject();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="container mx-auto">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="container mx-auto">
          <div className="text-center text-gray-500">Subject not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Header */}
       <header className="border-b border-gray-200 bg-white">
         <div className="container mx-auto px-4 py-6">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{subject.icon || '📚'}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
              {subject.description && (
                <p className="mt-1 text-gray-600">{subject.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Courses Grid */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Courses</h2>
        
        {subject.courses.length === 0 ? (
          <div className="text-center text-gray-500">No courses available yet</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subject.courses.map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:border-blue-300">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-40 w-full object-cover group-hover:opacity-90"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="mb-4 text-sm text-gray-600">{course.description}</p>
                    )}
                    {course.duration_hours > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4" />
                        {course.duration_hours.toFixed(1)} hours
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full hover:bg-blue-50"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Start Course →
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
