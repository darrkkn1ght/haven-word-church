const SpiritualGrowth = require('../models/SpiritualGrowth');

// Create or update spiritual growth data for a user
exports.upsertSpiritualGrowth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bibleReadingDays, devotionalsCompleted } = req.body;

    let growth = await SpiritualGrowth.findOne({ user: userId });
    if (!growth) {
      growth = new SpiritualGrowth({
        user: userId,
        bibleReadingDays: bibleReadingDays || 0,
        devotionalsCompleted: devotionalsCompleted || 0,
      });
    } else {
      if (bibleReadingDays !== undefined) growth.bibleReadingDays = bibleReadingDays;
      if (devotionalsCompleted !== undefined) growth.devotionalsCompleted = devotionalsCompleted;
      growth.lastUpdated = Date.now();
    }
    await growth.save();
    res.json(growth);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update spiritual growth data.' });
  }
};
