import fetch from 'node-fetch';
import { supabaseAdmin } from './lib/supabase';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const AI_MODEL = 'llama3'; // Or 'mistral'

interface Message {
  content: string;
  user_id: string;
}

export async function getAIResponse(chatId: string, userId: string, newContent: string): Promise<string> {
    const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('content, user_id')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching chat history:', error);
        return "I'm having trouble recalling our conversation right now.";
    }

    const reversedMessages = messages?.reverse() || [];
    const history = reversedMessages.map(msg => 
        `${msg.user_id === userId ? 'You' : 'Amara'}: ${msg.content}`
    ).join('\n');

    const prompt = `You are Amara, an empathetic AI relationship wellness companion. You are in a private, one-on-one conversation. Be supportive, insightful, and encouraging. Never be judgmental. Keep your responses concise and conversational.
Here is the recent conversation history:
${history}
You: ${newContent}
Amara:`;

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: AI_MODEL, prompt, stream: false }),
        });
        const data = await response.json() as { response: string };
        return data.response.trim();
    } catch (e) {
        console.error('Error calling Ollama:', e);
        return "I'm sorry, I'm unable to respond at the moment.";
    }
}