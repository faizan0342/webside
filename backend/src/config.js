import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oak-aura',
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  ownerEmail: process.env.OWNER_EMAIL || process.env.SMTP_USER,
};
