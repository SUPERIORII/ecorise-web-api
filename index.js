import "./src/config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import helmet from "helmet";

// 1. SYSTEM CONFIGURATION
import { initSocket } from "./src/config/socket.config.js";
import setupDatabase from "./src/database/database.js";
import seedSuperAdmin from "./src/utils/seedSuperAdmin.js";

// 1. custom route HANDLERS
import newRoutes from "./src/routes/newsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectsRoutes.js";
import membersRoute from "./src/routes/member.js";
import menuLinksRoute from "./src/routes/menuLinks.js";
import resourcesRoute from "./src/routes/resources.js";
import homeRoutes from "./src/routes/landingRoutes.js";
import partnerRoutes from "./src/routes/partnerRoutes.js";
import verifyRoutes from "./src/routes/verify.js";
import userRoutes from "./src/routes/user.js";
import menuRoutes from "./src/routes/menus.js";
import getInvolvedRoutes from "./src/routes/getInvolveRoutes.js";
import likesRoutes from "./src/routes/likesRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import verifyCodeRoutes from "./src/routes/verifyRoutes.js";

// 1. INITIALIZE CONFIGURATION
const app = express();
const server = http.createServer(app);
const io = initSocket(server);
const PORT = process.env.PORT || 8000;

// SECURITY AND MIDDLEWARES
app.use(helmet()); // SET SECURITY HEADERS
app.use(cookieParser(process.env.COOKIE_SECRET)); // SUPORT FOR PARSING AND SIGING COOKIES
app.use(express.json({ limit: "10kb" })); // PARSE JSON REQUEST BODY AND LIMIT TO 10KB
app.use(express.urlencoded({ extended: true }));
// DEFINE ALLOWED ORIGINS IN 2026 (Usually stored in environment variables)
const allowedOrigins = ["http://localhost:3000"];

const corsOPtions = {
  origin: function (origin, callback) {
    // ALLOW REQUEST WITH NO ORIGIN (LIKE MOBILE APPS OR CURL, OR POSTMAN)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS Policy"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //STANDARD HTTP METHODS
  allowedHeaders: ["Content-Type", "Authorization"], // ESSENTIAL FOR MODERN APIs
  credentials: true, //  REQUIRED FOR COOKIES
  optionsSuccessStatus: 200, // LAGACY BROWSER SUPPORT
};

// APPLY CORS TO ALL ROUTES
app.use(cors(corsOPtions));

// START SERVER FUNCTION
const startServer = async () => {
  try {
    // CONNECT THE POSTGRESQL DATABASE
    await setupDatabase();

    // CREATE SEED ADMIN ON SERVER START
    await seedSuperAdmin();

    // ROUTES DEFINATIONS
    app.get("/", (req, res) => {
      res.json({
        status: "ok",
        timeStamp: new Date().toISOString(),
        message: "Ecorise Backend is running",
      });
    });

    app.get("/test/users", (req, res) => {
      res.json([
        { id: 1, name: "abraham" },
        { id: 2, name: "James" },
      ]);
    });

    // IMPORTED ROUTES DEFINITION
    app.use("/api/links", menuLinksRoute);
    app.use("/api/auth", authRoutes);
    app.use("/api/news", newRoutes);
    app.use("/api/project", projectRoutes);
    app.use("/api/members", membersRoute);
    app.use("/api/resource", resourcesRoute);
    app.use("/api/landing", homeRoutes);
    app.use("/api/partners", partnerRoutes);
    app.use("/api/menu", menuRoutes);
    app.use("/api/getInvolved", getInvolvedRoutes);
    app.use("/api/likes", likesRoutes);
    app.use("/api/search", searchRoutes);

    // verify every user token
    app.use("/api/authenticate", verifyRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/verify", verifyCodeRoutes);

    server.listen(PORT, () =>
      console.log(
        `server is listening on ${
          process.env.DB_PROVIDER === "render"
            ? "https://ecorise-web.onrender.com serving with render database"
            : process.env.DB_PROVIDER === "neon"
            ? "https://ecorise-web.onrender.com serving with neon database"
            : `${process.env.BASE_URL} locally`
        }`
      )
    );
  } catch (error) {
    console.error("Failed to connect to database or create tables:", err);
  }
};
// MIDDLEWARES

startServer();
