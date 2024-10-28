import { Request, Response } from "express";

import { prisma } from "../../prismaDb/prismaDb";

const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.emailVerification.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    if (user?.verified) {
      res
        .status(200)
        .send({ message: "Email already verified", Route: "PASSWORD" });
      return;
    }

    res.status(200).send({ message: "Email not verified", Route: "SENT" });
    return;
  } catch (error) {
    console.log("unable to check email", error);
    res.status(500).send("Unable to check email");
  }
};

export default checkEmail;
