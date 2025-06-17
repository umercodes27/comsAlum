// controllers/video.js
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = twilio.jwt.AccessToken.VideoGrant;


const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET;

export const getVideoToken = async (req, res) => {
  try {
    console.log("🧪 req.user:", req.user);
    console.log("🧪 req.body:", req.body);

    const userId = req.user?.id;
    const { roomName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user ID from token' });
    }

    if (!roomName) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET,
      { identity: userId, ttl: 3600 }
    );

    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);

    return res.json({ token: token.toJwt() });
  } catch (error) {
    console.error('🚨 Error generating Twilio video token:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to generate token', details: error.message });
  }
};
