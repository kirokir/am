import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Message, useChatStore } from '../lib/chatStore';
import { useAuth } from '../lib/auth';
import { Colors } from '../lib/ColorTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MessageListProps {
    chatId: string;
}

const MessageBubble = ({ message, currentUserId }: { message: Message, currentUserId: string }) => {
    const isCurrentUser = message.user_id === currentUserId;
    const isAmara = message.user_id.startsWith('amara-ai');

    if (message.is_nudge) {
        return (
            <View style={styles.nudgeContainer}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={Colors.violet} />
                <Text style={styles.nudgeText}>{message.content}</Text>
            </View>
        );
    }
    
    return (
        <View style={[styles.bubbleWrapper, { justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }]}>
            <View style={[styles.bubble, isCurrentUser ? styles.userBubble : (isAmara ? styles.aiBubble : styles.partnerBubble)]}>
                <Text style={isCurrentUser ? styles.userText : styles.partnerText}>
                    {message.content}
                </Text>
            </View>
        </View>
    );
};

export function MessageList({ chatId }: MessageListProps) {
    const messages = useChatStore(state => state.messages[chatId] || []);
    const { session } = useAuth();

    if (!session) return <ActivityIndicator />;

    return (
        <FlatList
            data={messages}
            renderItem={({ item }) => <MessageBubble message={item} currentUserId={session.user.id} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            inverted
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    bubbleWrapper: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: Colors.violet,
        borderBottomRightRadius: 4,
    },
    partnerBubble: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderBottomLeftRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#F0EFFF',
        borderBottomLeftRadius: 4,
    },
    userText: {
        color: Colors.white,
        fontFamily: 'Inter-Regular',
        fontSize: 15,
    },
    partnerText: {
        color: Colors.darkText,
        fontFamily: 'Inter-Regular',
        fontSize: 15,
    },
    nudgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0EFFF',
        borderRadius: 12,
        padding: 12,
        marginVertical: 10,
        marginHorizontal: 20,
    },
    nudgeText: {
        flex: 1,
        marginLeft: 10,
        fontFamily: 'Inter-SemiBold',
        color: Colors.violet,
        fontSize: 14,
        lineHeight: 20,
    }
});