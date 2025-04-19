import Reservation from '../models/Reservation.js';
import Space from '../models/Space.js';
import emailjs from '@emailjs/browser';



// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('space');
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
export const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('space');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Public
export const createReservation = async (req, res) => {
  try {
    // Vérifier si l'espace existe
    const space = await Space.findById(req.body.space);
    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Espace non trouvé'
      });
    }

    // Vérifier si l'espace est disponible (pas en maintenance)
    if (space.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cet espace est actuellement en maintenance'
      });
    }

    // Vérifier si les créneaux sont déjà réservés
    const existingReservations = await Reservation.find({
      space: req.body.space,
      date: new Date(req.body.date),
      timeSlots: { $in: req.body.timeSlots },
      reservationStatus: { $in: ['pending', 'approved'] }
    });

    if (existingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Un ou plusieurs créneaux horaires sont déjà réservés pour cet espace'
      });
    }

    // Vérifier que les créneaux sont valides (1 ou 2 créneaux)
    if (!Array.isArray(req.body.timeSlots) || req.body.timeSlots.length === 0 || req.body.timeSlots.length > 2) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez sélectionner entre 1 et 2 créneaux horaires'
      });
    }
    // Vérifier et formater la date
    if (!req.body.date) {
      return res.status(400).json({
        success: false,
        error: 'La date est requise'
      });
    }

    const reservation = await Reservation.create({
      ...req.body,
      date: new Date(req.body.date)
    });

    // Get space details for the response
    const spaceDetails = await Space.findById(req.body.space);

  

  
      
     

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    } 
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Format d\'identifiant invalide'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Une réservation existe déjà pour ce créneau'
      });
    }
    
    // Log l'erreur pour le débogage
    console.error('Erreur serveur:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la réservation. Veuillez réessayer.'
    });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez fournir un statut valide (pending, approved, declined)'
      });
    }

    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée'
      });
    }

    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { reservationStatus: status },
      { new: true, runValidators: true }
    ).populate('space');

    // Notification de statut - emails désactivés

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private
export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée'
      });
    }

    await reservation.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Get reservations history by year and month
// @route   GET /api/reservations/history/:year/:month
// @access  Private
export const getReservationHistory = async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Créer les dates de début et de fin du mois
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const reservations = await Reservation.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('space').sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique'
    });
  }
};