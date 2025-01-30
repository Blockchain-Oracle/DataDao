// import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// // const openai = new OpenAI({
// //   // baseURL: "https://api.deepseek.com",
// //   apiKey: process.env.OPENAI_API_KEY,
// // });

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: `You are a helpful assistant for the DataDAO platform, a decentralized data labeling platform.
    //       You help users with:
    //       - Creating and managing tasks
    //       - Participating in data labeling
    //       - Understanding rewards and tokenomics
    //       - Technical support for blockchain interactions
    //       Be concise, friendly, and helpful.`,
    //     },
    //     ...history,
    //     { role: "user", content: message },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 150,
    // });

    console.log(message, history);
    const content = await run(message, history);

    return NextResponse.json({
      // response: completion.choices[0].message.content,
      response: content,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key
const genAI = new GoogleGenerativeAI("AIzaSyDiKiw745fX7QawXF0jTnT7bCxVWlV5sKA");

async function run(userMessages?: string, history: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Define system-like instructions
  const systemInstruction = `
    You are a helpful assistant for the DataDAO platform, a decentralized data labeling platform.
    You help users with:
    - Creating and managing tasks
    - Participating in data labeling
    - Understanding rewards and tokenomics
    - Technical support for blockchain interactions
    Be concise, friendly, and helpful.
  `;

  // Example user message
  console.log(userMessages);
  const userMessage = "How do I create a labeling task?";

  // Combine system instruction with chat history
  const chat = [
    { role: "user", parts: [{ text: systemInstruction }] },
    { role: "user", parts: [{ text: userMessages! }] },
    // { role: "user", parts: [{ text: history }] },
  ];

  // Send the request
  const result = await model.generateContent({
    contents: chat,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 150,
    },
  });

  return result.response.text();
}
