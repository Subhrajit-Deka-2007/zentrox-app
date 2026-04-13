const mongoose = require('mongoose');
const validator = require("validator"); // ✅ make sure this is here
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "E-mail is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      validate: {
        validator: function (value) {
          if (value.startsWith("$2b$")) return true;
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,16}$/.test(
            value,
          );
        },
        message:
          "Password must be 12-16 chars with uppercase, lowercase, number and special character",
      },
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date-Of-Birth is required!"],
      validate: {
        validator: function (value) {
          const sixteenYearsAgo = new Date();
          sixteenYearsAgo.setUTCFullYear(sixteenYearsAgo.getUTCFullYear() - 16);
          const hundredTwentyYearsAgo = new Date();
          hundredTwentyYearsAgo.setUTCFullYear(
            hundredTwentyYearsAgo.getUTCFullYear() - 120,
          );
          return value <= sixteenYearsAgo && value >= hundredTwentyYearsAgo;
        },
        message: "Age must be between 16 and 120 years",
      },
    },
    city: {
      type: String,
      trim: true,
      required: [true, "City name is required"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Please enter a phone number"],
      unique: true,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, "any");
        },
        message: "Please enter a valid international phone number!",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    //  add these two fields
    passwordResetToken: {
      type: String,
      select: false, //  never returned in queries
    },
    passwordResetExpires: {
      type: Date,
      select: false, //  never returned in queries
    },
  },
  { timestamps: true, strict: true },
);

// ✅ pre save hook
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ✅ compare passwords method
userSchema.methods.comparePasswords = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
