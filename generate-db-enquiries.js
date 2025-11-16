/**
 * Direct Database Script to Generate Sample Enquiries
 * This script creates realistic enquiries directly in the MongoDB database
 */

const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Enquiry = require('./src/models/Enquiry');

// MongoDB connection string - using the same as your server
require('dotenv').config();
const MONGODB_URI =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/texxolution';

// Sample customer data for realistic enquiries
const sampleCustomers = [
  {
    customerName: 'John Smith',
    company: 'ABC Garments Ltd',
    email: 'john.smith@abcgarments.com',
    phone: '+15550101',
    message:
      'We are interested in bulk purchasing cotton fabrics for our upcoming spring collection. Looking for high-quality materials with competitive pricing and reliable delivery schedules.',
    priority: 'high',
    source: 'website',
  },
  {
    customerName: 'Maria Rodriguez',
    company: 'Fashion Forward Inc',
    email: 'maria@fashionforward.com',
    phone: '+15550102',
    message:
      'Our company specializes in sustainable fashion. We need eco-friendly fabric options for our new product line. Do you have organic cotton or recycled materials available?',
    priority: 'medium',
    source: 'referral',
  },
  {
    customerName: 'David Chen',
    company: 'Oriental Textiles Co',
    email: 'd.chen@orientaltextiles.cn',
    phone: '+8613800138888',
    message:
      'Looking for premium cotton and silk fabrics for export to international markets. Need consistent quality and competitive pricing for quantities above 1000 meters per order.',
    priority: 'urgent',
    source: 'trade_show',
  },
  {
    customerName: 'Sarah Johnson',
    company: 'Boutique Creations',
    email: 'sarah@boutiquecreations.com',
    phone: '+442079460958',
    message:
      'Small boutique looking for unique fabric designs for custom dresses and evening wear. Quality over quantity is our priority. Do you have exclusive patterns available?',
    priority: 'low',
    source: 'email',
  },
  {
    customerName: 'Ahmed Hassan',
    company: 'Middle East Trading LLC',
    email: 'ahmed@metllc.ae',
    phone: '+97141234567',
    message:
      'Established trading company seeking reliable fabric supplier for our retail network across UAE and Saudi Arabia. Need competitive pricing and flexible payment terms.',
    priority: 'high',
    source: 'website',
  },
  {
    customerName: 'Emma Wilson',
    company: 'Sustainable Threads',
    email: 'emma@sustainablethreads.org',
    phone: '+15550103',
    message:
      'Non-profit organization promoting sustainable fashion. Interested in organic and recycled fabric options for community workshops and educational programs.',
    priority: 'medium',
    source: 'referral',
  },
  {
    customerName: 'Roberto Silva',
    company: 'Brazilian Fashion House',
    email: 'roberto@brazilfashion.com.br',
    phone: '+5511987654320',
    message:
      'Fashion house specializing in tropical wear and beachwear. Need lightweight, breathable fabrics suitable for hot climates with moisture-wicking properties.',
    priority: 'medium',
    source: 'trade_show',
  },
  {
    customerName: 'Lisa Anderson',
    company: 'Anderson Apparel',
    email: 'lisa@andersonapparel.com',
    phone: '+15550104',
    message:
      'Family-owned business looking for traditional fabric patterns for heritage clothing collection. Interested in classic designs and high-quality materials.',
    priority: 'low',
    source: 'phone',
  },
  {
    customerName: 'Raj Patel',
    company: 'India Textiles Export',
    email: 'raj@indiatextiles.in',
    phone: '+919876543210',
    message:
      'Export business seeking partnership for high-volume fabric supply to international markets. Need competitive pricing, quality assurance, and reliable delivery schedules.',
    priority: 'urgent',
    source: 'website',
  },
  {
    customerName: 'Sophie Laurent',
    company: 'Parisian Couture',
    email: 'sophie@parisiancouture.fr',
    phone: '+33142364892',
    message:
      'High-end couture house looking for luxury fabrics for exclusive designer pieces. Price is not the primary concern - we prioritize quality, uniqueness, and exclusivity.',
    priority: 'high',
    source: 'referral',
  },
  {
    customerName: 'Michael Brown',
    company: 'Urban Style Co',
    email: 'michael@urbanstyle.com',
    phone: '+15550105',
    message:
      'Contemporary clothing brand focusing on urban streetwear. Looking for durable, trendy fabrics suitable for casual wear and active lifestyle clothing.',
    priority: 'medium',
    source: 'website',
  },
  {
    customerName: 'Anna Kowalski',
    company: 'Polish Textiles Ltd',
    email: 'anna@polishtextiles.pl',
    phone: '+48221234567',
    message:
      'Textile distributor serving Eastern European markets. Seeking reliable suppliers for various fabric types with consistent quality and competitive wholesale pricing.',
    priority: 'high',
    source: 'email',
  },
];

// Different enquiry statuses with realistic distribution
const statuses = ['new', 'in_review', 'approved', 'rejected'];
const statusWeights = [0.5, 0.3, 0.15, 0.05]; // 50% new, 30% in_review, 15% approved, 5% rejected

// Helper function to get weighted random selection
function getWeightedRandom(items, weights) {
  const random = Math.random();
  let weightSum = 0;

  for (let i = 0; i < items.length; i++) {
    weightSum += weights[i];
    if (random <= weightSum) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

// Helper function to get random quantity based on category
function getRandomQuantity(category) {
  const ranges = {
    'Fabric (Finished)': [100, 2000],
    'Finished Fabrics': [100, 2000],
    Yarn: [50, 500],
    Garments: [25, 200],
    Denim: [150, 1000],
    'Greige Fabric': [200, 1500],
    Fibre: [100, 800],
    'Trims & Accessories': [500, 5000],
    'Home Decoration': [50, 300],
    Packing: [100, 1000],
    default: [50, 1000],
  };

  const range = ranges[category] || ranges['default'];
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

// Generate enquiry number
function generateEnquiryNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `ENQ-${year}${month}-${randomNum}`;
}

// Generate product notes based on product and customer
function generateProductNotes(product, customer) {
  const noteTemplates = [
    `Interested in ${product.category.toLowerCase()} for ${customer.company}`,
    `Need samples of ${product.name} before placing bulk order`,
    `Looking for competitive pricing on ${product.name}`,
    `Require quality certification and specifications for ${product.name}`,
    `Custom specifications may be needed for ${product.name}`,
    `Bulk order potential - need volume discount for ${product.name}`,
    `Timeline sensitive project requiring ${product.name}`,
    `Exploring ${product.name} for new product line development`,
    `Quality assessment needed for ${product.name}`,
    `Interested in long-term supply partnership for ${product.name}`,
  ];

  return noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
}

async function generateEnquiriesInDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Fetch available products
    const products = await Product.find({
      status: { $in: ['ACTIVE', 'DRAFT'] },
    })
      .limit(50)
      .lean();

    if (products.length === 0) {
      console.log(
        '❌ No active products found. Please add some products first.',
      );
      return;
    }

    console.log(`📦 Found ${products.length} products in database`);

    // Check existing enquiries count
    const existingCount = await Enquiry.countDocuments();
    console.log(`📊 Existing enquiries in database: ${existingCount}`);

    const enquiries = [];

    // Generate 12 enquiries (using all sample customers)
    for (let i = 0; i < sampleCustomers.length; i++) {
      const customer = sampleCustomers[i];

      // Select 1-4 random products for each enquiry
      const numProducts = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedProductIds = new Set();

      for (let j = 0; j < numProducts; j++) {
        let randomProduct;
        let attempts = 0;

        // Avoid duplicate products in same enquiry
        do {
          randomProduct = products[Math.floor(Math.random() * products.length)];
          attempts++;
        } while (
          usedProductIds.has(randomProduct._id.toString()) &&
          attempts < 10
        );

        if (!usedProductIds.has(randomProduct._id.toString())) {
          usedProductIds.add(randomProduct._id.toString());
          selectedProducts.push({
            productId: randomProduct._id,
            productName: randomProduct.name,
            quantity: getRandomQuantity(randomProduct.category),
            notes: generateProductNotes(randomProduct, customer),
          });
        }
      }

      // Create enquiry object
      const enquiryData = {
        enquiryNo: generateEnquiryNumber(),
        customerName: customer.customerName,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        message: customer.message,
        products: selectedProducts,
        status: getWeightedRandom(statuses, statusWeights),
        priority: customer.priority,
        source: customer.source,
        followUpDate: new Date(
          Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000,
        ), // Random date within next 14 days
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000,
        ), // Random date within last 45 days
      };

      enquiries.push(enquiryData);
    }

    // Insert enquiries into database
    console.log('\n📝 Inserting enquiries into database...');
    const insertedEnquiries = await Enquiry.insertMany(enquiries);

    console.log(
      `\n✅ Successfully generated ${insertedEnquiries.length} sample enquiries!`,
    );

    // Display summary statistics
    const statusSummary = await Enquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log('\n📊 Enquiry Status Summary:');
    statusSummary.forEach(item => {
      console.log(`  ${item._id.toUpperCase()}: ${item.count} enquiries`);
    });

    const prioritySummary = await Enquiry.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log('\n🎯 Priority Distribution:');
    prioritySummary.forEach(item => {
      console.log(`  ${item._id.toUpperCase()}: ${item.count} enquiries`);
    });

    const sourceSummary = await Enquiry.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log('\n📱 Source Distribution:');
    sourceSummary.forEach(item => {
      console.log(`  ${item._id.toUpperCase()}: ${item.count} enquiries`);
    });

    // Show some sample enquiry numbers
    const sampleEnquiries = await Enquiry.find()
      .limit(5)
      .select('enquiryNo customerName company status priority');
    console.log('\n📋 Sample Enquiries Created:');
    sampleEnquiries.forEach(enquiry => {
      console.log(
        `  ${enquiry.enquiryNo} - ${enquiry.customerName} (${enquiry.company}) [${enquiry.status.toUpperCase()}, ${enquiry.priority.toUpperCase()}]`,
      );
    });

    console.log('\n🎉 Sample enquiries created successfully!');
    console.log(
      '💻 You can now view them in your dashboard at: GET /api/dashboard/enquiries',
    );
  } catch (error) {
    console.error('❌ Error generating enquiries:', error);
    if (error.code === 11000) {
      console.log(
        '💡 Note: Some enquiries may have duplicate enquiry numbers or emails. This is normal for sample data.',
      );
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Disconnected from MongoDB');
  }
}

// Run the script if called directly
if (require.main === module) {
  console.log('🚀 Database Enquiry Generator');
  console.log('============================\n');

  generateEnquiriesInDatabase()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateEnquiriesInDatabase };
