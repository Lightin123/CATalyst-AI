import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getRouterModel, getTutorModel } from "../services/llmService";
import { agentHybridSearch } from "../tools/hybridSearch";
import { agentRandomRetrieve } from "../tools/metadataSearch";

interface AgentState {
  messages: BaseMessage[];
  intent: string;
  context: any[];
}

const analyzeQuery = async (state: AgentState): Promise<Partial<AgentState>> => {
  // If intent was already provided by frontend UI, we can bypass LLM routing for the intent itself,
  // but we can generate search queries if needed.
  console.log('Analyzing query for intent:', state.intent);
  return { intent: state.intent };
};

const retrieveData = async (state: AgentState): Promise<Partial<AgentState>> => {
  const lastMessage = state.messages[state.messages.length - 1].content.toString();
  let context = [];

  switch(state.intent) {
    case 'cat_prep':
      context = await agentHybridSearch(lastMessage, { type: 'CAT' });
      break;
    case 'fat_prep':
      context = await agentHybridSearch(lastMessage, { type: 'FAT' });
      break;
    case 'concept_builder':
      // Just a hybrid search for the concept
      context = await agentHybridSearch(lastMessage);
      break;
    case 'rapid_fire':
    case 'predict_exam':
      // Randomly retrieve questions
      context = await agentRandomRetrieve();
      break;
    default:
      context = await agentHybridSearch(lastMessage);
      break;
  }
  
  return { context };
};

const generateResponse = async (state: AgentState): Promise<Partial<AgentState>> => {
  const tutorModel = getTutorModel();
  
  const systemPrompt = new SystemMessage(
    `You are CATalyst AI, an expert AI tutor helping university students prepare for their exams. 
    You are currently in mode: ${state.intent}.
    
    Here are the retrieved past exam questions and answers to use as context:
    ${JSON.stringify(state.context)}
    
    Based on the mode:
    - For CAT/FAT Prep: Explain step-by-step solutions based on the context.
    - For Concept Builder: Introduce concepts gradually.
    - For Rapid Fire / Predict Exam: Generate a quiz based on the context.
    
    Always be helpful, clear, and educational.`
  );
  
  // Exclude actual context array when sending to the LLM if it's too large, but insert it into prompt
  const messagesToSend = [systemPrompt, ...state.messages];
  const response = await tutorModel.invoke(messagesToSend);
  
  return { messages: [response] };
};

const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => []
    },
    intent: {
      value: (x: string, y: string) => y ?? x,
      default: () => 'chat'
    },
    context: {
      value: (x: any[], y: any[]) => y ?? x,
      default: () => []
    }
  }
})
  .addNode("analyzeQuery", analyzeQuery)
  .addNode("retrieveData", retrieveData)
  .addNode("generateResponse", generateResponse)
  .addEdge(START, "analyzeQuery")
  .addEdge("analyzeQuery", "retrieveData")
  .addEdge("retrieveData", "generateResponse")
  .addEdge("generateResponse", END);

const memory = new MemorySaver();
export const catalystAgent = workflow.compile({ checkpointer: memory });
