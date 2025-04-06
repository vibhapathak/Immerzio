// controllers/CommentController.js
import Comment from "../models/CommentModel.js";
import Post from "../models/PostModel.js";

// Get comments for a post
export const getPostComments = async (request, response) => {
  try {
    const { postId } = request.params;
    
    // Verify post exists
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return response.status(404).json({ error: "Post not found" });
    }
    
    // Get top-level comments (parentComment is null)
    const comments = await Comment.find({ 
      post: postId,
      parentComment: null
    })
    .populate("author", "username profilePicture")
    .sort({ createdAt: -1 });
    
    // For each comment, get its replies
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({
        parentComment: comment._id
      })
      .populate("author", "username profilePicture")
      .sort({ createdAt: 1 });
      
      const commentObj = comment.toObject();
      commentObj.replies = replies;
      return commentObj;
    }));
    
    return response.status(200).json({ comments: commentsWithReplies });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Create a comment
export const createComment = async (request, response) => {
  try {
    const { postId } = request.params;
    const { content, parentCommentId } = request.body;
    const authorId = request.userId;
    
    if (!content) {
      return response.status(400).json({ error: "Comment content is required" });
    }
    
    // Verify post exists
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return response.status(404).json({ error: "Post not found" });
    }
    
    // If it's a reply, verify parent comment exists
    if (parentCommentId) {
      const parentCommentExists = await Comment.exists({ _id: parentCommentId, post: postId });
      if (!parentCommentExists) {
        return response.status(404).json({ error: "Parent comment not found" });
      }
    }
    
    const newComment = new Comment({
      post: postId,
      author: authorId,
      content,
      parentComment: parentCommentId || null
    });
    
    await newComment.save();
    
    // Populate author details
    await newComment.populate("author", "username profilePicture");
    
    return response.status(201).json({ comment: newComment });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Update a comment
export const updateComment = async (request, response) => {
  try {
    const { commentId } = request.params;
    const { content } = request.body;
    const userId = request.userId;
    
    if (!content) {
      return response.status(400).json({ error: "Comment content is required" });
    }
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return response.status(404).json({ error: "Comment not found" });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return response.status(403).json({ error: "Unauthorized: You can only edit your own comments" });
    }
    
    comment.content = content;
    await comment.save();
    
    await comment.populate("author", "username profilePicture");
    
    return response.status(200).json({ comment });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Delete a comment
export const deleteComment = async (request, response) => {
  try {
    const { commentId } = request.params;
    const userId = request.userId;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return response.status(404).json({ error: "Comment not found" });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return response.status(403).json({ error: "Unauthorized: You can only delete your own comments" });
    }
    
    // Delete this comment and all replies
    await Comment.deleteMany({ 
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });
    
    return response.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Like/unlike a comment
export const toggleLikeComment = async (request, response) => {
  try {
    const { commentId } = request.params;
    const userId = request.userId;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return response.status(404).json({ error: "Comment not found" });
    }
    
    // Check if user already liked the comment
    const likeIndex = comment.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Like the comment
      comment.likes.push(userId);
    } else {
      // Unlike the comment
      comment.likes.splice(likeIndex, 1);
    }
    
    await comment.save();
    
    return response.status(200).json({ 
      liked: likeIndex === -1,
      likesCount: comment.likes.length
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};