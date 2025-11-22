import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthRequest {
  username?: string;
  email: string;
  password: string;
}

interface TokenPayload {
  id: number;
  email: string;
  username: string;
}

// Sign up
router.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body as AuthRequest;

    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, username, and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await db
      .selectFrom('users')
      .where((eb) => eb.or([
        eb('email', '=', email),
        eb('username', '=', username)
      ]))
      .selectAll()
      .executeTakeFirst();

    if (existingUser) {
      res.status(409).json({ error: 'Email or username already in use' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db
      .insertInto('users')
      .values({
        username,
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .executeTakeFirstOrThrow();

    const newUser = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', Number(result.insertId))
      .executeTakeFirst();

    if (!newUser) {
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username } as TokenPayload,
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as AuthRequest;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username } as TokenPayload,
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Verify token
router.post('/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    const user = await db
      .selectFrom('users')
      .where('id', '=', decoded.id)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update profile
router.put('/auth/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const { username, email } = req.body;

    if (!username || !email) {
      res.status(400).json({ error: 'Username and email are required' });
      return;
    }

    // Check if email is already taken by another user
    const existingUser = await db
      .selectFrom('users')
      .where((eb) => eb.and([
        eb('email', '=', email),
        eb('id', '!=', decoded.id)
      ]))
      .selectAll()
      .executeTakeFirst();

    if (existingUser) {
      res.status(409).json({ error: 'Email is already in use' });
      return;
    }

    // Check if username is already taken by another user
    const existingUsername = await db
      .selectFrom('users')
      .where((eb) => eb.and([
        eb('username', '=', username),
        eb('id', '!=', decoded.id)
      ]))
      .selectAll()
      .executeTakeFirst();

    if (existingUsername) {
      res.status(409).json({ error: 'Username is already in use' });
      return;
    }

    // Update user
    await db
      .updateTable('users')
      .set({
        username,
        email,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', decoded.id)
      .execute();

    const updatedUser = await db
      .selectFrom('users')
      .where('id', '=', decoded.id)
      .selectAll()
      .executeTakeFirst();

    if (!updatedUser) {
      res.status(500).json({ error: 'Failed to update user' });
      return;
    }

    res.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const user = await db
      .selectFrom('users')
      .where('id', '=', decoded.id)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .updateTable('users')
      .set({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', decoded.id)
      .execute();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user stats
router.get('/auth/stats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Total lessons completed
    const completedLessons = await db
      .selectFrom('user_progress')
      .where('user_id', '=', userId)
      .where('completed', '=', 1)
      .selectAll()
      .execute();

    // Total exercises attempted
    const exercisesAttempted = await db
      .selectFrom('user_answers')
      .where('user_id', '=', userId)
      .selectAll()
      .execute();

    // Correct answers
    const correctAnswers = exercisesAttempted.filter((a) => a.correct === 1).length;

    // Total points earned
    const pointsEarned = await db
      .selectFrom('user_answers')
      .innerJoin('exercises', 'exercises.id', 'user_answers.exercise_id')
      .where('user_answers.user_id', '=', userId)
      .where('user_answers.correct', '=', 1)
      .select('exercises.points')
      .execute();

    const totalPoints = pointsEarned.reduce((sum, item) => sum + (item.points || 0), 0);

    res.json({
      lessonsCompleted: completedLessons.length,
      exercisesAttempted: exercisesAttempted.length,
      correctAnswers,
      accuracy: exercisesAttempted.length > 0 ? ((correctAnswers / exercisesAttempted.length) * 100).toFixed(1) : 0,
      pointsEarned: totalPoints
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
