import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { ChatSession } from '@/types';
import classnames from 'classnames';

interface MessageItemProps {
  session: ChatSession;
  onClick?: () => void;
  className?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ session, onClick, className }) => {
  return (
    <View className={classnames(styles.item, className)} onClick={onClick}>
      <View className={styles.avatarWrap}>
        <Image className={styles.avatar} src={session.targetAvatar} mode='aspectFill' />
        {session.unreadCount > 0 && (
          <View className={styles.unreadBadge}>
            <Text>{session.unreadCount > 99 ? '99+' : session.unreadCount}</Text>
          </View>
        )}
      </View>
      <View className={styles.content}>
        <View className={styles.top}>
          <Text className={styles.name}>{session.targetName}</Text>
          <Text className={styles.time}>{session.lastTime}</Text>
        </View>
        <View className={styles.bottom}>
          <Text className={styles.preview}>{session.lastMessage}</Text>
          {session.isAI && <Text className={styles.aiBadge}>AI</Text>}
        </View>
      </View>
    </View>
  );
};

export default MessageItem;
