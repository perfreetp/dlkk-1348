import React, { useState } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import MessageItem from '@/components/MessageItem';
import ChatBubble from '@/components/ChatBubble';
import { mockChatSessions, mockMessages, mockCollectedMessages } from '@/data/messages';
import { ChatSession, Message } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';

const ChatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'collects'>('chats');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const { collectedMessages, myCharacter } = useAppStore();

  const handleSessionClick = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const handleBack = () => {
    setSelectedSession(null);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: '我',
      senderAvatar: myCharacter.avatar,
      content: inputText,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      isAI: false,
      type: 'text'
    };
    setMessages([...messages, newMsg]);
    setInputText('');
    setTimeout(() => {
      const replyMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: selectedSession?.targetId || '',
        senderName: selectedSession?.targetName || '',
        senderAvatar: selectedSession?.targetAvatar || '',
        content: '收到你的消息啦~ 让我想想怎么回复你呢~',
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        isAI: true,
        type: 'text'
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1000);
  };

  const handleStartNewChat = () => {
    Taro.navigateTo({ url: '/pages/discover/index' });
  };

  if (selectedSession) {
    return (
      <View className={styles.chatWindow}>
        <View className={styles.chatHeader}>
          <Text className={styles.backBtn} onClick={handleBack}>←</Text>
          <Image className={styles.chatAvatar} src={selectedSession.targetAvatar} mode='aspectFill' />
          <View className={styles.chatInfo}>
            <Text className={styles.chatName}>{selectedSession.targetName}</Text>
            <Text className={styles.chatStatus}>● 在线</Text>
          </View>
          <Text className={styles.moreBtn}>⋯</Text>
        </View>
        <ScrollView className={styles.messagesContainer} scrollY scrollIntoView={`msg-${messages.length - 1}`}>
          {messages.map((msg, idx) => (
            <View key={msg.id} id={`msg-${idx}`}>
              <ChatBubble message={msg} />
            </View>
          ))}
        </ScrollView>
        <View className={styles.inputArea}>
          <View className={styles.inputWrap}>
            <Input
              className={styles.messageInput}
              placeholder='输入消息...'
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              confirmType='send'
              onConfirm={handleSend}
            />
          </View>
          <View className={styles.sendBtn} onClick={handleSend}>
            <Text>➤</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>
          <Text className='gradientText'>消息</Text>
        </Text>
        <Text className={styles.subtitle}>与 AI 角色开始一段精彩对话</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input className={styles.searchInput} placeholder='搜索聊天记录...' />
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, activeTab === 'chats' && styles.active)}
          onClick={() => setActiveTab('chats')}
        >
          私聊列表
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'collects' && styles.active)}
          onClick={() => setActiveTab('collects')}
        >
          消息收藏 ({collectedMessages.length || mockCollectedMessages.length})
        </Text>
      </View>

      {activeTab === 'chats' && (
        <View className={styles.chatList}>
          {mockChatSessions.map((session) => (
            <MessageItem
              key={session.id}
              session={session}
              onClick={() => handleSessionClick(session)}
            />
          ))}
          {mockChatSessions.length === 0 && (
            <View className={styles.empty}>
              <Text className={styles.emptyIcon}>💬</Text>
              <Text className={styles.emptyText}>还没有聊天记录，快去发现页找个AI聊天吧</Text>
            </View>
          )}
        </View>
      )}

      {activeTab === 'collects' && (
        <ScrollView className={styles.collectTab} scrollY>
          <View className={styles.collectSection}>
            <Text className={styles.sectionTitle}>⭐ 我的收藏</Text>
            {(collectedMessages.length > 0 ? collectedMessages : mockCollectedMessages).map((msg) => (
              <View key={msg.id} className={styles.collectCard}>
                <View className={styles.collectMeta}>
                  <Image className={styles.collectAvatar} src={msg.senderAvatar} mode='aspectFill' />
                  <Text className={styles.collectName}>{msg.senderName}</Text>
                  <Text className={styles.collectTime}>{msg.timestamp}</Text>
                </View>
                <View className={styles.collectContent}>
                  <Text>{msg.content}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View className={styles.fab} onClick={handleStartNewChat}>
        <Text>+</Text>
      </View>
    </View>
  );
};

export default ChatPage;
