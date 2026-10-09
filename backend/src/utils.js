import nodemailer from 'nodemailer';
import { config } from './config.js';

export const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const orderNumber = () => `OA-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
export async function sendOrderEmail(order) {
  if (!config.smtpUser || !config.smtpPass || !config.ownerEmail) { console.warn('SMTP not configured; order email skipped'); return; }
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: config.smtpUser, pass: config.smtpPass } });
  const rows = [['Order number',order.orderNumber],['Customer',order.customerName],['Email',order.email],['Phone',order.phone],['Address',`${order.address}, ${order.city}`],['Product',order.productName],['Quantity',order.quantity],['Price',order.unitPrice.toFixed(2)],['Total',order.totalAmount.toFixed(2)],['Order date',new Date(order.createdAt).toLocaleString()]];
  await transport.sendMail({ from: `Industrial Flow Orders <${config.smtpUser}>`, to: config.ownerEmail, subject: `New flow meter order ${order.orderNumber}`, html: `<h2>New order received</h2><table>${rows.map(([a,b])=>`<tr><th style="text-align:left;padding:6px">${a}</th><td style="padding:6px">${b}</td></tr>`).join('')}</table>` });
}
const safe=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
export async function sendContactEmails(contact) {
  if (!config.smtpUser || !config.smtpPass || !config.ownerEmail) { console.warn('SMTP not configured; contact emails skipped'); return; }
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: config.smtpUser, pass: config.smtpPass } });
  await transport.verify();
  await transport.sendMail({ from: `Industrial Flow Website <${config.smtpUser}>`, to: config.ownerEmail, replyTo: contact.email, subject: `New contact inquiry: ${contact.subject}`, html: `<div style="font-family:Arial,sans-serif;max-width:640px"><h2>New website inquiry</h2><p><b>Name:</b> ${safe(contact.name)}</p><p><b>Email:</b> ${safe(contact.email)}</p><p><b>Phone:</b> ${safe(contact.phone)||'Not provided'}</p><p><b>Subject:</b> ${safe(contact.subject)}</p><p><b>Message:</b></p><div style="padding:16px;background:#f5f3ed;white-space:pre-wrap">${safe(contact.message)}</div><p><b>Received:</b> ${new Date(contact.createdAt).toLocaleString()}</p></div>` });
  await transport.sendMail({ from: `Industrial Flow <${config.smtpUser}>`, to: contact.email, subject: 'We received your message — Industrial Flow', html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#292a25"><h1 style="font-family:Georgia,serif">Thank you, ${safe(contact.name)}.</h1><p>We received your message about <b>${safe(contact.subject)}</b>.</p><p>Our team will review your inquiry and reply as soon as possible.</p><div style="margin:24px 0;padding:16px;background:#f5f3ed;border-left:3px solid #596657">${safe(contact.message)}</div><p>Warmly,<br><b>Industrial Flow</b></p></div>` });
}
