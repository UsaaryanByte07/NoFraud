const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const { url } = require("./utils/db-util");
const rootDir = require("./utils/path-util");
const { sessionStore } = require("./utils/session-util");
const cors = require("cors");
require("dotenv").config();

//Importing the Routers
// const notFoundRouter = require("./routers/notFoundRouter");
const { authRouter } = require("./routers/authRouter");

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.static(path.join(rootDir, "public")));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: false, // Set to true only in production with HTTPS
      maxAge: 60000 * 60 * 24 * 15, // 15 days
    },
  }),
);

app.use("/api",authRouter);
// app.use(notFoundRouter);

const PORT = 3010;

async function startServer() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB successfully!");

    app.listen(PORT, () => {
      console.log(`Server is running on PORT:http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Unable to connect to Database:", err.message);
    process.exit(1); // Exit the process if DB connection fails
  }
}

startServer();