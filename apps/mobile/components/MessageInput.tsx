import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../lib/ColorTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChatStore } from '../lib/chatStore';
import { useAuth } from '../lib/auth';

interface MessageInputProps {
    chatId: string;
    chatType: 'COUPLE' | 'PRIVATE_AI';
}

export function MessageInput({ chatId, chatType }: MessageInputProps) {
    const [content, setContent] = useState('');
    const socket = useChatStore(state => state.socket);
    const { session } = useAuth();

    const handleSend = () => {
        if (!content.trim() || !socket || !session) return;
        
        socket.emit('send_message', {
            chatId,
            userId: session.user.id,
            content: content.trim(),
            chatType,
        });

        setContent('');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    placeholderTextColor={Colors.secondaryText}
                    value={content}
                    onChangeText={setContent}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!content.trim()}>
                    <MaterialCommunityIcons name="send" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderColor: '#E2E8F0',
    },
    input: {
        flex: 1,
        backgroundColor: Colors.offGray,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        marginRight: 10,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.violet,
        justifyContent: 'center',
        alignItems: 'center',
    },
});