import { Request, Response } from "express";
import { prisma } from "../../prismaDb/prismaDb";

const getUser = async(req: Request, res: Response) => {
  const {providerId} = req.user as {providerId: string};
  if(!providerId) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return 
  }

  const user = await prisma.user.findUnique({
    where: {
      providerId
    }
  })

  if(!user) {
    res.status(404).json({ message: "User not found" });
    return
  }

  const userProfile = await prisma.profile.findUnique({
    where: {
      userId: user.id
    }
  })

  if(!userProfile) {
    res.status(404).json({ message: "User profile not found" });
    return
  }
  
  res.status(200).json({
    message: `Hello, user with Google ID`,
    user: userProfile,
  });
};

export default getUser;
