export const googleAuthCallback = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'User logged in successfully via Google',
      user: req.user,
    });
  } catch (error) {
    console.error('Error during Google Auth Callback:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
