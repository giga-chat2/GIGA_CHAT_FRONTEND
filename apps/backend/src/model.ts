import e from "express";
import mongoose from "mongoose";
import { send } from "process";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: false
    },
    username: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    phoneno: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      required: false
    },
    profilePic: {
      type: String,
      required: false
    },
  },
  { timestamps: true }
);

const selectedUsersSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  selectedUsers: [
    {
      name: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      phoneno: {
        type: String,
        required: true
      },
      provider: {
        type: String,
        required: true
      },
      roomId: {
        type: String,
        required: false
      },
      profilePic: {
        type: String,
        required: false
      },
      createdAt: {
        type: Date,
        required: false
      },
      isArchived: {
        type: Boolean,
        required: false
      },
      chats: [
        {
          message: {
            type: String,
            required: true
          },
          isSender: {
            type: Boolean,
            required: true
          }
        }
      ]
    }
  ]
});

const GroupSchema = new Schema({
  groupName: {
    type: String,
    required: true
  },
  profilePic:{
    type:String,
    required:false
  },
  roomId: {
    type: String,
    required: true
  },
  admins: [
    {
      username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    }
  ],
  members: [
    {
      username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    }
  ],
  messages: [
    {
      message: {
        type: String,
        required: true
      },
      sender: {
        type: String,
        required: true

      },
      profilePic: {
        type: String,
        required: false
      }
    }
  ]
})


const ArchiveUsersSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  archievedUsers: [
    {
      name: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      phoneno: {
        type: String,
        required: true
      },
      provider: {
        type: String,
        required: true
      },
      roomId: {
        type: String,
        required: true
      },
      chats: [
        {
          message: {
            type: String,
            required: true
          },
          isSender: {
            type: Boolean,
            required: true
          }
        }
      ]
    }
  ]
});

const AiChatSchema = new Schema({
  messages: [
    {
      model: {
        type: String,
        required: false
      },
      isSender: {
        type: Boolean,
        required: true
      },
      message: {
        type: String,
        required: true
      }
    }
  ],
  session:{
    type: String,
    required: false
  },
  currentUsername: {
    type: String,
    required: true
  },
  startingTime: {
    type: String,
    required: false
  },
  endingTime: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: false
  }
})

export const AiChat = mongoose.model("AiChat", AiChatSchema, "aiChats");

export const Group = mongoose.model("Group", GroupSchema, "groups");

export const SelectedUsers = mongoose.model("SelectedUsers", selectedUsersSchema, "selectedUsers");

export const User = mongoose.model("User", userSchema, 'user_credentials')

export const ArchiveUsers = mongoose.model("ArchiveUsers", ArchiveUsersSchema, "archivedUsers");

// export default mongoose.models.User || mongoose.model("User", userSchema);