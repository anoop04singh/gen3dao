import {
  GoogleGenerativeAI,
  GenerateContentResult,
  Tool,
} from "@google/generative-ai";
import { Node } from "reactflow";

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
- You will be provided with a list of nodes already on the canvas as part of the user's prompt.
- Before adding a node, check if a node of the same type already exists. If it does, do not call the function and instead inform the user that the component is already on the canvas.
- When a user asks to add a component that doesn't exist yet, call the 'addNode' function.
- After calling 'addNode', your response to the user should confirm the action and then proactively ask if they want to configure the new node or stick with the default settings. For example: "I've added the Token node. You can configure its name, symbol, and supply by clicking on it. Would you like to keep the defaults for now?"
- If the user asks for an explanation of a configuration parameter (like 'quorum', 'proposal threshold', 'initial supply'), provide a simple, clear definition.
- Do not give financial or investment advice.`,
  tools,
});

export const chatSession = model.startChat({
  history: [],
});

export const sendMessageToAI = async (
  message: string,
  nodes: Node[]
): Promise<GenerateContentResult> => {
  const existingNodeTypes = nodes.map((node) => node.type).filter(Boolean);
  const contextMessage = `
    User message: "${message}"
    ---
    System context: The following nodes already exist on the canvas: [${existingNodeTypes.join(
      ", "
    )}]. 
    Do not add nodes that are already in this list.
  `;
  const result = await chatSession.sendMessage(contextMessage);
  return result;
};