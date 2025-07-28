import fetch from 'node-fetch';
import { supabaseAdmin } from './lib/supabase';
import { Server } from 'socket.io';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const AI_MODEL = 'llama3';

export async function generateNudgeForCouple(coupleId: string, io: Server) {
    console.log(`[Nudge Engine] Analyzing couple: ${coupleId}`);

    // 1. Fetch all three chat IDs for the couple
    const { data: chats, error: chatsError } = await supabaseAdmin
        .from('chats')
        .select('id, chat_type')
        .eq('couple_id', coupleId);
    if (chatsError || !chats || chats.length === 0) {
        console.error('[Nudge Engine] Could not find chats for couple:', chatsError?.message);
        return;
    }

    const coupleChat = chats.find(c => c.chat_type === 'COUPLE');
    const privateChats = chats.filter(c => c.chat_type === 'PRIVATE_AI');
    if (!coupleChat || privateChats.length < 2) {
        console.log('[Nudge Engine] Couple does not have all three required chats yet. Skipping.');
        return;
    }
    
    // 2. Fetch recent messages from all three conversations
    const fetchHistory = async (chatId: string) => {
        const { data } = await supabaseAdmin.from('messages').select('content').eq('chat_id', chatId).order('created_at', { ascending: false }).limit(15);
        return data?.map(m => m.content).reverse().join('\n') || 'No recent messages.';
    };

    const coupleHistory = await fetchHistory(coupleChat.id);
    const partnerAHistory = await fetchHistory(privateChats[0].id);
    const partnerBHistory = await fetchHistory(privateChats[1].id);

    // 3. Construct the Mega-Prompt
    const megaPrompt = `
System Role: You are Amara, a relationship therapist AI. Your goal is to promote empathy and healthy communication. You MUST NOT reveal secrets or specific details from private chats. Instead, you must synthesize the underlying emotions or themes and transform them into a gentle, forward-looking nudge, question, or affirmation for the couple's main chat. The message should be short, under 25 words. If you analyze the context and no nudge is necessary or appropriate right now, you MUST output the single word 'NULL'.

Context Block 1 (The Couple's shared conversation):
---
${coupleHistory}
---

Context Block 2 (Private thoughts from Partner A - for your context ONLY):
---
${partnerAHistory}
---

Context Block 3 (Private thoughts from Partner B - for your context ONLY):
---
${partnerBHistory}
---

Task: Based on your analysis of all three contexts, generate one short, helpful, and subtle message to post in the couple's chat. The message should be positive and encourage interaction.
Examples of good nudges:
- "What's one thing you appreciate about each other today?"
- "This might be a good time to talk about plans for the weekend."
- "Remembering to assume the best in each other can make a big difference."
- "It seems like you're both working hard. What's a small way you could support each other right now?"

Generate the nudge now. If no nudge is needed, remember to output only 'NULL'.`;

    // 4. Generate & Inject
    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: AI_MODEL, prompt: megaPrompt, stream: false }),
        });
        const data = await response.json() as { response: string };
        const nudgeText = data.response.trim();

        if (nudgeText && nudgeText.toUpperCase() !== 'NULL') {
            console.log(`[Nudge Engine] Injecting nudge for couple ${coupleId}: "${nudgeText}"`);
            const { data: injectedMessage, error: insertError } = await supabaseAdmin
                .from('messages')
                .insert({
                    chat_id: coupleChat.id,
                    user_id: 'amara-ai-7a8b9c0d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', // A fixed UUID for Amara
                    content: nudgeText,
                    is_nudge: true
                })
                .select('*')
                .single();
            
            if (insertError) throw insertError;

            // Broadcast the new nudge to the couple's chat room
            io.to(coupleChat.id).emit('receive_message', injectedMessage);
        } else {
            console.log(`[Nudge Engine] No nudge needed for couple ${coupleId}.`);
        }
    } catch (e) {
        console.error('[Nudge Engine] Failed to generate or inject nudge:', e);
    }
}