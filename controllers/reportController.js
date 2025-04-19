import Reservation from '../models/Reservation.js';
import mongoose from 'mongoose';

// @desc    Get monthly reservation statistics
// @route   GET /api/reports/monthly
// @access  Private
export const getMonthlyStats = async (req, res) => {
  try {
    // Obtenir l'année actuelle ou celle spécifiée dans la requête
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    // Agréger les réservations par mois
    const monthlyStats = await Reservation.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$reservationStatus", "approved"] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$reservationStatus", "pending"] }, 1, 0]
            }
          },
          declined: {
            $sum: {
              $cond: [{ $eq: ["$reservationStatus", "declined"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Formater les résultats pour inclure tous les mois
    const formattedStats = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyStats.find(stat => stat._id === i + 1);
      return {
        month: i + 1,
        monthName: new Date(year, i, 1).toLocaleString('fr-FR', { month: 'long' }),
        count: monthData ? monthData.count : 0,
        approved: monthData ? monthData.approved : 0,
        pending: monthData ? monthData.pending : 0,
        declined: monthData ? monthData.declined : 0
      };
    });

    res.status(200).json({
      success: true,
      year,
      data: formattedStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques mensuelles:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Get detailed reservations grouped by date
// @route   GET /api/reports/detailed
// @access  Private
export const getDetailedReservations = async (req, res) => {
  try {
    // Paramètres de filtrage optionnels
    const { startDate, endDate, status } = req.query;
    
    // Construire le filtre de recherche
    const filter = {};
    
    // Filtrer par date si spécifié
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Filtrer par statut si spécifié
    if (status && ['pending', 'approved', 'declined'].includes(status)) {
      filter.reservationStatus = status;
    }
    
    // Récupérer les réservations avec les détails de l'espace
    const reservations = await Reservation.find(filter)
      .populate('space', 'title location')
      .sort({ date: -1 });
    
    // Grouper les réservations par date
    const groupedReservations = reservations.reduce((groups, reservation) => {
      const date = reservation.date.toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(reservation);
      return groups;
    }, {});
    
    // Convertir en tableau pour faciliter le traitement côté client
    const result = Object.keys(groupedReservations).map(date => ({
      date,
      reservations: groupedReservations[date],
      count: groupedReservations[date].length
    }));
    
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations détaillées:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Get space usage statistics
// @route   GET /api/reports/spaces
// @access  Private
export const getSpaceUsageStats = async (req, res) => {
  try {
    const spaceStats = await Reservation.aggregate([
      {
        $lookup: {
          from: 'spaces',
          localField: 'space',
          foreignField: '_id',
          as: 'spaceDetails'
        }
      },
      {
        $unwind: '$spaceDetails'
      },
      {
        $group: {
          _id: '$space',
          spaceName: { $first: '$spaceDetails.title' },
          totalReservations: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$reservationStatus", "approved"] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$reservationStatus", "pending"] }, 1, 0]
            }
          },
          declined: {
            $sum: {
              $cond: [{ $eq: ["$reservationStatus", "declined"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalReservations: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: spaceStats.length,
      data: spaceStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques par espace:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};