import User from '../Models/userModel.js';

export const googleAuthCallback = async (req, res) => {
  try {
    const profile = req.user;

    // Check if the user already exists in the database
    let user = await User.findOne({ googleId: profile.googleId });

    if (!user) {
      // Create a new user if not found
      user = await User.create({
        fullName: profile.fullName,
        email: profile.email,
        googleId: profile.googleId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        profileImage: profile.profileImage,
      });
      return res.status(201).json({ message: 'User added successfully', user });
    } else {
      // Update tokens and profile image if user already exists
      user.accessToken = profile.accessToken;
      user.refreshToken = profile.refreshToken || user.refreshToken;
      user.profileImage = profile.profileImage;
      await user.save();
      return res.status(200).json({ message: 'User already exists, tokens updated', user });
    }
  } catch (error) {
    console.error('Error adding user:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};