const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String, trim: true }],
    slug: { type: String, unique: true, required: true },
    published: { type: Boolean, default: false },
    images: [{
        url: { type: String, required: true },  // image URL (from Cloudinary, S3, etc.)
        alt: { type: String, trim: true },      // optional alt text (SEO + accessibility)
      }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;