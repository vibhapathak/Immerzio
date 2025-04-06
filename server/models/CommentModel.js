// models/CommentModel.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comments",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Comment = mongoose.model("Comments", commentSchema);
export default Comment;