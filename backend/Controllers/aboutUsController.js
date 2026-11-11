const AboutUs = require('../Models/AboutUs');

// Get About Us — Public
const getAboutUs = async (req, res) => {
  try {
    let about = await AboutUs.findOne();
    if (!about) {
      about = await AboutUs.create({
        hotelName: 'The Luxury Stay',
        tagline:   'Where Comfort Meets Excellence',
        story:     'Our hotel has been providing exceptional hospitality since our founding. We are committed to making every guest feel at home while experiencing the finest amenities.',
        mission:   'To deliver exceptional hospitality experiences that exceed our guests\' expectations through personalized service and world-class amenities.',
        vision:    'To be the most preferred luxury hotel destination, known for our outstanding service, comfort, and commitment to guest satisfaction.',
      });
    }
    res.status(200).json(about);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update About Us info
const updateAboutUs = async (req, res) => {
  try {
    let about = await AboutUs.findOne();
    if (!about) about = new AboutUs();

    const fields = ['hotelName', 'tagline', 'story', 'mission', 'vision', 'isPublished'];
    fields.forEach(f => { if (req.body[f] !== undefined) about[f] = req.body[f]; });

    await about.save();
    res.status(200).json({ message: 'About Us updated', about });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAboutUs, updateAboutUs };