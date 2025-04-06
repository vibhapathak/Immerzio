// controllers/PostController.js
import Post from "../models/PostModel.js";

// Get all posts
export const getAllPosts = async (request, response) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });
    
    return response.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Get a single post
export const getPostById = async (request, response) => {
  try {
    const { postId } = request.params;
    
    const post = await Post.findById(postId)
      .populate("author", "username profilePicture");
    
    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }
    
    return response.status(200).json({ post });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Create a new post
export const createPost = async (request, response) => {
  try {
    const { title, content, imageUrl, tags } = request.body;
    const authorId = request.userId;
    
    if (!title || !content) {
      return response.status(400).json({ error: "Title and content are required" });
    }
    
    const newPost = new Post({
      author: authorId,
      title,
      content,
      imageUrl,
      tags: tags || []
    });
    
    await newPost.save();
    
    // Populate author details
    await newPost.populate("author", "username profilePicture");
    
    return response.status(201).json({ post: newPost });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Update a post
export const updatePost = async (request, response) => {
  try {
    const { postId } = request.params;
    const { title, content, imageUrl, tags } = request.body;
    const userId = request.userId;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }
    
    // Check if user is the author
    if (post.author.toString() !== userId) {
      return response.status(403).json({ error: "Unauthorized: You can only edit your own posts" });
    }
    
    // Update fields if provided
    if (title) post.title = title;
    if (content) post.content = content;
    if (imageUrl) post.imageUrl = imageUrl;
    if (tags) post.tags = tags;
    
    post.updatedAt = Date.now();
    
    await post.save();
    await post.populate("author", "username profilePicture");
    
    return response.status(200).json({ post });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Delete a post
export const deletePost = async (request, response) => {
  try {
    const { postId } = request.params;
    const userId = request.userId;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }
    
    // Check if user is the author
    if (post.author.toString() !== userId) {
      return response.status(403).json({ error: "Unauthorized: You can only delete your own posts" });
    }
    
    await Post.findByIdAndDelete(postId);
    
    return response.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Like/unlike a post
export const toggleLikePost = async (request, response) => {
  try {
    const { postId } = request.params;
    const userId = request.userId;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }
    
    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    
    return response.status(200).json({ 
      liked: likeIndex === -1,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  }
};