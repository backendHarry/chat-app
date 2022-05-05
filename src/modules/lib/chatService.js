const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { logger } = require("../utils/logger");

const createChat = async (chatOwner, chatUser) => {
  const chat = await Chat.findOne({
    users: { $all: [chatOwner, chatUser] },
  });

  if (chat === null) {
    const chatOptions = {
      users: [chatOwner, chatUser],
      chatOwner,
    };
    const createChat = await Chat.create(chatOptions);
    return createChat;
  } else {
    return chat;
  }
};

const singleChat = async (chatID) => {
  const rawChat = await Chat.findById(chatID);
  return rawChat;
};

// const allChat = async (userID) => {
//   // const rawChat = await Chat.find(
//   //   { "users.username": "harrison" },
//   //   {
//   //     _id: 1,
//   //     chatOwner: 1,
//   //     messages: 1,
//   //     users: { $elemMatch: { username: "harrison" } }, //The importance of elemMatch, it searches deep in the array. and note: If called as a seconf option, it will be to return svalues of that field only
//   //   }
//   // ).populate("users");
//   // suppose to be for the logged in user. Rewrite query to match just the logged in user and also return one of the user obj
//   // const rawChat = await Chat.find({}).populate("users", "-password");

//   return rawChat;
// };

const allChat = async (userID) => {
  const rawChat = await Chat.find({
    $or: [{ chatOwner: userID }, { status: true, users: { $in: [userID] } }],
  })
    .populate({
      path: "users",
      match: { _id: { $ne: userID } },
      select: "-password",
    })
    .populate({
      path: "latestMessage",
    });
  return rawChat;
};

const message = async (userID, chatID, text) => {
  try {
    const option = {
      chat: chatID,
      sender: userID,
      text: text,
    };
    const message = await Message.create(option, { _id: 0, id: "$_id" });
    return message;
  } catch (err) {
    logger(err);
  }
};

module.exports = {
  createChat,
  singleChat,
  allChat,
  message,
};
