const validator = require("validator");
const { dataExistence } = require("./dataExistence");
const deepClean = require("./sanitizer.js");

const passwordOptions = {
  minLength: 12,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

// ✅ common confirm password validator
const validateCommonConfirmPassword = (confirmPassword, password, err) => {
  const checkConfirm = deepClean(confirmPassword);
  const checkPassword = deepClean(password);
  if (!checkPassword) {
    err.confirmPassword = "Please enter a password";
  } else if (!checkConfirm) {
    err.confirmPassword = "Please confirm your password";
  } else if (checkPassword !== checkConfirm) {
    err.confirmPassword = "Passwords do not match";
  }
};

// ✅ common email validator
const validateCommonEmail = (email, err, isUpdate) => {
  if (!email) {
    err.email = isUpdate ? "Email cannot be empty" : "Email is required";
    return;
  }
  if (email.length > 254) {
    err.email = "Email is too long";
    return;
  }
  const safeEmail = deepClean(email).trim();
  if (!safeEmail) {
    err.email = isUpdate ? "Email cannot be empty" : "Email is required";
  } else if (!validator.isEmail(safeEmail)) {
    err.email = "Please enter a valid email address";
  }
};

// ✅ common password validator
const validateCommonPass = (password, err, isUpdate) => {
  if (!password) {
    err.password = isUpdate
      ? "Password cannot be empty"
      : "Password is required";
    return;
  }
  const safePass = deepClean(password);
  if (!safePass) {
    err.password = isUpdate
      ? "You cannot save an empty password"
      : "Password is required";
  } else if (safePass.length > 16) {
    err.password = "Password is too long! Maximum 16 characters";
  } else if (!validator.isStrongPassword(safePass, passwordOptions)) {
    err.password = "Must be 12-16 chars with Upper, Lower, Number & Symbol";
  }
};

// ✅ register validator
exports.validateRegister = (data) => {
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };
  const err = {};
  validateCommon(data, err, false);
  return { err, isValid: Object.keys(err).length === 0 };
};

// ✅ login validator
exports.validateUserLogin = (data) => {
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };
  const err = {};
  const { email, password } = data;
  validateCommonEmail(email, err, false);
  validateCommonPass(password, err, false);
  return { err, isValid: Object.keys(err).length === 0 };
};

// ✅ update validator
exports.validateUserUpdate = (data) => {
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };
  const err = {};
  validateCommon(data, err, true);
  return { err, isValid: Object.keys(err).length === 0 };
};

// ✅ verify old password
exports.validateVerifyOldPassword = (data) => {
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };
  const err = {};
  const { oldPassword } = data;
  if (!oldPassword) {
    err.oldPassword = "Current password is required";
  } else {
    const safeOld = deepClean(oldPassword);
    if (!safeOld) {
      err.oldPassword = "Current password is required";
    } else if (safeOld.length > 16) {
      err.oldPassword = "Invalid credentials";
    }
  }
  return { err, isValid: Object.keys(err).length === 0 };
};

// ✅ validate new password
exports.validateNewPassword = (data) => {
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };
  const err = {};
  const { password, confirmPassword } = data;
  validateCommonPass(password, err, false);
  validateCommonConfirmPassword(confirmPassword, password, err);
  return { err, isValid: Object.keys(err).length === 0 };
};

// ✅ common validation — no dataExistence here, parent already checked
const validateCommon = (data, err, isUpdate) => {
  const { name, email, password, confirmPassword, phone, dob, city } = data;

  // ✅ city validation — correct key
  if (!city) {
    err.city = isUpdate
      ? "City name cannot be empty"
      : "Please enter a city name";
  } else if (city.length > 30) {
    err.city = "City name is too long (Maximum 30 characters)";
  } else {
    const safeCity = deepClean(city).trim();
    if (!safeCity)
      err.city = isUpdate
        ? "City name cannot be empty"
        : "Please enter a city name";
    else if (!validator.isLength(safeCity, { min: 2, max: 30 }))
      err.city = "City name must be between 2 and 30 characters";
    else if (!/^[a-zA-Z\s'-]+$/.test(safeCity))
      err.city = "City name contains invalid characters";
  }

  // ✅ name validation
  if (!name) {
    err.name = isUpdate ? "Name cannot be empty" : "Please enter your name";
  } else if (name.length > 50) {
    err.name = "Name is too long (Maximum 50 characters)";
  } else {
    const safeName = deepClean(name).trim();
    if (!safeName)
      err.name = isUpdate ? "Name cannot be empty" : "Please enter your name";
    else if (!validator.isLength(safeName, { min: 2, max: 50 }))
      err.name = "Name must be between 2 and 50 characters";
    else if (!/^[a-zA-Z\s'-]+$/.test(safeName))
      err.name = "Name contains invalid characters";
  }

  // ✅ email validation
  validateCommonEmail(email, err, isUpdate);

  // ✅ password only on register
  if (!isUpdate) {
    validateCommonPass(password, err, isUpdate);
    validateCommonConfirmPassword(confirmPassword, password, err);
  }

  // ✅ dob validation
  if (!dob) {
    err.dob = isUpdate
      ? "Date of birth cannot be empty"
      : "Date of birth is required";
  } else if (dob.length > 10) {
    err.dob = "Invalid date format";
  } else {
    const safeDob = deepClean(dob).trim();
    if (!safeDob)
      err.dob = isUpdate
        ? "Date of birth cannot be empty"
        : "Date of birth is required";
    else DOB(safeDob, err);
  }

  // ✅ phone validation
  if (!phone) {
    err.phone = isUpdate
      ? "Phone number cannot be empty"
      : "Phone number is required";
  } else if (phone.length > 20) {
    err.phone = "Phone number is too long";
  } else {
    const safePhone = deepClean(phone).trim();
    if (!safePhone)
      err.phone = isUpdate
        ? "Phone number cannot be empty"
        : "Phone number is required";
    else if (!validator.isMobilePhone(safePhone, "any"))
      err.phone = "Invalid phone format (include country code e.g. +91)";
  }
};

// ✅ DOB helper
const DOB = (safeDob, err) => {
  const birthDate = new Date(safeDob);
  const today = new Date();

  if (isNaN(birthDate.getTime())) {
    err.dob = "Please enter a valid date (YYYY-MM-DD)";
    return;
  }

  const sixteenthBirthday = new Date(birthDate);
  sixteenthBirthday.setUTCFullYear(birthDate.getUTCFullYear() + 16);

  if (sixteenthBirthday > today) {
    let monthsLeft =
      (sixteenthBirthday.getUTCFullYear() - today.getUTCFullYear()) * 12 +
      (sixteenthBirthday.getUTCMonth() - today.getUTCMonth());
    let daysLeft = sixteenthBirthday.getUTCDate() - today.getUTCDate();
    if (daysLeft < 0) {
      monthsLeft--;
      const daysInPrevMonth = new Date(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        0,
      ).getUTCDate();
      daysLeft += daysInPrevMonth;
    }
    err.dob = `Too young! ${monthsLeft} months and ${daysLeft} days left until you turn 16`;
    return;
  }

  const oldestAllowed = new Date();
  oldestAllowed.setUTCFullYear(oldestAllowed.getUTCFullYear() - 120);
  if (birthDate < oldestAllowed) {
    err.dob = "Age cannot exceed 120 years";
  }
};
