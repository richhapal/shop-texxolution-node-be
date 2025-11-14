/* eslint-disable no-console */
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

/**
 * Debug script to check existing users and their password hashes
 */
async function debugUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log('\n--- User Debug Info ---');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('Status:', user.status);
      console.log(
        'Password Hash Length:',
        user.passwordHash?.length || 'No password hash',
      );
      console.log(
        'Password Hash Sample:',
        user.passwordHash?.substring(0, 30) + '...',
      );

      // Test password validation with a common test password
      const testPassword = 'admin123';
      const isValid = await user.checkPassword(testPassword);
      console.log(`Test password "${testPassword}" valid:`, isValid);
    }
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugUsers();
