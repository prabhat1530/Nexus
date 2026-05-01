const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Follow = require('./Follow');
const Conversation = require('./Conversation');
const ConversationParticipant = require('./ConversationParticipant');
const Message = require('./Message');
const MessageRead = require('./MessageRead');
const Notification = require('./Notification');
const Story = require('./Story');
const StoryView = require('./StoryView');

// ===== User <-> Story =====
User.hasMany(Story, { foreignKey: 'user_id', as: 'stories' });
Story.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ===== Story <-> StoryView =====
Story.hasMany(StoryView, { foreignKey: 'story_id', as: 'views' });
StoryView.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });
StoryView.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(StoryView, { foreignKey: 'user_id', as: 'storyViews' });

// ===== User <-> Post =====
User.hasMany(Post, { foreignKey: 'author_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// ===== User <-> Comment =====
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ===== Post <-> Comment =====
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// ===== User <-> Like <-> Post =====
User.belongsToMany(Post, { through: Like, foreignKey: 'user_id', otherKey: 'post_id', as: 'likedPosts' });
Post.belongsToMany(User, { through: Like, foreignKey: 'post_id', otherKey: 'user_id', as: 'likers' });
Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// ===== Follow (self-referencing many-to-many) =====
User.belongsToMany(User, { through: Follow, as: 'followers', foreignKey: 'following_id', otherKey: 'follower_id' });
User.belongsToMany(User, { through: Follow, as: 'following', foreignKey: 'follower_id', otherKey: 'following_id' });

// ===== User <-> Conversation (through Participants) =====
User.belongsToMany(Conversation, { through: ConversationParticipant, foreignKey: 'user_id', otherKey: 'conversation_id', as: 'conversations' });
Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversation_id', otherKey: 'user_id', as: 'participants' });

// ===== Conversation <-> Message =====
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

// ===== User <-> Message =====
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// ===== Message <-> MessageRead =====
Message.hasMany(MessageRead, { foreignKey: 'message_id', as: 'reads' });
MessageRead.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });
MessageRead.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ===== Notification =====
Notification.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Notification.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
User.hasMany(Notification, { foreignKey: 'recipient_id', as: 'notifications' });

module.exports = {
  User,
  Post,
  Comment,
  Like,
  Follow,
  Conversation,
  ConversationParticipant,
  Message,
  MessageRead,
  Notification,
  Story,
  StoryView,
};
