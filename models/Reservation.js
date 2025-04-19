import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Veuillez ajouter un nom'],
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    email: {
      type: String,
      required: [true, 'Veuillez ajouter un email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez ajouter un email valide'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Veuillez ajouter un numéro de téléphone']
    },
    status: {
      type: String,
      required: [true, 'Veuillez spécifier votre statut']
    },
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      required: true
    },
    event: {
      type: String,
      required: [true, 'Veuillez ajouter un nom d\'événement'],
      maxlength: [100, 'Le nom d\'événement ne peut pas dépasser 100 caractères']
    },
    description: {
      type: String,
      required: [true, 'Veuillez ajouter une description'],
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    date: {
      type: Date,
      required: [true, 'Veuillez sélectionner une date']
    },
    timeSlots: {
      type: [String],
      required: [true, 'Veuillez sélectionner au moins un créneau horaire'],
      validate: {
        validator: function(v) {
          return v.length > 0 && v.length <= 2;
        },
        message: 'Vous devez sélectionner entre 1 et 2 créneaux horaires'
      }
    },
    reservationStatus: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Reservation', ReservationSchema);