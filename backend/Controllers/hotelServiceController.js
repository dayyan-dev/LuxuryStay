const HotelService = require('../Models/HotelService');
const path = require('path');
const fs   = require('fs');

// Get all — Admin
const getAllServices = async (req, res) => {
  try {
    const services = await HotelService.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get active — Public (user website)
const getActiveServices = async (req, res) => {
  try {
    const services = await HotelService.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create
const createService = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/Uploads/${req.file.filename}`;
    const service = await HotelService.create(data);
    res.status(201).json({ message: 'Service created', service });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update
const updateService = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      // Purani image delete karo
      const old = await HotelService.findById(req.params.id);
      if (old?.image && old.image.startsWith('/Uploads/')) {
        const oldPath = path.join(__dirname, '..', old.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image = `/Uploads/${req.file.filename}`;
    }
    const service = await HotelService.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ message: 'Service updated', service });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete
const deleteService = async (req, res) => {
  try {
    const service = await HotelService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.image && service.image.startsWith('/Uploads/')) {
      const imgPath = path.join(__dirname, '..', service.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllServices, getActiveServices, createService, updateService, deleteService };