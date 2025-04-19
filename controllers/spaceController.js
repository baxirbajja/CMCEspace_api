import Space from '../models/Space.js';

// @desc    Get all spaces
// @route   GET /api/spaces
// @access  Public
export const getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find();
    res.status(200).json({
      success: true,
      count: spaces.length,
      data: spaces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Get single space
// @route   GET /api/spaces/:id
// @access  Public
export const getSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Espace non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: space
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Create new space
// @route   POST /api/spaces
// @access  Private
export const createSpace = async (req, res) => {
  try {
    const space = await Space.create(req.body);
    res.status(201).json({
      success: true,
      data: space
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }
};

// @desc    Update space
// @route   PUT /api/spaces/:id
// @access  Private
export const updateSpace = async (req, res) => {
  try {
    let space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Espace non trouvé'
      });
    }

    space = await Space.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: space
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }
};

// @desc    Delete space
// @route   DELETE /api/spaces/:id
// @access  Private
export const deleteSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Espace non trouvé'
      });
    }

    await space.deleteOne();

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