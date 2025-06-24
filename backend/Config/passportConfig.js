import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../Models/userModel.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.Client_ID,
      clientSecret: process.env.Client_Secret,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        let user = await User.findOne({ email });

        if (user) {
          if (!user.googleId) {
            user.googleId = googleId;
          }

          if (user.password && user.loginMethod !== 'both') {
            user.loginMethod = 'both';
          } else if (!user.loginMethod || user.loginMethod !== 'google') {
            user.loginMethod = 'google';
          }

          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          user.profileImage = profile.photos?.[0]?.value;

          await user.save();
        } else {
          user = await User.create({
            fullName: profile.displayName,
            email,
            googleId,
            accessToken,
            refreshToken,
            profileImage: profile.photos?.[0]?.value,
            loginMethod: 'google',
          });
        }

        done(null, {
          googleId: user.googleId,
          fullName: user.fullName,
          email: user.email,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          profileImage: user.profileImage,
          loginMethod: user.loginMethod,
        });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Passport session handling
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
