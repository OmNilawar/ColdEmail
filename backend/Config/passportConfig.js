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
          if (!user.googleId) user.googleId = googleId;
          if (user.password && user.loginMethod !== 'both') user.loginMethod = 'both';
          else if (!user.loginMethod || user.loginMethod !== 'google') user.loginMethod = 'google';

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

        done(null, user._id); // ✅ Store only the ID in session
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// ✅ Deserialize from session and attach full user to req.user
passport.serializeUser((userId, done) => {
  done(null, userId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // This will now include user._id on req.user
  } catch (error) {
    done(error, null);
  }
});

export default passport;
