/* eslint-disable no-console */
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

/**
 * Make user an admin for testing role assignment functionality
 */
async function makeUserAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const email = 'rich@gmail.com';
    const user = await User.findByEmail(email);

    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    console.log(`Updating user role from '${user.role}' to 'admin'`);
    user.role = 'admin';
    await user.save();

    console.log('✅ User role updated to admin successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${user.role}`);
    console.log('');
    console.log('You can now test:');
    console.log('1. Login with email: rich@gmail.com, password: admin123');
    console.log('2. Use the assign-role endpoint to change other users roles');
  } catch (error) {
    console.error('Role update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

makeUserAdmin();
