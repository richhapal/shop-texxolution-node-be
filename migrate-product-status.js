/**
 * Migration script to convert product status from lowercase to uppercase
 * Run this script once after deploying the updated Product model
 */

const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// MongoDB connection string - update this to match your environment
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/texxolution';

async function migrateProductStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Status mapping from lowercase to uppercase
    const statusMapping = {
      active: 'ACTIVE',
      inactive: 'INACTIVE',
      draft: 'DRAFT',
      discontinued: 'DISCONTINUED',
    };

    // Find all products with lowercase status
    const productsToUpdate = await Product.find({
      status: { $in: ['active', 'inactive', 'draft', 'discontinued'] },
    });

    console.log(
      `Found ${productsToUpdate.length} products with lowercase status`,
    );

    if (productsToUpdate.length === 0) {
      console.log('No products need status migration');
      return;
    }

    // Update each product
    let updatedCount = 0;
    for (const product of productsToUpdate) {
      const newStatus = statusMapping[product.status];
      if (newStatus) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { status: newStatus } },
        );
        console.log(
          `Updated product ${product.sku} status from ${product.status} to ${newStatus}`,
        );
        updatedCount++;
      }
    }

    console.log(`\n✅ Migration completed! Updated ${updatedCount} products`);

    // Verify the migration
    const remainingLowercase = await Product.countDocuments({
      status: { $in: ['active', 'inactive', 'draft', 'discontinued'] },
    });

    if (remainingLowercase === 0) {
      console.log('✅ All products now have uppercase status values');
    } else {
      console.log(
        `⚠️  Warning: ${remainingLowercase} products still have lowercase status`,
      );
    }

    // Show status distribution
    const statusDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('\n📊 Status distribution after migration:');
    statusDistribution.forEach(item => {
      console.log(`  ${item._id}: ${item.count} products`);
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateProductStatus()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateProductStatus };
