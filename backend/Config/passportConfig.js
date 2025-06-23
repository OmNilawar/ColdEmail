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
        // Log the profile object to debug and verify the data
        console.log('Google Profile:', profile);

        // Check if user already exists in the database
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create a new user if not found
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            accessToken,
            refreshToken,
            profileImage: profile.photos?.[0]?.value,
          });
        } else {
          // Update tokens and profile image if user already exists
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          user.profileImage = profile.photos?.[0]?.value;
          await user.save();
        }

        // Pass all needed fields for controller access
        done(null, {
          googleId: user.googleId,
          fullName: user.fullName,
          email: user.email,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          profileImage: user.profileImage,
        });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize the whole user object for controller access
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize the whole user object
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;