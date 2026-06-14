import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro, { eventCenter } from '@tarojs/taro';
import styles from './index.module.scss';
import MessageItem from '@/components/MessageItem';
import ChatBubble from '@/components/ChatBubble';
import { mockCollectedMessages } from '@/data/messages';
import { ChatSession, Message } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';

const REPLIES: Record<string, string[]> = {
  default: [
    '收到你的消息啦~ 让我想想怎么回复你呢~',
    '嗯嗯，我在认真听哦',
    '这个问题很有意思，让我想想...',
    '哈哈，你说得对！',
    '我也这么觉得呢~'
  ],
  friendly: ['你说的很有道理呢~', '嗯嗯，我明白你的感受', '有什么我可以帮你的吗？'],
  humorous: ['哈哈哈哈你太逗了！', '这个梗我接住了！(•̀ᴗ•́)و', '笑死我了，你真是个人才'],
  formal: ['您的问题我已收到，请稍候', '根据我的分析...', '感谢您的提问'],
  cold: ['嗯。', '知道了。', '然后呢？'],
  cute: ['好哒好哒~', '兔兔听到啦！', '你好可爱呀~']
};

const ChatPage: React.FC = () => {
  const {
    chatSessions,
    collectedMessages,
    myCharacter,
    getMessagesForTarget,
    appendMessage,
    addChatSession
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'chats' | 'collects'>('chats');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const replyingRef = useRef(false);

  useEffect(() => {
    const handler = (targetId: string) => {
      const session = chatSessions.find((s) => s.targetId === targetId);
      if (session) {
        setSelectedSession(session);
        setLocalMessages(getMessagesForTarget(targetId));
      }
    };
    eventCenter.on('openChatWith', handler);
    return () => {
      eventCenter.off('openChatWith', handler);
    };
  }, [chatSessions, getMessagesForTarget]);

  useEffect(() => {
    if (selectedSession) {
      setLocalMessages(getMessagesForTarget(selectedSession.targetId));
    }
  }, [selectedSession, getMessagesForTarget]);

  const handleSessionClick = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const handleBack = () => {
    setSelectedSession(null);
  };

  const pickReply = (): string => {
    const tone =
      chatSessions.find((s) => selectedSession && s.targetId === selectedSession.targetId)
        ?.targetId === 'char-002'
        ? 'humorous'
        : selectedSession?.targetId === 'char-003'
        ? 'cold'
        : selectedSession?.targetId === 'char-004'
        ? 'cute'
        : selectedSession?.targetId === 'char-005'
        ? 'formal'
        : 'default';
    const pool = REPLIES[tone] || REPLIES.default;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedSession || replyingRef.current) return;
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
    appendMessage(selectedSession.targetId, newMsg);
    setLocalMessages((prev) => [...prev, newMsg]);
    setInputText('');
    replyingRef.current = true;
    setTimeout(() => {
      const replyMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: selectedSession?.targetId || '',
        senderName: selectedSession?.targetName || '',
        senderAvatar: selectedSession?.targetAvatar || '',
        content: pickReply(),
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        isAI: true,
        type: 'text'
      };
      appendMessage(selectedSession!.targetId, replyMsg);
      setLocalMessages((prev) => [...prev, replyMsg]);
      replyingRef.current = false;
    }, 800 + Math.random() * 1200);
  };

  const handleStartNewChat = () => {
    Taro.switchTab({ url: '/pages/discover/index' });
  };

  if (selectedSession) {
    return (
      <View className={styles.chatWindow}>
        <View className={styles.chatHeader}>
          <Text className={styles.backBtn} onClick={handleBack}>
            ←
          </Text>
          <Image className={styles.chatAvatar} src={selectedSession.targetAvatar} mode='aspectFill' />
          <View className={styles.chatInfo}>
            <Text className={styles.chatName}>{selectedSession.targetName}</Text>
            <Text className={styles.chatStatus}>● 在线</Text>
          </View>
          <Text className={styles.moreBtn}>⋯</Text>
        </View>
        <ScrollView
          className={styles.messagesContainer}
          scrollY
          scrollIntoView={`msg-${localMessages.length - 1}`}
        >
          {localMessages.map((msg, idx) => (
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
          {chatSessions.map((session) => (
            <MessageItem
              key={session.id}
              session={session}
              onClick={() => handleSessionClick(session)}
            />
          ))}
          {chatSessions.length === 0 && (
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
            {(collectedMessages.length > 0 ? collectedMessages : mockCollectedMessages).map(
              (msg) => (
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
              )
            )}
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
