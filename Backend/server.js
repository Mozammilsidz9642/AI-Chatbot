import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// Schema
const chatSchema = new mongoose.Schema({
  userMessage: String,
  botReply: String,
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

const API_KEY = process.env.API_KEY;

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔥 CHAT API
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: userMessage }
        ],
      }),
    });

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content || "No response";

    await Chat.create({ userMessage, botReply: reply });

    res.json({ reply });

  } catch (error) {
    console.log(error);
    res.json({ reply: "Error aa gaya 😢" });
  }
});

// 🔥 HISTORY API
app.get("/history", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }).limit(50);
    res.json(chats);
  } catch (error) {
    res.json([]);
  }
});

// 🔥 DELETE
app.delete("/delete-all", async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ message: "All chats deleted" });
  } catch (error) {
    res.json({ message: "Error deleting chats" });
  }
});

// 🔥 PORT FIX
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});