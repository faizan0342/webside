import nodemailer from 'nodemailer';
import { config } from './config.js';

if (!config.smtpUser || !config.smtpPass) throw new Error('SMTP_USER and SMTP_PASS are required');
const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: config.smtpUser, pass: config.smtpPass } });
await transport.verify();
console.log('Gmail SMTP verified successfully');
