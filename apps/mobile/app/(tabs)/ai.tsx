import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useChatStore } from '../../lib/chatStore';
import { Colors } from '../../lib/ColorTheme';
import { ChatHeader } from '../../components/ChatHeader';
import { MessageList } from '../../components/MessageList';
import { MessageInput } from '../../components/MessageInput';

export default function AiChatScreen() {
    const { aiChat, socket, fetchMessages } = useChatStore();

    useEffect(() => {
        if (aiChat && socket) {
            socket.emit('join_chat', aiChat.id);
            fetchMessages(aiChat.id);
        }
    }, [aiChat, socket]);

    if (!aiChat) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.violet} />
                <Text style={styles.loadingText}>Preparing your private AI chat...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ChatHeader 
                title="Amara AI"
                subtitle="Your Private Wellness Companion"
                iconName="robot"
            />
            <MessageList chatId={aiChat.id} />
            <MessageInput chatId={aiChat.id} chatType="PRIVATE_AI" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.offGray,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.offGray,
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Inter-SemiBold',
        color: Colors.secondaryText,
    }
});