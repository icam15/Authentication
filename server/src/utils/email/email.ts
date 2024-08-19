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
const sendWelcomeEmail = async () => {};
const sendPasswordResetEmail = async () => {};
const sendResetPasswordSuccess = async () => {};
