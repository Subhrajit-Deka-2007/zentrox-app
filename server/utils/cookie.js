/*
Now we are trying to send the token inside http-Only cookie

When people talk about sending tokens in "headers," they are usually referring to HTTP-Only Cookies.

How it works: Instead of putting the token in the JSON body, the server sends a header: Set-Cookie: token=abc...; HttpOnly; Secure.

Pros: Much more secure. An HttpOnly cookie cannot be read by JavaScript. This virtually eliminates the risk of XSS stealing your token.

Cons: It introduces a new risk called CSRF (Cross-Site Request Forgery), which requires extra protection (like SameSite: Strict flags). It's also slightly more annoying to set up if your frontend and backend are on different domains.
*/
exports.sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //  fix this line
    maxAge: process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  });
};

exports.clearTokenCookie = (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //  same options
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", //  same options
    expires: new Date(0), //  fixed — past date
  });
};