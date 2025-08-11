import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../assets/Robot says hello.json";

import "./AIStudyAssistantPage.css";

const tools = {
  summarizer: {
    name: "Summarizer",
    systemPrompt: "You are an AI that summarizes study notes in 5 clear bullet points.",
  },
  flashcards: {
    name: "Flashcards",
    systemPrompt: "You are an AI that creates useful flashcards from study material.",
  },
  quiz: {
    name: "Quiz Generator",
    systemPrompt: "You are an AI that generates quizzes from study material.",
  },
};

const AIStudyAssistantPage = () => {
  const [selectedTool, setSelectedTool] = useState("summarizer");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(() => {
    const savedChats = JSON.parse(localStorage.getItem("savedChats") || "[]");
    const lastChat = savedChats[savedChats.length - 1];
    return lastChat?.messages || [];
  });
  const [savedChats, setSavedChats] = useState(() => JSON.parse(localStorage.getItem("savedChats") || "[]"));
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const updatedChats = [...savedChats];
    if (updatedChats.length > 0) {
      updatedChats[updatedChats.length - 1].messages = messages;
      localStorage.setItem("savedChats", JSON.stringify(updatedChats));
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
  };
  const handleDeleteChat = (indexToDelete) => {
  const updatedChats = savedChats.filter((_, index) => index !== indexToDelete);
  setSavedChats(updatedChats);
  localStorage.setItem("savedChats", JSON.stringify(updatedChats));
};


  const handleNewChat = () => {
    const title = messages[0]?.content.slice(0, 30) || `Chat with ${tools[selectedTool].name}`;
    const newChat = { title, tool: selectedTool, messages: [] };
    const updatedChats = [...savedChats, newChat];
    setSavedChats(updatedChats);
    localStorage.setItem("savedChats", JSON.stringify(updatedChats));
    setMessages([]);
  };

  const handleLoadChat = (chat) => {
    setSelectedTool(chat.tool);
    setMessages(chat.messages);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: "user", content: inputText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-small-3.1-24b-instruct:free",
          messages: [
            { role: "system", content: tools[selectedTool].systemPrompt },
            ...updatedMessages,
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage = response.data.choices[0].message;
      setMessages((prev) => [...prev, aiMessage]);
      speak(aiMessage.content);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportText = () => {
    const text = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (e) => setInputText(e.results[0][0].transcript);
    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className="ai-page">
      {sidebarOpen && (
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>📂 Chats</h2>
            <button className="close-sidebar-button" onClick={() => setSidebarOpen(false)}>Close Sidebar</button>
          </div>
          <button className="new-chat-btn" onClick={handleNewChat}>➕ New Chat</button>
          <ul>
              {savedChats.map((chat, index) => (
              <li key={index} className="chat-list-item">
                 <span onClick={() => handleLoadChat(chat)}>🗂 {chat.title}</span>
                   <button className="delete-chat-btn" onClick={() => handleDeleteChat(index)}>Delete</button>
              </li>
                     ))}
          </ul>

        </div>
      )}

      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>📂 Open Chats</button>
      )}

      <div className="chat-container">
        <div className="page-heading">
          <Lottie animationData={animationData} style={{ height: 80 }} />
          <h1>🧠 AI Study Assistant</h1>
          <div className="tool-header">
            <div className="tool-tabs-with-clear">
              <div className="tool-tabs">
                {Object.keys(tools).map((key) => (
                  <button
                    key={key}
                    className={selectedTool === key ? "active" : ""}
                    onClick={() => setSelectedTool(key)}
                  >
                    {tools[key].name}
                  </button>
                ))}
              </div>
              <button className="clear-button-inline" onClick={handleClearChat}> Clear Chat</button>
            </div>
          </div>
        </div>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role === "user" ? "user" : "assistant"}`}>
              {msg.role === "assistant" ? (
                <div
                  className="assistant-markdown"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/(?:^|\n)### (.*?)(?=\n|$)/g, "<h3>$1</h3>")
                      .replace(/(?:^|\n)- (.*?)(?=\n|$)/g, "<li>$1</li>")
                      .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>")
                      .replace(/\n/g, "<br>")
                  }}
                />
              ) : (
                <div className="user-msg">{msg.content}</div>
              )}
            </div>
          ))}

          {loading && <div className="typing">Assistant is typing...</div>}
        </div>

        <div className="input-bar">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={startVoiceInput}>🎤</button>
          <button onClick={() => window.speechSynthesis.cancel()} className="stop-voice-btn">
             🛑 Stop Voice
              </button>

          <button onClick={handleSend}>Send</button>
          <button onClick={handleExportText}>📄</button>
        </div>
      </div>
    </div>
  );
};

export default AIStudyAssistantPage;
