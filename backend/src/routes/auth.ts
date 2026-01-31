import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || '', {
    expiresIn: '30d',
  });
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Neuen Benutzer registrieren
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Max Mustermann
 *               email:
 *                 type: string
 *                 format: email
 *                 example: max@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: geheim123
 *     responses:
 *       201:
 *         description: Benutzer erfolgreich registriert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Benutzer existiert bereits oder ungültige Daten
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'Benutzer existiert bereits' });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Ungültige Benutzerdaten' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server Fehler',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Benutzer anmelden
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: max@example.com
 *               password:
 *                 type: string
 *                 example: geheim123
 *     responses:
 *       200:
 *         description: Erfolgreich angemeldet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Ungültige Anmeldedaten
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Ungültige E-Mail oder Passwort' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server Fehler',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

export default router;
