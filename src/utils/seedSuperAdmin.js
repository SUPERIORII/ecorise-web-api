import db from "../database/pool.js";
import bcrypt from "bcrypt";
import { generateGradientColor } from "./generateGradient.js";


// DECLARE MENU LINK BASED ON ROLES

const seedSuperAdmin = async () => {
  // GET ALL DATA
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME;
  const lastName = process.env.SUPER_ADMIN_LAST_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const phoneNumber = "+231778786295";
  // HASH PASSWORD
  const hashPassword = await bcrypt.hash(password, 12);
  // GET USER GRADIENT COLOR
  const gradientColor = await generateGradientColor();

  // STEP 1: CHECK SUPERADMIN
  try {
    const rowResult = await db.query(
      `SELECT * FROM users WHERE role=$1 LIMIT 1`,
      ["superadmin"]
    );
    //  CREATE A SUPER ADMIN IF ONE DO NOT EXIST OR DON'T CREATE IF IT EXIST
    if (rowResult.rows.length === 0) {
      await db.query(
        `INSERT INTO users
        (first_name, last_name, phone_number, email, password, gender, date_of_birth, role, status, gradient_color ) VALUES($1,$2,$3,$4,$5, $6, $7, $8, $9,$10) RETURNING *`,
        [
          firstName,
          lastName,
          phoneNumber,
          email,
          hashPassword,
          "male",
          "may 20, 2000",
          "superadmin",
          "active",
          gradientColor,
        ]
      );
      console.log("✅Creating Super Admin");
    } else {
      console.log("✅ Super Admin already exist");
    }

    // STEP 2: DEFINE MENUS PER ROLE
    const menusByRoles = {
      // SUPER ADMIN MENUS
      superadmin: [
        {
          role: "superadmin",
          label: "Dashboard",
          path: "/dashboard/superadmin",
          icon: "LayoutDashboard",
          position: 1,
        },
        {
          role: "superadmin",
          label: "Manage users",
          path: "/dashboard/superadmin/users",
          icon: " Users",
          position: 2,
        },
        {
          role: "superadmin",
          label: "Content Moderation",
          path: "/dashboard/superadmin/content-moderation",
          icon: "ShieldCheckIcon",
          position: 3,
        },
        {
          role: "superadmin",
          label: "Reports & Analytics",
          path: "/dashboard/superadmin/reports",
          icon: "ChartBar",
          position: 4,
        },
        {
          role: "superadmin",
          label: "Security & Analytics",
          path: "/dashboard/superadmin/security",
          icon: "Shield",
          position: 5,
        },
        {
          role: "superadmin",
          label: "System Settings",
          path: "/dashboard/superadmin/settings",
          icon: "Server",
          position: 6,
        },
      ],

      // ADMIN MENUS
      admin: [
        {
          role: "admin",
          label: "Dashboard",
          path: "/dashboard/admin",
          icon: "LayoutDashboard",
          position: 1,
        },
        {
          role: "admin",
          label: "Manage Content",
          path: "/admin/content",
          icon: "File",
          position: 2,
        },
        {
          role: "admin",
          label: "partners Overview",
          path: "/admin/partners",
          icon: "Handshake",
          position: 3,
        },
        {
          role: "admin",
          label: "Donors Overview",
          path: "/admin/donors",
          icon: "Handshake",

          position: 4,
        },
        {
          role: "admin",
          label: "Reports",
          path: "/admin/reports",
          icon: " FileText",
          position: 5,
        },
        {
          role: "admin",
          label: "My Profile",
          path: "/admin/profile",
          icon: "User",
          position: 6,
        },
      ],

      // DONORS
      donor: [
        {
          role: "donor",
          label: "Dashboard",
          path: "/dashboard/donor",
          icon: "LayoutDashboard",
          position: 1,
        },
        {
          role: "donor",
          label: "Explore Projects",
          path: "/dashboard/donor/projects",
          icon: " Compass",
          position: 2,
        },
        {
          role: "donor",
          label: "Donation History",
          path: "/dashboard/donor/donations",
          icon: " Wallet",
          position: 3,
        },
        {
          role: "donor",
          label: "news & Stories",
          path: "/dashboard/donor/news",
          icon: "Newspaper",
          position: 4,
        },
        {
          role: "donor",
          label: "My Profile",
          path: "/dashboard/donor/profile",
          icon: "User",
          position: 5,
        },
      ],

      // PARTNERS
      partner: [
        {
          role: "partner",
          label: "Dashboard",
          path: "/dashboard/partner",
          icon: "LayoutDashboard",
          position: 1,
        },
        {
          role: "partner",
          label: "Manage Project & Campaigns",
          path: "/dashboard/partner/projects",
          icon: "Folder",
          position: 2,
        },
        {
          role: "partner",
          label: "Donations Report",
          path: "/dashboard/partner/donations",
          icon: "Folder",
          position: 3,
        },
        {
          role: "partner",
          label: "Submit Reports & Updates",
          path: "/dashboard/partner/reports",
          icon: "FilePlus",
          position: 4,
        },
        {
          role: "partner",
          label: "Connect With Donors",
          path: "/dashboard/partner/messages",
          icon: "UserPlus",
          position: 5,
        },
        {
          role: "partner",
          label: "Organization Profile",
          path: "/dashboard/partner/profile",
          icon: "Building",
          position: 6,
        },
      ],
    };

    // STEP 3: GET MENU ROLES
    for (const role in menusByRoles) {
      const menus = menusByRoles[role];

      for (const menu of menus) {
        // CHECK IF MENU ALREADY EXISTS
        const isMenuExisting = await db.query(
          `SELECT * FROM menus WHERE role=$1 AND label=$2`,
          [role, menu.label]
        );

        if (isMenuExisting.rows.length === 0) {
          await db.query(
            `INSERT INTO menus (role, label, path, icon, position) VALUES($1,$2,$3,$4, $5)`,
            [role, menu.label, menu.path, menu.icon, menu.position]
          );
          // console.log(`Menu '${menu.label}' for role ${role} created✅`);
        } else {
          // console.log(`Menu '${menu.label}' for role ${role} Already exist ⚠️`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Creating Super Admin Error:", error);
  }
};

export default seedSuperAdmin;
