// src/api.js
export const fetchAIResponse = async (tool, inputText) => {
  const promptMap = {
    summarizer: `Summarize this:\n${inputText}`,
    quiz: `Make 5 quiz questions from:\n${inputText}`,
    flashcard: `Make flashcards (term: definition) from:\n${inputText}`,
    schedule: `Suggest a 5-day study schedule for:\n${inputText}`,
    doubt: `Answer this academic doubt:\n${inputText}`,
    rewriter: `Rewrite this in simpler, clearer language:\n${inputText}`,
  };

  const prompt = promptMap[tool] || inputText;

  console.log("➡️ Sending prompt to OpenAI:", prompt);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  console.log("⬅️ Response status:", response.status);

  const data = await response.json();
  console.log("📦 Response JSON:", data);

  if (!response.ok) throw new Error(data.error?.message || "Unknown error");

  return data.choices[0].message.content;
};
