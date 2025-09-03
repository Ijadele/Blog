const postModel = require("../models/post.model");
const slugify = require("slugify");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs/promises");


const createPost = async (req, res, next) => {
  const { title, content, published = true, ...rest } = req.body;
  const slug = slugify(title, { lower: true, strict: true });

  const exists = await postModel.findOne({ slug });
  if (exists) {
    return res
      .status(409)
      .json({ message: "Post with this title already exists" });
  }
const imagePaths = []

  if(req.files && req.files.length > 0){
    for(const file of req.files){
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "blog_posts",
      });
      imagePaths.push({
        url: result.secure_url,
        alt: file.originalname
      });
      await fs.unlink(file.path);
    }
  }

  // Validate user input
  if (!title || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create new post
    const newPost = await postModel.create({
      title,
      content,
      author: req.user.id,
      published,
      images: imagePaths,
      ...rest,
    });

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Post creation failed", error: error.message });
  }
};

getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q, tag, author, sort = "-createdAt", published } = req.query;
    const p = Math.max(parseInt(page) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const filter = {};
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { content: { $regex: q, $options: "i" } }];
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    if (typeof published !== "undefined") filter.isPublished = published === "true";

    const [data, total] = await Promise.all([
      Post.find(filter).populate("author", "name role").sort(sort).skip((p - 1) * l).limit(l),
      Post.countDocuments(filter),
    ]);

    res.json({ success: true, message: "Posts fetched", data, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
  } catch (e) { next(e); }
};

const getPostById = async (req, res, next) => {
  const { id } = req.query;
  try {
    const post = await postModel.findById(id).populate("author", "email");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  const { id } = req.query;
  const { title, content, published } = req.body;

  try {
    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // check if it is the owner
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this post" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.published = published !== undefined ? published : post.published;

    await post.save();
    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  const { id } = req.query;

  try {
    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // check if it is the owner
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost
};
