const validator = require("validator");
const { dataExistence } = require("./dataExistence");
const deepClean = require("./sanitizer");

exports.validateCreatePost = (data) => {
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };

  const err = {};
  commonCode(data, err, false);
  return { err, isValid: Object.keys(err).length === 0 };
};

exports.validateUpdatePost = (data) => {
  if (!dataExistence(data))
    return { isValid: false, err: { form: "All fields are empty!" } };

  const err = {};
  commonCode(data, err, true);
  return { err, isValid: Object.keys(err).length === 0 };
};

const commonCode = (data, err, isUpdate) => {
  const { title, description } = data;

  if (!title) {
    err.title = isUpdate ? "Please enter a new title" : "Title is required";
  } else if (title.length > 100) {
    err.title = "Title cannot be more than 100 characters";
  } else {
    const safeTitle = deepClean(title).trim();
    if (!safeTitle)
      err.title = isUpdate
        ? "You forgot to enter a new title"
        : "Title is required";
    else if (!validator.isLength(safeTitle, { min: 2 }))
      err.title = "Title must be at least 2 characters";
  }

  if (!description) {
    err.description = isUpdate
      ? "Please enter a new description"
      : "Description is required";
  } else if (description.length > 500) {
    err.description = "Description cannot be more than 500 characters";
  } else {
    const safeDescription = deepClean(description).trim();
    if (!safeDescription)
      err.description = isUpdate
        ? "You forgot to enter a new description"
        : "Description is required";
    else if (!validator.isLength(safeDescription, { min: 4 }))
      err.description = "Description must be at least 4 characters";
  }
};
