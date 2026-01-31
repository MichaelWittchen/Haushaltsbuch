import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Bitte Transaktionstyp angeben'],
  },
  amount: {
    type: Number,
    required: [true, 'Bitte Betrag angeben'],
    min: [0.01, 'Betrag muss mindestens 0.01 sein'],
  },
  category: {
    type: String,
    required: [true, 'Bitte Kategorie angeben'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
