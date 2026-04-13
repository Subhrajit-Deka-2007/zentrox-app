const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const deepClean = (input) => {
  // ✅ convert non-strings to string instead of returning empty
  if (typeof input !== "string") input = String(input);

  // ✅ implement the DoS length check that was mentioned in comment
  if (input.length > 500) return "";

  let decoded;
  try {
    decoded = decodeURIComponent(input);
  } catch (err) {
    decoded = input;
  }

  // ✅ sanitize with DOMPurify
  return DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

module.exports = deepClean;
