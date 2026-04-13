const deepClean = require("./sanitizer.js");
const { dataExistence } = require("./dataExistence");

exports.createComment = (data) => {
  // ✅ use return value of dataExistence
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };

  const err = {};
  commonCode(data, err, false);
  return {
    err,
    isValid: Object.keys(err).length === 0,
  };
};

exports.updateComment = (data) => {
  // ✅ use return value of dataExistence
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };

  const err = {};
  commonCode(data, err, true);
  return {
    err,
    isValid: Object.keys(err).length === 0,
  };
};

const commonCode = (data, err, isUpdate) => {
  const { text } = data;

  // ✅ check if text exists first
  if (!text) {
    err.text = isUpdate
      ? "Please provide new comment text"
      : "Comment text is required";
  } else if (text.length > 500) {
    // ✅ check length before cleaning
    err.text = "Text cannot be more than 500 characters";
  } else {
    const safeText = deepClean(text).trim();
    if (!safeText)
      err.text = isUpdate
        ? "You forgot to fill the new comment"
        : "You cannot create an empty comment";
  }
};
