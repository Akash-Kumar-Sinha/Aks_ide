import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../../prismaDb/prismaDb";

const JWTSECRET = process.env.JWT_SECRET;

if (!JWTSECRET) {
  throw new Error("Missing JWT_SECRET");
}

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (
        existingUser.provider === "GOOGLE" ||
        existingUser.hashedPassword === null
      ) {
        res
          .status(400)
          .send({ message: "Try Login through Google", success: false });
        return;
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.hashedPassword
      );

      if (passwordMatch) {
        const token = jwt.sign(
          {
            accessToken: existingUser.accessToken,
            providerId: existingUser.providerId,
          },
          JWTSECRET,
          { expiresIn: "1d" }
        );

        res
          .status(200)
          .send({
            message: "User authenticated",
            success: true,
            accessToken: token,
          });
        return;
      }

      res.status(400).send({ message: "Invalid password", success: false });
      return;
    }

    const emailVerification = await prisma.emailVerification.findFirst({
      where: { email, verified: true },
    });

    if (!emailVerification) {
      res.status(400).send({ message: "User not verified", success: false });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const providerId = await bcrypt.hash(email, 6);

    const newAccessToken = jwt.sign({ email, providerId }, JWTSECRET, {
      expiresIn: "180d",
    });

    const createUser = await prisma.user.create({
      data: {
        email,
        emailVerified: true,
        hashedPassword: hashedPassword,
        provider: "EMAIL",
        providerId: `EMAIL-${providerId}`,
        accessToken: newAccessToken,
        profile: {
          create: {
            email,
          },
        },
      },
    });

    if (!createUser) {
      res
        .status(400)
        .send({ message: "Unable to create user", success: false });
      return;
    }

    const token = jwt.sign(
      {
        accessToken: createUser.accessToken,
        providerId: createUser.providerId,
      },
      JWTSECRET,
      { expiresIn: "1d" }
    );

    res
      .status(200)
      .send({ message: "User created successfully", success: true, accessToken: token });
  } catch (error) {
    console.error("Error in creating user:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

export default createUser;
