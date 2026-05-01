const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getMe, getUserById, searchUsers, updateProfile, toggleFollow, getFollowers, getFollowing, getSuggestions } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.get('/search', auth, searchUsers);
router.get('/suggestions', auth, getSuggestions);
router.get('/:id', auth, getUserById);
router.put('/profile', auth, upload.single('avatar'), updateProfile);
router.put('/follow/:id', auth, toggleFollow);
router.get('/:id/followers', auth, getFollowers);
router.get('/:id/following', auth, getFollowing);

module.exports = router;
