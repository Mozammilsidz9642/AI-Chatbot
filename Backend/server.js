import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connect (DIRECT)
mongoose.connect("mongodb://mozammilsidz:Mozammilsidz@ac-mot1qry-shard-00-00.jgfycht.mongodb.net:27017,ac-mot1qry-shard-00-01.jgfycht.mongodb.net:27017,ac-mot1qry-shard-00-02.jgfycht.mongodb.net:27017/?ssl=true&replicaSet=atlas-te163w-shard-0&authSource=admin&appName=Cluster0")
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

    // 💾 SAVE CHAT
    await Chat.create({
      userMessage,
      botReply: reply
    });

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
    console.log(error);
    res.json([]);
  }
});

// 🔥 DELETE ALL
app.delete("/delete-all", async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ message: "All chats deleted" });
  } catch (error) {
    console.log(error);
    res.json({ message: "Error deleting chats" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});