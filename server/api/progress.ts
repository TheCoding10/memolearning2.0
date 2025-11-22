import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Get user progress for a course
router.get('/progress/:userId/course/:courseId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const courseId = parseInt(req.params.courseId);

    const lessons = await db
      .selectFrom('lessons')
      .where('course_id', '=', courseId)
      .selectAll()
      .execute();

    const progress = await Promise.all(
      lessons.map(async (lesson) => {
        const userProgress = await db
          .selectFrom('user_progress')
          .where('user_id', '=', userId)
          .where('lesson_id', '=', lesson.id)
          .selectAll()
          .executeTakeFirst();

        return {
          lessonId: lesson.id,
          completed: userProgress?.completed || 0,
          completionDate: userProgress?.completion_date || null
        };
      })
    );

    res.json({ progress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Mark lesson as completed
router.post('/progress/:userId/lesson/:lessonId/complete', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const lessonId = parseInt(req.params.lessonId);

    await db
      .insertInto('user_progress')
      .values({
        user_id: userId,
        lesson_id: lessonId,
        completed: 1,
        completion_date: new Date().toISOString(),
        watch_duration_seconds: 0
      })
      .onConflict((oc) => oc.doUpdateSet({ completed: 1, completion_date: new Date().toISOString() }))
      .execute();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Submit exercise answer
router.post('/answers', async (req, res) => {
  try {
    const { userId, exerciseId, answer } = req.body;

    const userIdNum = parseInt(userId);
    const exerciseIdNum = parseInt(exerciseId);

    // Get the exercise and check if answer is correct
    const exercise = await db
      .selectFrom('exercises')
      .where('id', '=', exerciseIdNum)
      .selectAll()
      .executeTakeFirst();

    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }

    let isCorrect = 0;

    if (exercise.question_type === 'multiple_choice') {
      const option = await db
        .selectFrom('exercise_options')
        .where('id', '=', parseInt(answer))
        .selectAll()
        .executeTakeFirst();

      if (option?.is_correct) {
        isCorrect = 1;
      }
    }

    await db
      .insertInto('user_answers')
      .values({
        user_id: userIdNum,
        exercise_id: exerciseIdNum,
        answer: answer,
        correct: isCorrect,
        attempted_at: new Date().toISOString()
      })
      .execute();

    res.json({ correct: isCorrect });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
