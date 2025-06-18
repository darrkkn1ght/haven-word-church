const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  searchBlogs,
  getFeaturedBlogs,
  getBlogsByCategory,
  addComment,
  toggleLike,
  getMyBlogs,
  moderateBlog
} = require('../controllers/blogController');
// const { protect, authorize } = require('../middleware/auth');

/**
 * Blog Routes for Haven Word Church
 * Handles all blog-related endpoints with proper authentication and authorization
 */

// Public routes
router.get('/', getAllBlogs);                    // GET /api/blogs - Get all published blogs
router.get('/search', searchBlogs);              // GET /api/blogs/search - Search blogs
router.get('/featured', getFeaturedBlogs);       // GET /api/blogs/featured - Get featured blogs
router.get('/category/:category', getBlogsByCategory); // GET /api/blogs/category/:category - Get blogs by category
router.get('/:slug', getBlogBySlug);             // GET /api/blogs/:slug - Get single blog by slug

// Member routes
router.post('/', createBlog);                    // POST /api/blogs - Create new blog post
router.get('/user/my-blogs', getMyBlogs);        // GET /api/blogs/user/my-blogs - Get user's own blogs
router.put('/:id', updateBlog);                  // PUT /api/blogs/:id - Update blog post
router.delete('/:id', deleteBlog);               // DELETE /api/blogs/:id - Delete blog post
router.post('/:id/comments', addComment);        // POST /api/blogs/:id/comments - Add comment to blog
router.post('/:id/like', toggleLike);            // POST /api/blogs/:id/like - Toggle like on blog

// Admin/Pastor only routes
router.patch('/:id/moderate', 
  moderateBlog
); // PATCH /api/blogs/:id/moderate - Moderate blog post

module.exports = router;