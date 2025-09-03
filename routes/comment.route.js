const express = require("express");
const {createComment, getCommentsByPostId, updateComment, deleteComment} = require("../controllers/comment.controller");

const router = express.Router();

router.post("/comments", createComment);
router.get("/comments/:postId", getCommentsByPostId);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

module.exports = router;
