import nodemailer from 'nodemailer';

// Ensure environment variables are loaded
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing EMAIL_USER or EMAIL_PASS in environment variables');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER, // Mailtrap username from .env
    pass: process.env.EMAIL_PASS  // Mailtrap password from .env
  }
});

export const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: '"SocioPedia" <no-reply@sociopedia.com>',
    to,
    subject: '🎉 Welcome to comsAlum!',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thanks for signing up for comsAlum. We're excited to have you!</p>
    `
  };

  await transport.sendMail(mailOptions);
};
