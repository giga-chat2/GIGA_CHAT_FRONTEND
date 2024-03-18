import express, { Request, Response } from 'express';
import connect from './db';
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import { User, SelectedUsers, Group ,AiChat } from './model';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs-extra';
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import Replicate from "replicate";

const app = express();
const port = 4000;
app.use(express.json())
app.use(cors())

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello, TypeScript!');
});

const { NEXT_NODE_MAILER_SECRET }: { NEXT_NODE_MAILER_SECRET?: string | undefined } = process.env as { NEXT_NODE_MAILER_SECRET?: string | undefined };

app.post('/register', async (req: Request, res: Response) => {
  let verificationCode: string = '';

  const { email, password, enteredVerificationCode, hashedVerificationCode } = req.body;
  if (enteredVerificationCode === null || enteredVerificationCode === undefined) {

    await connect()

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    const generateVerificationCode = () => {
      return Math.floor(1000 + Math.random() * 9000).toString();
    };
    verificationCode = generateVerificationCode();
    const mailOptions = {
      from: 'aditya.as@somaiya.edu',
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    };
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aditya.as@somaiya.edu',
        pass: NEXT_NODE_MAILER_SECRET,
      },
    });
    try {
      const hasedCode = await bcrypt.hash(verificationCode, 5);
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ verificationCode: hasedCode, message: "Verfiication Code has been sent" });
    }
    catch (error) {
      console.error('Error sending email:', error);
    }
  } else {
    const isMatch = await bcrypt.compare(enteredVerificationCode, hashedVerificationCode);
    if (isMatch) {
      return res.status(200).json({ message: "Valid Code" })
    } else {
      return res.status(400).json({ message: "Invalid verification code" });
    }
  }

})

app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  await connect();
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }
  if (user?.provider === "email") {
    const isMatch = await bcrypt.compare(password ?? '', user?.password ?? '');
    if (isMatch) {
      return res.status(200).json({ message: "User has been logged in" });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } else {
    return res.status(201).json({ message: "User has been logged in" });
  }
})

app.post('/enterDetails', async (req: Request, res: Response) => {
  try {
    // console.log(req.body, "req.body")

    const { name, username, phone, email, password, provider } = req.body;
    await connect()

    const hashedPassword = await bcrypt.hash(password, 5);
    const user = new User({ email, password: hashedPassword, name, username, phoneno: phone, provider })
    await user.save();

    return res.status(200).json({ message: "User has been registered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/getUsernames', async (req: Request, res: Response) => {
  // console.log("received")
  try {
    await connect()
    const usernames = await User.find({});
    const currentUser = usernames.filter((user) => user.email === req.body.email);
    const selectedUsers = await SelectedUsers.find({ username: currentUser[0]?.username });
    const filteredSelectedUsers = selectedUsers[0]?.selectedUsers.filter(user => !user.isArchived);
    return res.status(200).json({ usernames: usernames, selectedUsers: filteredSelectedUsers, currentUser: currentUser[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/addUserInSelectedUsers', async (req: Request, res: Response) => {
  try {
    const { email, selectedUser, roomId } = req.body;
    await connect();
    const user = await User.findOne({ email });
    console.log("aaya")

    let selectedUserDoc = await SelectedUsers.findOne({ username: user?.username || '' });
    let selectedRecipientDoc = await SelectedUsers.findOne({ username: selectedUser?.username || '' });

    if (!selectedUserDoc) {
      console.log(-1)
      selectedUserDoc = new SelectedUsers({ username: user?.username, selectedUsers: [] });
    } else if (selectedUserDoc) {
      if (selectedUserDoc?.selectedUsers?.some(userObj => userObj.username === selectedUser.username)) {
        console.log(0)
        const existingUserRecord = selectedUserDoc?.selectedUsers.find(user => user.username === selectedUser.username);
        return res.status(400).json({
          message: 'Selected user is already present in the list.',
          existingUserRecord: existingUserRecord,
        });
      } else {
        console.log(1, 2)
        const userWithRoomId = { ...selectedUser, isArchived: false, roomId: roomId };
        selectedUserDoc.selectedUsers.push(userWithRoomId);
        await selectedUserDoc.save();
      }
    }

    if (!selectedRecipientDoc) {
      console.log(1)
      selectedRecipientDoc = new SelectedUsers({ username: selectedUser?.username, selectedUsers: [] });
    } else if (selectedRecipientDoc) {
      console.log(2)
      let existingUserRecord = selectedRecipientDoc?.selectedUsers.find(user => user.username === user?.username);
      console.log(existingUserRecord, "existingUserRecord")
      if (existingUserRecord) {
        existingUserRecord.roomId = roomId;
        console.log(3, selectedRecipientDoc, existingUserRecord, roomId, "selectedRecipientDoc")
        await selectedRecipientDoc.save();
        return res.status(200).json({ message: 'User added to the selected users list successfully.' });
      }
      else {
        console.log(4)
        const userWithRoomId = { ...user?.toObject(), isArchived: false, roomId: roomId };
        selectedRecipientDoc.selectedUsers.push(userWithRoomId);
        await selectedRecipientDoc.save();
        return res.status(200).json({ message: 'User added to the selected users list successfully.' });

      }
    }
  }
  catch (error) {
    console.error('Error adding user to selected users list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})


app.post("/addChat", async (req: Request, res: Response) => {
  try {
    const { message, room_Id, email, selectedUserName } = req.body;

    const currentUserEmail = await User.findOne({ email: email });
    const currentUser = await SelectedUsers.findOne({ username: currentUserEmail?.username });
    const receipentUser = await SelectedUsers.findOne({ username: selectedUserName });
    if (!currentUser || !receipentUser) {
      return res.status(404).json({ error: 'User not found' });
    }


    let currentUserSelectedUser
    let receipentUserSelectedUser
    if (currentUser.selectedUsers) {
      currentUserSelectedUser = currentUser?.selectedUsers.find(user => user.roomId == room_Id);
    }
    if (receipentUser.selectedUsers) {
      receipentUserSelectedUser = receipentUser?.selectedUsers.find(user => user.roomId == room_Id)
    }

    if (!currentUserSelectedUser || !receipentUserSelectedUser) {
      return res.status(404).json({ error: 'SelectedUser not found for the specified roomId' })
    }

    const chatObject = { message, isSender: true };
    const receipentChatObject = { message, isSender: false };

    currentUserSelectedUser.chats.unshift(chatObject);
    receipentUserSelectedUser.chats.unshift(receipentChatObject);
    // console.log(currentUserSelectedUser, receipentUserSelectedUser, "currentUserSelectedUser, receipentUserSelectedUser")

    await currentUser.save();
    await receipentUser.save();

    res.status(200).json({ message: 'Chat added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post("/getChats", async (req: Request, res: Response) => {
  try {
    const { currentUser, selectedUser } = req.body;
    const user = await SelectedUsers.findOne({ username: currentUser });
    const chats = user?.selectedUsers.find(user => user.username === selectedUser);
    return res.status(200).json({ chats: chats?.chats, roomId: chats?.roomId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/getprofilePic/:imagePath', async (req, res) => {
  const { imagePath } = req.params;
  const fullPath = path.join(__dirname, '..', 'public', 'images', 'profilePics', imagePath);
  res.download(fullPath);
});


const upload = multer({ dest: 'public/images/profilePics' });

app.post('/uploadProfilePic', upload.single('profilePic'), async (req: Request, res: Response) => {
  try {
    await connect();
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.file) {
      const uniqueFileName = `${Date.now()}_${req.file.originalname}`;
      const filePath = path.join('public', 'images', 'profilePics', uniqueFileName);
      user.profilePic = uniqueFileName;
      await user.save();
      await fs.promises.rename(req.file.path, filePath);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/getInitlaData", async (req: Request, res: Response) => {
  try {
    await connect()
    const { email } = req.body;
    const user = await User.findOne({ email });
    const selectedUsers = await SelectedUsers.findOne({ username: user?.username });
    const groups = await Group.find({});
    const selectedGroups = await Group.find({
      members: {
        $elemMatch: { username: user?.username }
      }
    });
    return res.status(200).json({ groups: groups, selectedUsers: selectedUsers?.selectedUsers, selectedGroups: selectedGroups, currentUser: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post("/createGroup", async (req: Request, res: Response) => {
  try {
    await connect();
    const { groupName, room_Id, currentUser, selectedGroupMembers, admins } = req.body;
    const updatedAdmins = [currentUser, ...admins];
    const updateMembers = [currentUser, ...selectedGroupMembers];
    const group = new Group({ groupName: groupName, roomId: room_Id, admins: updatedAdmins, members: updateMembers, messages: [] })
    await group.save();
    // const selectedGroups = await Group.find({
    //   members: {
    //     $elemMatch: { username: currentUser?.username }
    //   }
    // });
    const currentGroup = await Group.findOne({ roomId: room_Id });
    // console.log(currentGroup, "currentGroup")
    return res.status(200).json({ message: "Group created successfully", currentGroup: currentGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post("/addChatInGroup", async (req: Request, res: Response) => {
  try {
    await connect();
    const { message, profilePic, room_Id, currentUser } = req.body;
    const group = await Group.findOne({ roomId: room_Id });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const chat = { message: message, profilePic: profilePic, sender: currentUser.username };
    group.messages.unshift(chat);
    await group.save();
    return res.status(200).json({ message: "Chat added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


app.post("/archiveUser", async (req: Request, res: Response) => {
  try {
    await connect();
    const { username, selectedUser } = req.body;
    console.log(req.body)
    const user = await SelectedUsers.findOne({ username: username });
    const archivedUser = user?.selectedUsers.find(user => user.username === selectedUser);
    if (!archivedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    archivedUser.isArchived = true;
    await user?.save();

    return res.status(200).json({ message: "User archived successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/deleteUser", async (req: Request, res: Response) => {
  try {
    await connect();
    const { username, selectedUser } = req.body;
    const user = await SelectedUsers.findOne({ username });
    const deletedUser = user?.selectedUsers.find(user => user.username === selectedUser);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    user?.selectedUsers.pull(deletedUser);
    await user?.save();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post("/unArchiveUser", async (req: Request, res: Response) => {
  try {
    await connect();
    const { username, selectedUser } = req.body;
    const user = await SelectedUsers.findOne({ username: username });
    const archivedUser = user?.selectedUsers.find(user => user.username === selectedUser);
    if (!archivedUser) {
      return res.status(404).json({ error: "User not found" })
    }
    archivedUser.isArchived = false;
    await user?.save();
    return res.status(200).json({ message: "User archived successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/getArchivedUsers", async (req: Request, res: Response) => {
  try {
    await connect();
    const { username } = req.body;
    const user = await SelectedUsers.findOne({ username });
    const archivedUsers = user?.selectedUsers.filter(user => user.isArchived);
    // console.log(archivedUsers, "archivedUsers")
    return res.status(200).json({ archivedUsers: archivedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


app.post("/modelResponse", async (req: Request, res: Response) => {
  const { model, message } = req.body;
  console.log(model, message, "model, message")
  if (model === "antropic") {
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_CLAUDE_API_KEY,
    });
    const msg = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 10,
      messages: [{ role: "user", content: message }],
    });
    return res.status(200).json({ message: msg });
  } else if (model === "openai") {
    const openai = new OpenAI({ apiKey: process.env.NEXT_OPEN_AI_KEY1 });
    const gptResponse = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: message,
      max_tokens: 10,
      temperature: 0,
    });
    return res.status(200).json({ message: gptResponse.choices[0].text });
  } else if (model === "google") {
    const response = await axios.post("https://api-inference.huggingface.co/models/google/gemma-7b", { inputs: message }, { headers: { Authorization: process.env.NEXT_HUGGING_FACE_KEY } });
    const result = await response.data;
    const generatedText = result[0].generated_text;
    // console.log(generatedText)
    // const questionIndex = generatedText.indexOf(message);
    // console.log(questionIndex, "questionIndex")
    // const extractedText = generatedText.slice(questionIndex + message.length).trim();
    // console.log(extractedText, "result");
    return res.status(200).json({ message: generatedText });
  } else if (model === "meta") {
    console.log(1)
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    const input = {
      debug: false,
      top_k: -1,
      top_p: 1,
      prompt: message,
      temperature: 0.75,
      system_prompt: "You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please share false information.",
      max_new_tokens: 80,
      min_new_tokens: -1,
      repetition_penalty: 1
    };
    console.log(2)
    let result = "";
    for await (const event of replicate.stream("meta/llama-2-7b-chat", { input })) {
      result += event.toString();
    };
    console.log(3)
    return res.status(200).json({ message: result });
  }else if (model === "mistral") {
    const response = await axios.post("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", { inputs: message }, { headers: { Authorization: process.env.NEXT_HUGGING_FACE_KEY} });
    const result = await response.data;
    const generatedText = result[0].generated_text;
    const questionIndex = generatedText.indexOf(message);
    const extractedText = generatedText.slice(questionIndex + message.length).trim();
    console.log(extractedText, "result");
    return res.status(200).json({ message: extractedText });
  }
})

app.post("/addAIChat", async (req: Request, res: Response) => {
  try {
    const {message, currentUsername, model, startingTime,session,endingTime,isSender } = req.body;
    await connect();

    const aiChat = await AiChat.findOne({ currentUsername ,session});

    if (aiChat) {
      aiChat.messages.push({ model, isSender: isSender, message });
      aiChat.endingTime = endingTime || aiChat.endingTime;
      aiChat.date = new Date() || aiChat.date ;
      await aiChat.save();
      res.status(200).json(aiChat);
    } else {
      const newAiChat = new AiChat({
        messages: [{ model, isSender: isSender, message }],
        currentUsername,
        startingTime,
        endingTime,
        session,
        date: new Date()
      });

      await newAiChat.save();
      res.status(200).json(newAiChat);
    }
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/getAIChats", async (req: Request, res: Response) => {
  try{
    await connect();
    const { currentUsername } = req.body;
    const aiChat = await AiChat.find({ currentUsername });
    res.status(200).json(aiChat);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
