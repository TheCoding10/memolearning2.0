import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await db
      .selectFrom('subjects')
      .orderBy('order_index')
      .selectAll()
      .execute();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.get('/subjects/:slug', async (req, res) => {
  try {
    const subject = await db
      .selectFrom('subjects')
      .where('slug', '=', req.params.slug)
      .selectAll()
      .executeTakeFirst();
    
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    const courses = await db
      .selectFrom('courses')
      .where('subject_id', '=', subject.id)
      .orderBy('order_index')
      .selectAll()
      .execute();

    res.json({ ...subject, courses });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

router.get('/courses/:slug', async (req, res) => {
  try {
    const course = await db
      .selectFrom('courses')
      .where('slug', '=', req.params.slug)
      .selectAll()
      .executeTakeFirst();
    
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const lessons = await db
      .selectFrom('lessons')
      .where('course_id', '=', course.id)
      .orderBy('order_index')
      .selectAll()
      .execute();

    res.json({ ...course, lessons });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

router.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await db
      .selectFrom('lessons')
      .where('id', '=', parseInt(req.params.id))
      .selectAll()
      .executeTakeFirst();
    
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const exercises = await db
      .selectFrom('exercises')
      .where('lesson_id', '=', lesson.id)
      .orderBy('order_index')
      .selectAll()
      .execute();

    const exercisesWithOptions = await Promise.all(
      exercises.map(async (exercise) => {
        const options = await db
          .selectFrom('exercise_options')
          .where('exercise_id', '=', exercise.id)
          .orderBy('order_index')
          .selectAll()
          .execute();
        return { ...exercise, options };
      })
    );

    res.json({ ...lesson, exercises: exercisesWithOptions });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
