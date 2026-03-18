const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const { url } = require("./utils/db-util");
const rootDir = require("./utils/path-util");
const { sessionStore } = require("./utils/session-util");
const cors = require("cors");
require("dotenv").config();



const { authRouter } = require("./routers/authRouter");
const threatRoutes = require("./routers/threatRoutes");

const app = express();


app.set("trust proxy", 1); 


const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.static(path.join(rootDir, "public")));
app.use(express.json());


const isProduction = process.env.NODE_ENV === 'production';

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: isProduction ? true : false, 
      sameSite: isProduction ? 'none' : 'lax', 
      maxAge: 60000 * 60 * 24 * 15, 
    },
  }),
);

app.use("/api",authRouter);
app.use("/api/threats", threatRoutes);


const PORT = process.env.PORT || 3010;

async function startServer() {
  try {
    await mongoose.connect(url);
    

    app.listen(PORT, () => {
      
    });
  } catch (err) {
    
    process.exit(1); 
  }
}

startServer();