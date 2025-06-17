// Utility to fetch audio sermons from Telegram channel using Bot API
const axios = require('axios');

/**
 * Fetch audio sermons from Telegram channel
 * @route GET /api/sermons/telegram
 * @access Public
 */
const getTelegramSermons = async (req, res) => {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL) {
      return res.status(500).json({
        success: false,
        message: 'Telegram bot token or channel not configured.'
      });
    }

    // Get recent messages from the channel
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
    const response = await axios.get(apiUrl, { timeout: 10000 });
    const updates = response.data.result || [];

    // Filter for audio messages in the channel
    const audioMessages = updates
      .map(u => u.message)
      .filter(m => m && m.chat && (m.chat.username === TELEGRAM_CHANNEL.replace('@', '') || m.chat.id === TELEGRAM_CHANNEL) && m.audio);

    // For each audio message, get the direct file URL
    const sermons = await Promise.all(audioMessages.map(async (msg) => {
      const fileId = msg.audio.file_id;
      // Get file path
      const fileResp = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
      const filePath = fileResp.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
      return {
        title: msg.audio.title || msg.audio.file_name || 'Untitled',
        date: new Date(msg.date * 1000),
        audioUrl: fileUrl,
        telegramLink: `https://t.me/${TELEGRAM_CHANNEL.replace('@', '')}/${msg.message_id}`,
        performer: msg.audio.performer || '',
        duration: msg.audio.duration,
        fileSize: msg.audio.file_size,
      };
    }));

    res.json({ success: true, sermons });
  } catch (error) {
    console.error('Error fetching Telegram sermons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Telegram sermons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = getTelegramSermons;
