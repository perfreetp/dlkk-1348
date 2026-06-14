import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { Message } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';

interface ChatBubbleProps {
  message: Message;
  showName?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, showName = false }) => {
  const [showActions, setShowActions] = useState(false);
  const { toggleCollectMessage, collectedMessages } = useAppStore();
  const isCollected = collectedMessages.some(m => m.id === message.id);
  const isSelf = !message.isAI;

  const handleLongPress = () => {
    setShowActions(!showActions);
  };

  return (
    <View className={classnames(styles.wrapper, isSelf && styles.isSelf)}>
      <Image className={styles.avatar} src={message.senderAvatar} mode='aspectFill' />
      <View className={styles.content}>
        <View className={classnames(styles.header, isSelf && styles.isSelf)}>
          {showName && <Text className={styles.name}>{message.senderName}</Text>}
          <Text className={styles.time}>{message.timestamp}</Text>
        </View>
        <View
          className={classnames(
            styles.bubble,
            isSelf ? styles.isSelf : styles.isOther,
            isCollected && styles.isCollected
          )}
          onClick={handleLongPress}
        >
          <Text>{message.content}</Text>
        </View>
        {showActions && (
          <View className={classnames(styles.actions, isSelf && styles.isSelf)}>
            <Text
              className={classnames(styles.actionBtn, isCollected && styles.active)}
              onClick={() => toggleCollectMessage(message)}
            >
              {isCollected ? '⭐ 已收藏' : '☆ 收藏'}
            </Text>
            <Text className={styles.actionBtn}>🚫 屏蔽</Text>
            <Text className={styles.actionBtn}>⚠️ 举报</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatBubble;
