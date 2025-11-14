/* eslint-disable no-console */
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

/**
 * Reset password for a specific user
 */
async function resetUserPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const email = 'rich@gmail.com'; // The user from debug
    const newPassword = 'admin123'; // Set a known password

    const user = await User.findByEmail(email);

    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    console.log(`Resetting password for user: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);

    // Set the new password
    await user.setPassword(newPassword);
    await user.save();

    console.log(`✅ Password reset successful!`);
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);

    // Verify the password works
    const isValid = await user.checkPassword(newPassword);
    console.log(`Password validation test: ${isValid ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.error('Password reset failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetUserPassword();
