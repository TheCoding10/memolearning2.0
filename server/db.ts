import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

export interface DatabaseSchema {
  users: {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
  };
  subjects: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    order_index: number;
  };
  courses: {
    id: number;
    subject_id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    duration_hours: number;
    order_index: number;
  };
  lessons: {
    id: number;
    course_id: number;
    title: string;
    slug: string;
    description: string | null;
    video_url: string | null;
    duration_seconds: number;
    order_index: number;
  };
  exercises: {
    id: number;
    lesson_id: number;
    question: string;
    question_type: 'multiple_choice' | 'short_answer' | 'essay';
    points: number;
    order_index: number;
  };
  exercise_options: {
    id: number;
    exercise_id: number;
    text: string;
    is_correct: number;
    order_index: number;
  };
  user_progress: {
    id: number;
    user_id: number;
    lesson_id: number;
    completed: number;
    completion_date: string | null;
    watch_duration_seconds: number;
  };
  user_answers: {
    id: number;
    user_id: number;
    exercise_id: number;
    answer: string | null;
    correct: number;
    attempted_at: string;
  };
}

const sqliteDb = new Database(process.env.DATA_DIRECTORY + '/database.sqlite');

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({ database: sqliteDb }),
  log: ['query', 'error']
});

export async function initializeDb() {
  console.log('Database connected');
}
