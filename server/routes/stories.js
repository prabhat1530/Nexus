const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createStory, getFeedStories, markStoryAsViewed, deleteStory } = require('../controllers/storyController');

router.post('/', auth, upload.single('image'), createStory);
router.get('/feed', auth, getFeedStories);
router.post('/:id/view', auth, markStoryAsViewed);
router.delete('/:id', auth, deleteStory);

module.exports = router;
