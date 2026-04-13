// ============================================
// api.js
// PURPOSE: All API calls using axios
// ============================================

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true, // sends cookies automatically
});

// ============================================
// AUTH API
// ============================================
const authAPI = {
  login(data)                { return api.post("/user/login", data); },
  register(data)             { return api.post("/user/register", data); },
  signout()                  { return api.post("/user/signout"); },
  forgotPassword(email)      { return api.post("/user/forgot-password", { email }); },
  resetPassword(token, data) { return api.put(`/user/reset-password/${token}`, data); },
  updateProfile(data)        { return api.put("/user", data); },
  verifyOldPassword(data)    { return api.post("/user/password", data); },
  updatePassword(data)       { return api.put("/user/password", data); },
};

// ============================================
// POSTS API
// ============================================
const postsAPI = {
  getAll(page = 1)       { return api.get(`/post?page=${page}`); },
  getOne(pid)            { return api.get(`/post/${pid}`); },
  create(formData)       { return api.post("/post", formData); }, // axios detects FormData automatically
  update(pid, formData)  { return api.put(`/post/${pid}`, formData); },
  delete(pid)            { return api.delete(`/post/${pid}`); },
};

// ============================================
// COMMENTS API
// ============================================
const commentsAPI = {
  create(pid, text) { return api.post(`/post/${pid}/comment`, { text }); },
  delete(pid, cid)  { return api.delete(`/post/${pid}/comment/${cid}`); },
};

// ============================================
// RATINGS API
// ============================================
const ratingsAPI = {
  create(pid, rate) { return api.post(`/post/${pid}/rating`, { rate }); },
  delete(pid, rid)  { return api.delete(`/post/${pid}/rating/${rid}`); },
};
