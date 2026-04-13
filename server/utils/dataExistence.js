// returns true if data exists and has fields
//  returns false if data is empty, null, undefined
const dataExistence = (data) => {
  if (!data) return false;
  if (typeof data !== "object" || Array.isArray(data)) return false;
  if (Object.keys(data).length === 0) return false;
  return true;
};

module.exports = { dataExistence };
