const mongoose = require('mongoose');
const Post = require('./postModel');
const User = require('./userModel');
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        maxlength: [500, 'Comment length cannot be more then 500 chars'],
        required: [true, ' Comment cannot be empty '],
        trim: true
    },
    owner:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required:true,
    }
}, {
    timestamps: true,
    strict:true
}
);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
/*
Here is a concise, "copy-paste" version for your notes.

### 🏗️ Mongoose Schema: Fields vs. Options

The `mongoose.Schema()` constructor requires **two separate objects** because they play different roles in the "building" process.

* **Object 1: The Blueprint (Definition)**
    * **Purpose:** Defines the data fields (e.g., `name`, `email`).
    * **Logic:** Tells Mongoose *what* data to store.
* **Object 2: The Building Rules (Options)**
    * **Purpose:** Defines how the collection behaves.
    * **Logic:** Tells Mongoose *how* to handle the data automatically.

---

### 💻 The Syntax
```javascript
const userSchema = new mongoose.Schema(
    { 
      // ARGUMENT 1: Fields (The "What")
      name: String,
      email: String 
    }, 
    { 
      // ARGUMENT 2: Options (The "How")
      timestamps: true 
    }
);
```

### 📝 Why `{ timestamps: true }` must be in the second object:
1.  **Avoids Confusion:** If put in the first object, Mongoose tries to find a data type for a field named "timestamps" and fails.
2.  **System Automation:** It triggers a background process that automatically manages `createdAt` and `updatedAt` without you writing extra code.
3.  **Clean Data:** It keeps your "User-provided data" (email/password) separate from "System-generated data" (time of creation).

Does this shorter breakdown help clarify the structure for your Zentrox-App documentation?

Option,What it does,Why use it for Zentrox?

timestamps, Adds createdAt and updatedAt.,To show when a photo was posted.

collection,Manually names the MongoDB collection., "If you don't want Mongoose to pluralize ""User"" to ""users."" "

toJSON,Rules for converting data to a JSON string.,Crucial: To hide passwords when sending user data to the frontend.

toObject,Rules for converting data to a JS object.,"Similar to toJSON, but for internal logic."

strict,Only allows fields defined in your schema.,"To stop ""junk"" data from being saved if someone tries to hack a request."

id,Adds a virtual id getter (string version of _id).,Makes it easier for your Vanilla JS frontend to read the ID.
*/