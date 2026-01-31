import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Transaction from '../models/Transaction';

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Benutzerprofil abrufen
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profildaten
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Benutzer nicht gefunden
 */
router.get('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
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
 * /users/profile:
 *   put:
 *     summary: Benutzerprofil aktualisieren
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Profil aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Benutzer nicht gefunden
 */
router.put('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
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
 * /users/profile:
 *   delete:
 *     summary: Eigenen Account löschen
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Benutzer nicht gefunden
 */
router.delete('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
      return;
    }

    // Alle Transaktionen des Benutzers löschen
    await Transaction.deleteMany({ user: req.user?._id });

    // Benutzer löschen
    await user.deleteOne();

    res.json({ message: 'Account und alle zugehörigen Daten wurden gelöscht' });
  } catch (error) {
    res.status(500).json({
      message: 'Server Fehler',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

export default router;
