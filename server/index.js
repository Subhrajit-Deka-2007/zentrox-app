// ✅ dotenv must be absolute first
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const rfs = require("rotating-file-stream");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // ✅ required early

const app = express();

// ✅ define corsOptions first
const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ✅ use corsOptions everywhere
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // ✅ handle preflight

const { generalRateLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./errors/errorHandler");
const AppError = require("./errors/AppError");

const userRoute = require("./routes/authRoutes");
const postRoute = require("./routes/postRoutes");
const commentRoute = require("./routes/commentRoutes");
const ratingRoute = require("./routes/ratingRoutes");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimiter);

// ✅ logging setup
const accessLogsFolder = path.join(__dirname, "logs/access");
if (!fs.existsSync(accessLogsFolder))
  fs.mkdirSync(accessLogsFolder, { recursive: true });

const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: accessLogsFolder,
});
app.use(morgan("combined", { stream: accessLogStream }));

// ✅ DB connection
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};
connectDb();

// ✅ static files before routes
app.use("/uploads", express.static("uploads"));

// ✅ routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", commentRoute);
app.use("/api/v1/post", ratingRoute);
app.use("/api/v1/post", postRoute);

// ✅ 404 handler
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Route ${req.url} not found!`, 404));
});

// ✅ error handler last
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
