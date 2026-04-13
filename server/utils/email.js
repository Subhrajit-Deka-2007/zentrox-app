const nodemailer = require("nodemailer");

// create transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    // Brevo for production
    return nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: process.env.BREVO_PORT,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });
  } else {
    // Mailtrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
};

//  base email sender
const sendEmail = async (options) => {
  const transporter = createTransporter();

  //  different from email based on environment
  const fromEmail =
    process.env.NODE_ENV === "production"
      ? process.env.EMAIL_FROM_PROD
      : process.env.EMAIL_FROM;

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

//  base HTML template
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
    <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color:#007bff;padding:30px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:28px;">Zentrox 🚀</h1>
        </div>

        <!-- Content -->
        <div style="padding:40px;">
            ${content}
        </div>

        <!-- Footer -->
        <div style="background-color:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#999;font-size:12px;margin:0;">© 2024 Zentrox. All rights reserved.</p>
            <p style="color:#999;font-size:12px;margin:5px 0 0 0;">If you didn't request this email, please ignore it.</p>
        </div>
    </div>
</body>
</html>
`;

//  welcome email
exports.sendWelcomeEmail = async (user) => {
  const content = `
        <h2 style="color:#333;">Welcome aboard, ${user.name}! 🎉</h2>
        <p style="color:#666;font-size:16px;line-height:1.6;">
            We're excited to have you join Zentrox!
            Your account has been created successfully.
        </p>
        <p style="color:#666;font-size:16px;line-height:1.6;">
            Here's what you can do now:
        </p>
        <ul style="color:#666;font-size:16px;line-height:2;">
            <li>Complete your profile</li>
            <li>Create your first post</li>
            <li>Connect with others</li>
        </ul>
        <div style="text-align:center;margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}"
               style="background-color:#007bff;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;">
                Get Started →
            </a>
        </div>
    `;

  await sendEmail({
    to: user.email,
    subject: `Welcome to Zentrox, ${user.name}! 🎉`,
    html: emailTemplate(content),
    text: `Welcome to Zentrox, ${user.name}! Your account has been created successfully.`,
  });
};

//  password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html`;
  //                ↑ just the page URL — no token in URL

  const content = `
        <h2 style="color:#333;">Reset Your Password 🔐</h2>
        <p style="color:#666;font-size:16px;line-height:1.6;">
            Hi ${user.name},
        </p>
        <p style="color:#666;font-size:16px;line-height:1.6;">
            You requested to reset your password.
            Click the button below to go to the reset page.
        </p>
        <div style="background-color:#fff3cd;border:1px solid #ffc107;border-radius:5px;padding:15px;margin:20px 0;">
            ⚠️ This token expires in <strong>10 minutes!</strong>
        </div>
        <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}"
               style="background-color:#dc3545;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;">
                Reset Password →
            </a>
        </div>

        <!-- ✅ token shown separately -->
        <div style="background-color:#f8f9fa;border:2px dashed #dee2e6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="color:#666;font-size:13px;margin-bottom:8px;">Your Reset Token:</p>
            <p style="font-family:monospace;font-size:16px;font-weight:bold;color:#333;letter-spacing:2px;word-break:break-all;">
                ${resetToken}
            </p>
            <p style="color:#999;font-size:12px;margin-top:8px;">Copy this token and paste it on the reset page</p>
        </div>

        <p style="color:#999;font-size:14px;">
            If you did not request this, ignore this email.
            Your password will not change.
        </p>
    `;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request 🔐",
    html: emailTemplate(content),
    text: `Go to ${resetUrl} and use this token: ${resetToken}. Expires in 10 minutes!`,
  });
};