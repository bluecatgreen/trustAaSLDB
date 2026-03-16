import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, token: string, url?: string) {
	const origin = env.ORIGIN;
	// Point directly to verify-email page - token will be verified server-side
	const verificationUrl = `${origin}/verify-email?token=${token}`;

	if (!resend) {
		console.log(`[DEV] Verification email would be sent to: ${email}`);
		console.log(`[DEV] Verification URL: ${verificationUrl}`);
		return;
	}

	await resend.emails.send({
		from: env.EMAIL_FROM || 'noreply@yourdomain.com',
		to: email,
		subject: 'Verify your email',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
				<h1 style="color: #2563eb;">Verify your email</h1>
				<p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
				</div>
				<p>Or copy and paste this link in your browser:</p>
				<p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
				<p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
				<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
				<p style="color: #9ca3af; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
			</body>
			</html>
		`
	});
}