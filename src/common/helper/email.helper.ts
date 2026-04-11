import { statusCode } from "@messages";
import { ApiError } from "./api-error.helper";
import * as nodemailer from "nodemailer";


 export async function sendEmail(to: string, phone: string, password: string, fullname:string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ,
      port: parseInt(process.env.SMTP_PORT ),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

    });

//  const message = `🎉 Welcome to *Goldline Residency*, ${fullname}!

// Your account has been successfully created in our mobile app. 
// Here are your login details:
// 📱 *Username:* ${phone}
// 🔑 *Password:* ${password}

// Start exploring the app today and experience convenience at your fingertips! 🏡✨`


    const mailOptions = {
      from: `"Registration Service" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your Registration Details',
      html: `
        <h2>Welcome to Goldline Residency, ${fullname}!</h2>
    <p>Your account has been successfully created in our mobile app.</p>
    <h3>Here are your login details:</h3>
    <ul>
      <li><strong>Username:</strong> ${phone}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>Start exploring the app today and experience convenience at your fingertips! 🏡✨</p>
    <p>Best regards,<br/>Goldline Residency Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new ApiError(
        statusCode.InternalServerError,
        `Failed to send email: ${error.message}`
      );
    }
  }


   export async function sendOtpEmail(to: string, otp: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ,
      port: parseInt(process.env.SMTP_PORT),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Registration Service" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your Registration Details',
      html: `
         <h2>Password Reset Request</h2>
    <p>Your OTP for password reset is: <strong>${otp}</strong></p>
    <p>This OTP is valid for 10 minutes. Please use it to reset your password.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Thank you!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new ApiError(
        statusCode.InternalServerError,
        `Failed to send email: ${error.message}`
      );
    }
  }