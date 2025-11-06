import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './db.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;

        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (!user) {
          user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId, isVerified: true },
            });
          } else {
            user = await prisma.user.create({
              data: {
                email,
                googleId,
                name,
                isVerified: true,
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
