const commentModel = require("../models/comment.model");

const createComment = async (req, res, next) => {
  const { postId, content } = req.body;

  if (!postId || !content) {
    return res
      .status(400)
      .json({ message: "Post ID and content are required" });
  }

  const postExists = await commentModel.exists({ postId });

  if (!postExists) {
    return res.status(404).json({ message: "Post not found" });
  }

  try {
    const newComment = await commentModel.create({
      postId,
      content,
      userId: req.user.id,
    });
    res
      .status(201)
      .json({ message: "Comment created successfully", comment: newComment });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

const getCommentsByPostId = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const comments = await commentModel
      .find({ post: postId })
      .populate("userId", "username email role")
      .sort({ createdAt: -1 });
    res.status(200).json({ comments });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

const updateComment = async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const updatedComment = await commentModel.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    res
      .status(200)
      .json({
        message: "Comment updated successfully",
        comment: updatedComment,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update comment", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await commentModel.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner = comment.userId.equals(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }
    await commentModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};
