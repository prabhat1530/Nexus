const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createPost, getFeed, getExplore, getPost, getUserPosts, updatePost, deletePost, toggleLike, addComment, deleteComment, createPostValidation, commentValidation } = require('../controllers/postController');

router.post('/', auth, upload.single('image'), createPostValidation, validate, createPost);
router.get('/feed', auth, getFeed);
router.get('/explore', auth, getExplore);
router.get('/user/:userId', auth, getUserPosts);
router.get('/:id', auth, getPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, commentValidation, validate, addComment);
router.delete('/:postId/comment/:commentId', auth, deleteComment);

module.exports = router;
