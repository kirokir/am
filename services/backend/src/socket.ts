import { Server, Socket } from 'socket.io';
import { supabaseAdmin } from './lib/supabase';
import { getAIResponse } from './orchestrator';

export function initializeSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on('join_chat', (chatId: string) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined room ${chatId}`);
        });

        socket.on('send_message', async (payload) => {
            const { chatId, userId, content, chatType } = payload;
            
            // 1. Insert user's message into DB
            const { data: userMessage, error: userMsgError } = await supabaseAdmin
                .from('messages')
                .insert({ chat_id: chatId, user_id: userId, content })
                .select('*')
                .single();
            
            if (userMsgError) {
                console.error('Error saving user message:', userMsgError);
                return;
            }

            // 2. Broadcast user's message to the room
            io.to(chatId).emit('receive_message', userMessage);

            // 3. If it's a private AI chat, get and broadcast the AI's response
            if (chatType === 'PRIVATE_AI') {
                const aiContent = await getAIResponse(chatId, userId, content);
                
                const { data: aiMessage, error: aiMsgError } = await supabaseAdmin
                    .from('messages')
                    .insert({
                        chat_id: chatId,
                        user_id: 'amara-ai-7a8b9c0d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', // Fixed Amara UUID
                        content: aiContent
                    })
                    .select('*')
                    .single();

                if (aiMsgError) {
                    console.error('Error saving AI message:', aiMsgError);
                    return;
                }
                io.to(chatId).emit('receive_message', aiMessage);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}