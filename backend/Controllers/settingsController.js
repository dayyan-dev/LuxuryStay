const Settings = require('../Models/Settings');

const getSettings = async (req, res) => {
  try {
    const docs = await Settings.find();
    const settings = {};
    docs.forEach((d) => { settings[d.key] = d.value; });
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const saveSettings = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ message: 'Key is required' });
    const doc = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Settings saved', settings: doc });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const saveBulkSettings = async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    await Promise.all(
      entries.map(([key, value]) =>
        Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
      )
    );
    res.status(200).json({ message: 'All settings saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getSettings, saveSettings, saveBulkSettings };
