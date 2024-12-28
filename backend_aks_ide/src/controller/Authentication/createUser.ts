import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../prismaDb/prismaDb";
import { generateAccessToken, generateRefreshToken } from "../../utils/createTokens";

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, avatar } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.provider === "GOOGLE") {
        res
          .status(400)
          .json({ success: false, message: "Try login through Google" });
        return;
      }

      if (!user.hashedPassword) {
        res
          .status(400)
          .json({ success: false, message: "Try login through Google" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.hashedPassword
      );
      if (!isPasswordValid) {
        res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
        return;
      }

      const accessToken = generateAccessToken({ email, userId: user.id });
      const refreshToken = generateRefreshToken({
        id: crypto
          .createHash("sha256")
          .update(`${email}-${Date.now()}-${process.env.REFRESH_TOKEN_SECRET}`)
          .digest("hex"),
        newIds: user.id,
        times: {
          time1: user.createdAt.toISOString(),
          time2: user.updatedAt.toISOString(),
        },
        randomUUID: crypto.randomUUID(),
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });


      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        refreshToken,
        accessToken,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const providerId = `EMAIL-${email}`;

    const newUser = await prisma.user.create({
      data: {
        email,
        emailVerified: true,
        hashedPassword: hashedPassword,
        provider: "EMAIL",
        providerId,
        profile: {
          create: {
            email,
            name: name || "",
            avatar: avatar || "",
            provider: "EMAIL",
          },
        },
      },
    });

    const accessToken = generateAccessToken({ email, userId: newUser.id });
    const refreshToken = generateRefreshToken({
      id: crypto
        .createHash("sha256")
        .update(`${email}-${Date.now()}-${process.env.REFRESH_TOKEN_SECRET}`)
        .digest("hex"),
      newIds: newUser.id,
      times: {
        time1: newUser.createdAt.toISOString(),
        time2: newUser.updatedAt.toISOString(),
      },
      randomUUID: crypto.randomUUID(),
    });

    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      refreshToken,
      accessToken
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default createUser;
