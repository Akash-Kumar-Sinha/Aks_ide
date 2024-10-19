import { Request, Response } from "express";
import nodemailer from "nodemailer";

import { prisma } from "../prismaDb/prismaDb";
import createToken from "../utils/createTokens";

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL || !EMAIL_PASSWORD) {
  throw new Error("Missing EMAIL or EMAIL_PASSWORD");
}

const sendToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.provider === "GOOGLE") {
        res
          .status(200)
          .json({ message: "Try Login through Google", Route: "AUTH" });
        return;
      }
      res
        .status(200)
        .json({ message: "User already exists", Route: "PASSWORD" });
      return;
    }

    const emailVerification = await prisma.emailVerification.findUnique({
      where: { email },
    });

    const token = String(await createToken(email));

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });

    if (!emailVerification) {
      await prisma.emailVerification.create({
        data: {
          email: email,
          verificationToken: token,
        },
      });
    } else {
      await prisma.emailVerification.update({
        where: { email: email },
        data: { verificationToken: token },
      });
    }

    const link = `${process.env.SERVER_URL}/auth/verify/${email}/${token}`;

    await transporter.sendMail({
      from: EMAIL,
      to: email,
      subject: "Email Verification",
      text: "Welcome",
      html: `<div style="font-family: Arial, sans-serif; text-align: center;">
        <a href="${link}" style="text-decoration: none; color: #007bff; font-size: 18px;">Click here to validate</a>
    </div>`,
    });

    res.status(200).json({ message: "Check your email", Route: "SENT" });
  } catch (error) {
    console.error("Error in sendToken:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default sendToken;
