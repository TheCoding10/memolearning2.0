import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Play, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ExerciseOption {
  id: number;
  exercise_id: number;
  text: string;
  is_correct: number;
  order_index: number;
}

interface Exercise {
  id: number;
  lesson_id: number;
  question: string;
  question_type: 'multiple_choice' | 'short_answer' | 'essay';
  points: number;
  order_index: number;
  options: ExerciseOption[];
}

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number;
  exercises: Exercise[];
}

export function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const response = await fetch(`/api/lessons/${id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setLesson(data);
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchLesson();
    }
  }, [id]);

  const handleAnswerChange = (exerciseId: number, value: number | string) => {
    setAnswers((prev) => ({
      ...prev,
      [exerciseId]: value
    }));
  };

  const handleSubmitAnswer = async (exercise: Exercise) => {
    const answer = answers[exercise.id];
    if (!answer) return;

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          exerciseId: exercise.id,
          answer: answer.toString()
        })
      });

      if (!response.ok) throw new Error('Failed to submit');
      const data = await response.json();
      setResults((prev) => ({
        ...prev,
        [exercise.id]: data.correct === 1
      }));
      setSubmitted((prev) => ({
        ...prev,
        [exercise.id]: true
      }));
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      const response = await fetch(`/api/progress/${userId}/lesson/${id}/complete`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('Lesson completed! Great job!');
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="container mx-auto">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="container mx-auto">
          <div className="text-center text-gray-500">Lesson not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          {lesson.description && (
            <p className="mt-2 text-gray-600">{lesson.description}</p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl">
          {/* Video Section */}
          {lesson.video_url && (
            <Card className="mb-8 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Video Lesson</h2>
              </div>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  <Play className="h-5 w-5" />
                  Watch on YouTube
                </a>
              </div>
            </Card>
          )}

          {/* Exercises Section */}
          {lesson.exercises.length > 0 && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Practice Exercises</h2>
              <div className="space-y-6">
                {lesson.exercises.map((exercise) => (
                  <Card key={exercise.id} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      {exercise.question}
                    </h3>

                    {exercise.question_type === 'multiple_choice' && (
                      <div className="space-y-3 mb-4">
                        {exercise.options.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`exercise_${exercise.id}`}
                              value={option.id}
                              checked={answers[exercise.id] === option.id}
                              onChange={() => handleAnswerChange(exercise.id, option.id)}
                              disabled={submitted[exercise.id]}
                              className="h-4 w-4"
                            />
                            <span className="text-gray-900">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {exercise.question_type === 'short_answer' && (
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={(answers[exercise.id] as string) || ''}
                          onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                          disabled={submitted[exercise.id]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {submitted[exercise.id] && (
                      <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                        results[exercise.id]
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {results[exercise.id] ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span>Correct! Well done!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5" />
                            <span>Not quite right. Try again!</span>
                          </>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={() => handleSubmitAnswer(exercise)}
                      disabled={!answers[exercise.id] || submitted[exercise.id]}
                      className={submitted[exercise.id] ? 'opacity-50' : ''}
                    >
                      {submitted[exercise.id] ? 'Answered' : 'Check Answer'}
                    </Button>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleCompleteLesson}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Complete Lesson
                </Button>
              </div>
            </div>
          )}

          {lesson.exercises.length === 0 && !lesson.video_url && (
            <Card className="p-6 text-center text-gray-500">
              <p>This lesson doesn't have content yet</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
