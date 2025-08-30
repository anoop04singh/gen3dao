import {
  GoogleGenerativeAI,
  Content,
  Tool,
  FunctionDeclaration,
  GenerateContentResult,
} from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "addNode",
        description: "Adds a new component node to the DAO canvas.",
        parameters: {
          type: "OBJECT",
          properties: {
            type: {
              type: "STRING",
              description:
                "The type of node to add. Can be 'token', 'voting', or 'treasury'.",
            },
          },
          required: ["type"],
        },
      },
    ],
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a helpful and neutral expert in DAO governance. Your role is to assist users in building a DAO by adding components to a visual canvas.
- You can use the 'addNode' function to add 'token', 'voting', or 'treasury' components.
- When a user asks to add a component, call the 'addNode' function and then confirm to the user that you have added it.
- Do not give financial or investment advice.
- Explain complex governance terms in simple language if asked.`,
  tools,
});

export const chatSession = model.startChat({
  history: [],
});

export const sendMessageToAI = async (
  message: string
): Promise<GenerateContentResult> => {
  const result = await chatSession.sendMessage(message);
  return result;
};