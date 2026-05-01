const router = require('express').Router();
const auth = require('../middleware/auth');
const { getNotifications, markAllRead, markOneRead, getUnreadCount } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/read', auth, markAllRead);
router.put('/:id/read', auth, markOneRead);

module.exports = router;
