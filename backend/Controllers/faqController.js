const FAQ = require('../Models/FAQ');

// Get all FAQs — Admin (all including inactive)
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ category: 1, order: 1, createdAt: -1 });
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get active FAQs — Public (user website ke liye)
const getActiveFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ category: 1, order: 1 });
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create FAQ
const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }
    const faq = await FAQ.create({ question, answer, category, isActive, order });
    res.status(201).json({ message: 'FAQ created', faq });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update FAQ
const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.status(200).json({ message: 'FAQ updated', faq });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete FAQ
const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.status(200).json({ message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllFAQs, getActiveFAQs, createFAQ, updateFAQ, deleteFAQ };