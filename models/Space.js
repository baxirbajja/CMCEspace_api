import mongoose from 'mongoose';

const SpaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Veuillez ajouter un titre'],
      trim: true,
      maxlength: [50, 'Le titre ne peut pas dépasser 50 caractères']
    },
    description: {
      type: String,
      required: [true, 'Veuillez ajouter une description'],
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    capacity: {
      type: Number,
      required: [true, 'Veuillez spécifier la capacité']
    },
    image: {
      type: String,
      default: '/images/espace1.png'
    },
    status: {
      type: String,
      enum: ['active', 'maintenance'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Space', SpaceSchema);