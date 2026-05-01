const router = require('express').Router();
const auth = require('../middleware/auth');
const { getConversations, createOrGetConversation, getMessages, sendMessage, markMessagesRead } = require('../controllers/messageController');

router.get('/conversations', auth, getConversations);
router.post('/conversations', auth, createOrGetConversation);
router.get('/:conversationId', auth, getMessages);
router.post('/:conversationId', auth, sendMessage);
router.put('/:conversationId/read', auth, markMessagesRead);

module.exports = router;
