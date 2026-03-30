import mongoose from 'mongoose';

export interface IReel extends Document {
  title: string;
  videoUrl: string;
  category: string;
}

const ReelSchema = new mongoose.Schema<IReel>(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    category: {
      type: String,
      enum: ['story', 'web-stories'],
      required: true,
    },
  },
  { timestamps: true }
);

const Reel = mongoose.models.Reel || mongoose.model('Reel', ReelSchema);
export default Reel;
