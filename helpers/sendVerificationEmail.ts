
import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (
  email: string,
  username: string,
  secrete: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });



    const mailOptions = {
      from: `"Study Point" <${process.env.SMTP_USER || "noreply@studypoint.com"}>`,
      to: email,
      subject: "Verify your Study Point account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; padding: 20px;">
          <h2 style="color: #4f46e5; text-align: center;">Welcome to Study Point!</h2>
          <p>Hi <b>${username}</b>,</p>
          <p>Thank you for registering. Please verify your email address to access all features.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "https://study-point-dynamic.vercel.app"}/verifyEmail?secret=${secrete}&email=${email}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you did not create an account, no further action is required.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Study Point. All rights reserved.</p>
        </div>
      `,
    };

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP Credentials missing. Email was not actually sent.");
      return { success: true, message: "Simulated email sent successfully" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Verification email sent successfully" };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
};
