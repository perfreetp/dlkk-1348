import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Message } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';

interface ChatBubbleProps {
  message: Message;
  showName?: boolean;
  highlight?: boolean;
}

const REPORT_REASONS = ['垃圾广告', '骚扰谩骂', '色情低俗', '违法违规', '其他原因'];

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, showName = false, highlight = false }) => {
  const [showActions, setShowActions] = useState(false);
  const { toggleCollectMessage, collectedMessages, blockUser, addReport } = useAppStore();
  const isCollected = collectedMessages.some((m) => m.id === message.id);
  const isSelf = !message.isAI;
  const isHighlighted = highlight || message.isHighlighted;

  const handleBubbleClick = () => {
    setShowActions(!showActions);
  };

  const handleCollect = () => {
    toggleCollectMessage(message);
    Taro.showToast({
      title: isCollected ? '已取消收藏' : '收藏成功',
      icon: 'success',
      duration: 1000
    });
    setShowActions(false);
  };

  const handleBlock = () => {
    if (!message.isAI) {
      Taro.showToast({ title: '无法屏蔽自己', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '屏蔽角色',
      content: `确定要屏蔽"${message.senderName}"吗？屏蔽后将不再接收其消息。`,
      success: (res) => {
        if (res.confirm) {
          blockUser(message.senderId);
          Taro.showToast({ title: '已屏蔽该角色', icon: 'success' });
          setShowActions(false);
        }
      }
    });
  };

  const handleReport = () => {
    if (!message.isAI) {
      Taro.showToast({ title: '无法举报自己', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: REPORT_REASONS,
      success: (res) => {
        const reason = REPORT_REASONS[res.tapIndex];
        addReport({
          targetId: message.senderId,
          targetName: message.senderName,
          targetAvatar: message.senderAvatar,
          reason,
          messageContent: message.content
        });
        Taro.showToast({ title: '举报已提交', icon: 'success' });
        setShowActions(false);
      }
    });
  };

  return (
    <View className={classnames(styles.wrapper, isSelf && styles.isSelf, isHighlighted && styles.highlighted)}>
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
          onClick={handleBubbleClick}
        >
          <Text>{message.content}</Text>
        </View>
        {showActions && (
          <View className={classnames(styles.actions, isSelf && styles.isSelf)}>
            <Text
              className={classnames(styles.actionBtn, isCollected && styles.active)}
              onClick={handleCollect}
            >
              {isCollected ? '⭐ 已收藏' : '☆ 收藏'}
            </Text>
            {!isSelf && (
              <>
                <Text className={styles.actionBtn} onClick={handleBlock}>
                  🚫 屏蔽
                </Text>
                <Text className={styles.actionBtn} onClick={handleReport}>
                  ⚠️ 举报
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatBubble;
