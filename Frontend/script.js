const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

const API_URL = "https://ai-chatbot-1omu.onrender.com/chat";
const HISTORY_API = "https://ai-chatbot-1omu.onrender.com/history";

// 🤖 ROBOT SVG
const BOT_AVATAR = `
<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 1024 1024">
<path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
</svg>`;

// create message
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};
 
//  LOAD HISTORY
const loadChatHistory = async () => {
  try {
    const res = await fetch(HISTORY_API);
    const data = await res.json();

    chatBody.innerHTML = `
      <div class="message bot-message">
        ${BOT_AVATAR}
        <div class="message-text">
          Hey there 👋 <br> How can I help you today?
        </div>
      </div>
    `;

    data.reverse().forEach(chat => {
      chatBody.appendChild(
        createMessageElement(`<div class="message-text">${chat.userMessage}</div>`, "user-message")
      );

      chatBody.appendChild(
        createMessageElement(`${BOT_AVATAR}<div class="message-text">${chat.botReply}</div>`, "bot-message")
      );
    });

    chatBody.scrollTop = chatBody.scrollHeight;

  } catch (err) {
    console.log(err);
  }
};

//  BOT RESPONSE
const generateBotResponse = async (incomingDiv, message) => {
  const msgEl = incomingDiv.querySelector(".message-text");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    msgEl.innerText = data.reply;

  } catch {
    msgEl.innerText = "Error 😢";
  } finally {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
};

//  SEND MESSAGE
const handleOutgoingMessage = (e) => {
  e.preventDefault();

  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  messageInput.value = "";

  // user message
  chatBody.appendChild(
    createMessageElement(`<div class="message-text">${userMessage}</div>`, "user-message")
  );

  // bot thinking
  const incoming = createMessageElement(
    `${BOT_AVATAR}<div class="message-text">Typing...</div>`,
    "bot-message"
  );

  chatBody.appendChild(incoming);

  generateBotResponse(incoming, userMessage);
};

//  NEW CHAT
const startNewChat = () => {
  chatBody.innerHTML = `
    <div class="message bot-message">
      ${BOT_AVATAR}
      <div class="message-text">
        Hey there 👋 <br> How can I help you today?
      </div>
    </div>
  `;
};

//  DELETE ALL
const deleteAllChats = async () => {
  await fetch("http://localhost:3000/delete-all", {
    method: "DELETE"
  });

  startNewChat();
};

// EVENTS
sendMessage.addEventListener("click", handleOutgoingMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    handleOutgoingMessage(e);
  }
});

// toggle open/close
chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});

// buttons
document.getElementById("new-chat-btn").addEventListener("click", startNewChat);
document.getElementById("delete-chat-btn").addEventListener("click", deleteAllChats);

// load history
window.addEventListener("load", loadChatHistory);