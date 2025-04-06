import { useState } from "react";

const BlogPosts = ({ onClose }) => {
  // State management
  const [posts, setPosts] = useState([
    {
      _id: "1",
      title: "Cultural Food Exchange! 🍲🌍",
      content: "Just had the most amazing virtual dinner with Raj from India! 🇮🇳 We shared our favorite recipes — I taught him how to make Spanish Paella, and he showed me how to cook traditional Biryani! 🥘 It was so much fun learning about each other's culinary cultures! Can't wait to try more dishes from his region",
      author: {
        _id: "a1",
        name: "Sofia",
        avatar: null
      },
      date: "2025-03-15T12:00:00Z",
      comments: [
        {
          _id: "c1",
          content: "Such a fun experience! The Paella was delicious, and I was thrilled to teach Sofia the secrets of authentic Biryani. 🌶️ The spices really made a difference! Cultural exchanges like these are the best way to connect.",
          author: {
            _id: "u2",
            name: "Raj",
            avatar: null
          },
          date: "2025-03-16T10:30:00Z"
        }
      ],
      likes: 12
    },
    {
      _id: "2",
      title: "Traditional Music and Dance! 💃🎶",
      content: "Had an amazing time chatting with Aiko from Japan 🇯🇵 today! She taught me the basics of traditional Japanese dance 💃, and I showed her a few moves from our country's jazz culture 🎷. It's incredible how different yet similar dance can be across cultures! We even shared a playlist of our favorite traditional songs.",
      author: {
        _id: "a1",
        name: "Olivia Smith",
        avatar: null
      },
      date: "2025-03-20T14:20:00Z",
      comments: [],
      likes: 8
    },
    {
      _id: "3",
      title: "Learning Each Other's Languages! 📚🗣️",
      content: "Today, I had an amazing language exchange session with Mei from China 🇨🇳! I taught her some common phrases in Portuguese, and she helped me with Mandarin 🀄. It was challenging, but so rewarding! 🌟 We also had a lot of laughs trying to pronounce each other's words! 😂",
      author: {
        _id: "a2",
        name: "Robert Chen",
        avatar: null
      },
      date: "2025-03-25T09:15:00Z",
      comments: [
        {
          _id: "c2",
          content: "Learning Portuguese from Carlos was fun and challenging! 😅 I'm excited to practice more with him. And he was such a patient teacher while I was struggling with Mandarin tones! Let's keep this going!",
          author: {
            _id: "u3",
            name: "Sarah Williams",
            avatar: null
          },
          date: "2025-03-25T16:45:00Z"
        },
        {
          _id: "c3",
          content: "These kinds of exchanges remind me how beautiful and diverse languages are — every laugh and every mistake brings us closer together!?",
          author: {
            _id: "u4",
            name: "David Lee",
            avatar: null
          },
          date: "2025-03-26T11:20:00Z"
        }
      ],
      likes: 17
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    currentPostId: null
  });

  // Custom theme colors that match Immerzio's design
  const theme = {
    primary: "#433878",
    secondary: "#7E60BF",
    accent: "#E4B1F0",
    light: "#FFE1FF",
    white: "#FFFFFF",
    darkText: "#333333",
    lightText: "#FFFFFF"
  };

  // Event handlers
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleClosePostDetail = () => {
    setShowPostDetail(false);
    setSelectedPost(null);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    }));
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment = {
      _id: `c${Date.now()}`,
      content: newComment,
      author: {
        _id: "currentUser",
        name: "Current User",
        avatar: null
      },
      date: new Date().toISOString()
    };
    
    setPosts(posts.map(post => {
      if (post._id === selectedPost._id) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));
    
    setSelectedPost({
      ...selectedPost,
      comments: [...selectedPost.comments, comment]
    });
    
    setNewComment("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const { title, content, currentPostId } = formData;
    
    if (!title.trim() || !content.trim()) return;
    
    if (currentPostId) {
      // Update existing post
      setPosts(posts.map(post => {
        if (post._id === currentPostId) {
          return { ...post, title, content };
        }
        return post;
      }));
    } else {
      // Add new post
      const newPost = {
        _id: `post${Date.now()}`,
        title,
        content,
        author: {
          _id: "currentUser",
          name: "Current User",
          avatar: null
        },
        date: new Date().toISOString(),
        comments: [],
        likes: 0
      };
      
      setPosts([newPost, ...posts]);
    }
    
    // Reset form and close it
    setFormData({
      title: "",
      content: "",
      currentPostId: null
    });
    setShowNewPostForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative bg-[#fbf9ff] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header with close button */}
        <div className="bg-[#433878] p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#FFE1FF]">Immerzio Blog</h2>
          <button 
            onClick={onClose}
            className="text-[#FFE1FF] hover:text-white focus:outline-none"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main content area */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* New Post Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7E60BF] text-white rounded-lg hover:bg-[#6A57A5] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              {showNewPostForm ? "Cancel Post" : "Create New Post"}
            </button>
          </div>

          {/* New Post Form (Collapsible) */}
          {showNewPostForm && (
            <div className="bg-[#FFE1FF] p-4 rounded-lg mb-6 border-2 border-[#E4B1F0]">
              <h3 className="text-xl font-semibold text-[#433878] mb-4">
                {formData.currentPostId ? "Edit Post" : "Create New Post"}
              </h3>
              <form onSubmit={handleSubmitPost}>
                <div className="mb-4">
                  <label className="block text-[#433878] font-bold mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-[#E4B1F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7E60BF]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#433878] font-bold mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-[#E4B1F0] rounded-md min-h-32 focus:outline-none focus:ring-2 focus:ring-[#7E60BF]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#7E60BF] text-white rounded-lg hover:bg-[#6A57A5] transition-colors"
                  >
                    {formData.currentPostId ? "Update Post" : "Publish Post"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Grid/List */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => (
                <div 
                  key={post._id}
                  onClick={() => handlePostClick(post)}
                  className="bg-white rounded-lg overflow-hidden border-2 border-[#E4B1F0] shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="bg-[#7E60BF] p-3">
                    <h3 className="text-white font-semibold text-lg">{post.title}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 line-clamp-3">{post.content}</p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#FFE1FF] border-t border-[#E4B1F0]">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#433878] text-white flex items-center justify-center font-bold mr-2">
                        {post.author.name.charAt(0)}
                      </div>
                      <span className="text-sm text-[#433878]">{post.author.name}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        💬 {post.comments.length}
                      </span>
                      <span 
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post._id);
                        }}
                      >
                        ❤️ {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Detail Modal */}
        {showPostDetail && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="bg-[#433878] p-5 relative">
                <button 
                  onClick={handleClosePostDetail}
                  className="absolute left-4 top-4 flex items-center justify-center p-2 bg-[#E4B1F0] hover:bg-[#d9a2e6] text-[#433878] rounded-full transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-white text-center mt-4">{selectedPost.title}</h2>
                <div className="flex items-center justify-center mt-2">
                  <div className="w-8 h-8 rounded-full bg-[#E4B1F0] text-[#433878] flex items-center justify-center font-bold mr-2">
                    {selectedPost.author.name.charAt(0)}
                  </div>
                  <span className="text-[#FFE1FF]">
                    {selectedPost.author.name} • {new Date(selectedPost.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedPost.content}
                </p>

                <div className="flex justify-between items-center border-t border-b border-gray-200 py-4 mb-6">
                  <button
                    onClick={() => handleLike(selectedPost._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E4B1F0] text-[#433878] rounded-lg hover:bg-[#d9a2e6] transition-colors"
                  >
                    ❤️ Like ({selectedPost.likes})
                  </button>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="mb-4">
                    <label className="block text-[#433878] font-bold mb-2">
                      Add a comment
                    </label>
                    <textarea
                      value={newComment}
                      onChange={handleCommentChange}
                      required
                      className="w-full p-2 border border-[#E4B1F0] rounded-md min-h-20 focus:outline-none focus:ring-2 focus:ring-[#7E60BF]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#7E60BF] text-white rounded-lg hover:bg-[#6A57A5] transition-colors"
                    >
                      Submit Comment
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div>
                  <h3 className="text-xl font-semibold text-[#433878] mb-4 pb-2 border-b-2 border-[#E4B1F0]">
                    Comments ({selectedPost.comments.length})
                  </h3>
                  
                  {selectedPost.comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedPost.comments.map(comment => (
                        <div key={comment._id} className="border-b border-gray-100 pb-4">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-[#7E60BF] text-white flex items-center justify-center font-bold mr-2">
                              {comment.author.name.charAt(0)}
                            </div>
                            <div>
                              <strong className="text-[#433878]">{comment.author.name}</strong>
                              <span className="text-gray-500 text-sm ml-2">
                                {new Date(comment.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 pl-10">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPosts;