/* eslint-disable no-console */
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

/**
 * Migration script to fix double-hashed passwords
 * This script will reset passwords for users who have double-hashed passwords
 */
async function fixDoubleHashedPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users to check`);

    let fixedCount = 0;

    for (const user of users) {
      // Check if the password hash looks like a double hash
      // Double hashes typically start with $2b$ twice (nested bcrypt format)
      const passwordHash = user.passwordHash;

      // If this is likely a double-hashed password, reset it to a default
      if (passwordHash && passwordHash.length > 100) {
        // Double hashes are much longer
        console.log(`Fixing password for user: ${user.email}`);

        // Set a temporary password that the user will need to change
        const tempPassword = 'TempPass123!';
        await user.setPassword(tempPassword);
        await user.save();

        console.log(
          `✅ Fixed password for ${user.email} - temporary password: ${tempPassword}`,
        );
        fixedCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`Fixed ${fixedCount} users with double-hashed passwords`);

    if (fixedCount > 0) {
      console.log(`\n⚠️  IMPORTANT:`);
      console.log(
        `Users with fixed passwords now have temporary password: "TempPass123!"`,
      );
      console.log(`They should change their password after logging in.`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  fixDoubleHashedPasswords();
}

module.exports = fixDoubleHashedPasswords;
