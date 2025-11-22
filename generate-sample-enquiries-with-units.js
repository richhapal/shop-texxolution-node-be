/*
 * Small helper script to generate 2-3 sample enquiries with unit fields.
 * By default this script runs in dry-run mode and prints the generated enquiries.
 * To actually insert into the DB, pass `--run` as a command-line argument.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Enquiry = require('./src/models/Enquiry');
const categoryUnits = require('./config/categoryUnits');

const MONGODB_URI =
  process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/texxolution';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateEnquiries({ count = 3, useDb = false, insert = false } = {}) {
  // If using DB, fetch products; otherwise use placeholder categories
  let productsPool = [];
  if (useDb) {
    const prods = await Product.find({ status: { $in: ['ACTIVE', 'DRAFT'] } })
      .limit(100)
      .lean();
    productsPool = prods;
  } else {
    // Build placeholder products from categoryUnits keys
    productsPool = Object.keys(categoryUnits).map((cat, idx) => ({
      _id: null,
      name: `${cat} sample product ${idx + 1}`,
      category: cat,
    }));
  }

  const sampleCustomers = [
    {
      customerName: 'Sample Buyer A',
      company: 'A Trading Co',
      email: 'buyer.a@example.com',
      phone: '+10000000001',
      message: 'Please provide pricing and lead time.',
    },
    {
      customerName: 'Sample Buyer B',
      company: 'B Textiles',
      email: 'buyer.b@example.com',
      phone: '+10000000002',
      message: 'Require bulk quantities for upcoming season.',
    },
    {
      customerName: 'Sample Buyer C',
      company: 'C Garments',
      email: 'buyer.c@example.com',
      phone: '+10000000003',
      message: 'Need samples and then bulk supply.',
    },
  ];

  const enquiries = [];
  for (let i = 0; i < count; i++) {
    const customer = sampleCustomers[i % sampleCustomers.length];

    const numProducts = randomInt(1, 3);
    const selected = [];
    const used = new Set();

    for (let p = 0; p < numProducts; p++) {
      let prod;
      let attempts = 0;
      do {
        prod = pickRandom(productsPool);
        attempts++;
      } while (prod && prod._id && used.has(prod._id.toString()) && attempts < 10);

      if (!prod) continue;
      if (prod._id) used.add(prod._id.toString());

      const allowed = categoryUnits[prod.category] || [];
      const chosenUnit = pickRandom(allowed);
      const quantity = randomInt(1, 1000);

      selected.push({
        productId: prod._id || undefined,
        productName: prod.name || 'Unnamed product',
        quantity,
        unit: chosenUnit || undefined,
        notes: `Auto-generated sample for ${prod.category}`,
      });
    }

    const enquiry = {
      customerName: customer.customerName,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      message: customer.message,
      products: selected,
      source: 'script',
      status: 'new',
    };

    enquiries.push(enquiry);
  }

  if (insert) {
    const inserted = await Enquiry.insertMany(enquiries);
    return inserted;
  }

  return enquiries;
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const insert = args.includes('--run');
  const useDb = args.includes('--db');
  const countArgIndex = args.findIndex(a => a === '--count');
  let count = 3;
  if (countArgIndex !== -1 && args[countArgIndex + 1]) {
    const n = parseInt(args[countArgIndex + 1], 10);
    if (!Number.isNaN(n) && n > 0) count = n;
  }

  (async () => {
    try {
      if (useDb || insert) {
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');
      }

      const result = await generateEnquiries({ count, useDb, insert });

      if (insert) {
        console.log(`Inserted ${result.length} enquiries into DB:`);
        result.forEach(e => console.log(`  ${e._id} (${e.enquiryNo || 'no-enqNo'})`));
      } else {
        console.log('Dry-run generated enquiries:');
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      console.error('Error generating enquiries:', err.message || err);
    } finally {
      if (useDb || insert) await mongoose.disconnect();
    }
  })();
}

module.exports = { generateEnquiries };
