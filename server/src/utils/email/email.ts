import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (verificationToken: string) => {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["bianskiza@gmail.com"],
    subject: "Verification Email",
    html: `<p>Your verification token : ${verificationToken}</P>`,
  });
};

export const sendResetPasswordLink = async (resetPasswordToken: string) => {
  await resend.emails.send({
    from: "Acme <oboarding@resend.dev>",
    to: ["bianskiza@gmail.com"],
    subject: "Reset password link",
    html: `<p>Your reset passwrod link https://clientUrl/reset-password/${resetPasswordToken} </p>`,
  });
};

const sendWelcomeEmail = async () => {};
const sendResetPasswordSuccess = async () => {};
