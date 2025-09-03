const express = require("express");
const {createPost, getPosts, getPostById, updatePost, deletePost} = require("../controllers/post.controller");
const upload = require("../utils/multer");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/post", authMiddleware, upload.array("images", 5), createPost);
router.get("/post", authMiddleware, getPosts);
router.get("/post/:id", authMiddleware, getPostById);
router.put("/post/:id", authMiddleware, authorizeRole("admin"), updatePost);
router.delete("/post/:id", authMiddleware, authorizeRole("admin"), deletePost);

module.exports = router;
