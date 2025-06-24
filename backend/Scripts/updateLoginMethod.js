// scripts/updateLoginMethod.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../Models/userModel.js';
import connectDB from '../Database/dbConfig.js';

dotenv.config();

const updateExistingUsers = async () => {
  try {
    await connectDB();

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      // Skip users who already have loginMethod set
      if (!user.loginMethod) {
        if (user.googleId && user.password) {
          user.loginMethod = 'both';
        } else if (user.googleId) {
          user.loginMethod = 'google';
        } else {
          user.loginMethod = 'local'; // fallback if password exists or nothing else
        }

        await user.save();
        console.log(`✅ Updated ${user.email} -> loginMethod: ${user.loginMethod}`);
      } else {
        console.log(`⏭️  Skipped ${user.email} (already has loginMethod: ${user.loginMethod})`);
      }
    }

    console.log('🎉 All applicable users updated!');
    process.exit();
  } catch (error) {
    console.error('❌ Error updating users:', error.message);
    process.exit(1);
  }
};

updateExistingUsers();
