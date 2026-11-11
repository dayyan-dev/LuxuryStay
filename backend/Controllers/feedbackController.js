// ===== feedbackController.js (Controller) =====

const Feedback = require('../Models/Feedback');
const Booking = require('../Models/Booking');

// POST /api/feedbacks
const submitFeedback = async (req, res) => {
  try {
    const { name, email, phone, rating, review, userId, bookingId } = req.body;

    // Validation
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "Rating 1 to 5 ke beech hona chahiye" });
    }
    if (!review?.trim()) {
      return res.status(400).json({ error: "Review required hai" });
    }

    const feedbackData = {
      name: name || "Guest",
      email: email || "",
      phone: phone || "",
      rating: Number(rating),
      review: review.trim(),
    };

    // userId sirf tab add karo jab valid MongoDB ObjectId ho
    if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) {
      feedbackData.userId = userId;
    }

    // Agar kisi specific booking se feedback aaya hai, to us booking ko mark karo
    // taake dobara feedback button na dikhe
    if (bookingId && /^[a-fA-F0-9]{24}$/.test(bookingId)) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        if (booking.feedbackGiven) {
          return res.status(400).json({ error: "Is booking ka feedback pehle hi diya ja chuka hai" });
        }
        feedbackData.bookingId = bookingId;
        await Booking.findByIdAndUpdate(bookingId, { feedbackGiven: true });
      }
    }

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });

  } catch (err) {
    console.error("Submit feedback error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/feedbacks
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email')
      .populate('repliedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Get feedbacks error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/feedbacks/:id
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    res.status(200).json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error("Delete feedback error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/feedbacks/:id/reply
const replyToFeedback = async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply?.trim()) {
      return res.status(400).json({ message: 'Reply text required hai' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        adminReply: adminReply.trim(),
        repliedAt: new Date(),
        repliedBy: req.user.id
      },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('repliedBy', 'name');

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    res.status(200).json({ message: 'Reply saved', feedback });
  } catch (err) {
    console.error("Reply feedback error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// GET /api/feedbacks/public — no auth required
const getPublicFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      review: { $exists: true, $ne: '', $not: /^\[Guest Inquiry\]/i },
    })
      .select('name rating review adminReply repliedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { submitFeedback, getAllFeedbacks, deleteFeedback, replyToFeedback, getPublicFeedbacks };
