import { prisma } from "../prismaDb/prismaDb";

const fetchUserId = async (providerId?: string, accessToken?: string) => {
  try {
    if (!providerId && !accessToken) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { providerId },
    });
    if (!user) {
      return null;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return null;
    }

    return { userId: user.id, profileId: profile.id };
  } catch {
    console.log("Error in fetching Id");
    return null;
  }
};

export default fetchUserId;
