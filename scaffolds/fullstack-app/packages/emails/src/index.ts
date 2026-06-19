import { Resend } from 'resend';
import { WelcomeEmail } from './templates/welcome';

// Initialize Resend client lazily/optionally
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export { WelcomeEmail };

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
  from?: string;
}

/**
 * Shared utility to send transactional emails using Resend.
 * Falls back to logging to console if RESEND_API_KEY is not configured.
 */
export async function sendEmail({
  to,
  subject,
  react,
  from = 'onboarding@resend.dev',
}: SendEmailOptions) {
  if (!resend) {
    console.log('--- [RESEND EMAIL MOCK/LOG] ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Resend API Key is missing. Email not sent via network.');
    console.log('--------------------------------');
    return { id: 'mock-email-id', success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Failed to send email via Resend:', error);
      throw error;
    }

    return { id: data?.id, success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
