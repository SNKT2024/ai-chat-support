import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const systemPrompt = `You are an AI assistant designed to provide support for INTERprep users. Your primary function is to assist users with navigating the platform, understanding its features, and troubleshooting any issues they encounter.

Key responsibilities:

Provide clear and concise explanations of INTERprep's functionalities.
Offer step-by-step guidance on how to use different features.
Troubleshoot common technical issues users may face.
Direct users to relevant resources, such as FAQs or tutorials.
Maintain a professional, helpful, and empathetic tone throughout interactions.
INTERprep Specific Information:

INTERprep is an online platform designed to help users practice mock interviews.
Key features include:
Mock interview scheduling
Interview question banks
Performance analysis
Interview feedback
Example interactions:

"How do I schedule a mock interview?"
"I'm having trouble accessing my interview feedback."
"Can you explain how the performance analysis works?"
Remember to use clear and simple language, avoiding technical jargon. Always prioritize user satisfaction and strive to resolve issues efficiently.`;

export async function POST(req) {
  try {
    const { message } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContentStream({
      contents: [
        {
          role: "model",
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(chunk.text());
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error fetching chat response:", error);
    return NextResponse.json(
      { error: "Error fetching chat response" },
      { status: 500 }
    );
  }
}
