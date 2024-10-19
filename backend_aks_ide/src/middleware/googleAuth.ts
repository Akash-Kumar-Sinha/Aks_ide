import { Request } from "express";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback,
} from "passport-google-oauth20";
import dotenv from "dotenv";

import { prisma } from "../prismaDb/prismaDb";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `/auth/google/callback`,
      passReqToCallback: true,
      scope: ["profile", "email"],
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: VerifyCallback
    ) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error("No email found in profile"), profile);
        }

        const email = profile.emails[0].value;

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          user = await prisma.user.update({
            where: { email },
            data: {
              accessToken: accessToken,
              refreshToken: refreshToken || undefined,
              updatedAt: new Date(),
            },
          });

          return done(null, user);
        }

        user = await prisma.user.create({
          data: {
            email: email,
            name: profile.displayName,
            emailVerified: profile._json.email_verified || false,
            avatar: profile.photos ? profile.photos[0].value : undefined,
            provider: "GOOGLE",
            providerId: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken || undefined,
            profile: {
              create: {
                email: email,
                name: profile.displayName,
                avatar: profile.photos ? profile.photos[0].value : undefined,
              },
            },
          },
        });

        done(null, user);
      } catch (error) {
        console.error("Error in Google strategy:", error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});
