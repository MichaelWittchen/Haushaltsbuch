import express, { Response } from 'express';
import Transaction from '../models/Transaction';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Alle Transaktionen des Benutzers abrufen
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste der Transaktionen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Nicht autorisiert
 */
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ user: req.user!._id })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler' });
  }
});

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Neue Transaktion erstellen
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount, category]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaktion erstellt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validierungsfehler
 *       401:
 *         description: Nicht autorisiert
 */
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, amount, category, description } = req.body;

    const transaction = await Transaction.create({
      user: req.user!._id,
      type,
      amount,
      category,
      description: description || '',
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    res.status(500).json({ message: 'Serverfehler' });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Transaktion aktualisieren
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaktion ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaktion aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Nicht autorisiert
 *       403:
 *         description: Keine Berechtigung für diese Transaktion
 *       404:
 *         description: Transaktion nicht gefunden
 */
router.put('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({ message: 'Transaktion nicht gefunden' });
      return;
    }

    if (transaction.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Nicht autorisiert' });
      return;
    }

    const { type, amount, category, description } = req.body;

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    res.status(500).json({ message: 'Serverfehler' });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Transaktion löschen
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaktion ID
 *     responses:
 *       200:
 *         description: Transaktion gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Nicht autorisiert
 *       403:
 *         description: Keine Berechtigung für diese Transaktion
 *       404:
 *         description: Transaktion nicht gefunden
 */
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({ message: 'Transaktion nicht gefunden' });
      return;
    }

    // Check if user owns the transaction
    if (transaction.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Nicht autorisiert' });
      return;
    }

    await transaction.deleteOne();

    res.json({ message: 'Transaktion gelöscht' });
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler' });
  }
});

export default router;
