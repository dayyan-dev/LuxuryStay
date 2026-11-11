const Hotel = require('../Models/Hotel');
const Room = require('../Models/Room');
const auditLog = require('../Services/auditLogService');

// ============================================================
// GET ALL HOTELS (with search, filter, and pagination)
// ============================================================
const getAllHotels = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, rating, search, page = 1, limit = 12 } = req.query;

    const filter = { status: 'active' };

    if (city && city.trim() !== '' && city !== 'All') {
      filter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    if (minPrice || maxPrice) {
      filter.startingPrice = {};
      if (minPrice) filter.startingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.startingPrice.$lte = Number(maxPrice);
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const [hotels, total] = await Promise.all([
      Hotel.find(filter).sort({ featured: -1, rating: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Hotel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: hotels,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotels', error: err.message });
  }
};

// ============================================================
// GET FEATURED HOTELS (for Homepage)
// ============================================================
const getFeaturedHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ status: 'active' })
      .sort({ featured: -1, rating: -1 })
      .limit(6);
    res.json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured hotels', error: err.message });
  }
};

// ============================================================
// GET CITIES
// ============================================================
const getCities = async (req, res) => {
  try {
    const cities = await Hotel.distinct('city', { status: 'active' });
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cities', error: err.message });
  }
};

// ============================================================
// GET HOTEL BY ID (with its rooms)
// ============================================================
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel property not found' });
    }

    // Only rooms that belong to THIS property (no cross-hotel fallback)
    const { checkIn, checkOut, guests } = req.query;
    let rooms = await Room.find({ hotelId: hotel._id });

    if (guests) {
      const need = Number(guests) || 0;
      if (need > 0) {
        rooms = rooms.filter((r) => Number(r.capacity || 0) >= need);
      }
    }

    const { annotateRoomsAvailability } = require('../Services/roomAvailabilityService');
    const annotated = await annotateRoomsAvailability(rooms, checkIn, checkOut);

    res.json({
      success: true,
      data: {
        hotel,
        rooms: annotated,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotel details', error: err.message });
  }
};

// ============================================================
// CREATE HOTEL (Admin/Manager only)
// ============================================================
const createHotel = async (req, res) => {
  try {
    const { name, city, address, description, startingPrice, images, facilities } = req.body;
    if (!name || !city || !address || !description) {
      return res.status(400).json({ success: false, message: 'Name, city, address, and description are required' });
    }

    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newHotel = await Hotel.create({
      ...req.body,
      slug,
    });

    await auditLog.log(req, {
      action: 'HOTEL_CREATED',
      targetModel: 'Hotel',
      targetId: newHotel._id,
      description: `Created hotel ${newHotel.name} in ${newHotel.city}`,
    });

    res.status(201).json({ success: true, message: 'Hotel created successfully', data: newHotel });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create hotel', error: err.message });
  }
};

// ============================================================
// UPDATE HOTEL (Admin/Manager only)
// ============================================================
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Hotel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    await auditLog.log(req, {
      action: 'HOTEL_UPDATED',
      targetModel: 'Hotel',
      targetId: updated._id,
      description: `Updated hotel ${updated.name}`,
    });

    res.json({ success: true, message: 'Hotel updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update hotel', error: err.message });
  }
};

module.exports = {
  getAllHotels,
  getFeaturedHotels,
  getCities,
  getHotelById,
  createHotel,
  updateHotel,
};

