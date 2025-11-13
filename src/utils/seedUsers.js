const mongoose = require("mongoose");
const User = require("../models/User");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

/**
 * Create initial admin user
 */
const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return;
    }

    // Create admin user
    const adminData = {
      name: "Admin User",
      email: "admin@shoptexxolution.com",
      passwordHash: "admin123456", // This will be hashed by the pre-save middleware
      role: "admin",
      status: "active",
      isEmailVerified: true,
      department: "Administration",
    };

    const adminUser = await User.create(adminData);
    console.log("Admin user created successfully:", adminUser.email);
    console.log("Login credentials:");
    console.log("Email: admin@shoptexxolution.com");
    console.log("Password: admin123456");
    console.log("");
    console.log("🔒 Please change the admin password after first login!");
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

/**
 * Create sample users for testing
 */
const createSampleUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const sampleUsers = [
      {
        name: "Editor User",
        email: "editor@shoptexxolution.com",
        passwordHash: "editor123456",
        role: "editor",
        status: "active",
        isEmailVerified: true,
        department: "Content Management",
      },
      {
        name: "Viewer User",
        email: "viewer@shoptexxolution.com",
        passwordHash: "viewer123456",
        role: "viewer",
        status: "active",
        isEmailVerified: true,
        department: "Sales",
      },
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (!existingUser) {
        const user = await User.create(userData);
        console.log(`${userData.role} user created:`, user.email);
      } else {
        console.log(`${userData.role} user already exists:`, userData.email);
      }
    }
  } catch (error) {
    console.error("Error creating sample users:", error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run based on command line argument
const command = process.argv[2];

switch (command) {
  case "admin":
    createAdminUser();
    break;
  case "sample":
    createSampleUsers();
    break;
  case "all":
    (async () => {
      await createAdminUser();
      await createSampleUsers();
    })();
    break;
  default:
    console.log("Usage: node src/utils/seedUsers.js [admin|sample|all]");
    console.log("  admin  - Create admin user only");
    console.log("  sample - Create sample users only");
    console.log("  all    - Create admin and sample users");
    break;
}
