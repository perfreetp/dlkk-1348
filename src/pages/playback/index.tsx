import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import ChatBubble from '@/components/ChatBubble';
import { mockChatSessions, mockMessages, mockCollectedMessages } from '@/data/messages';
import { ChatSession } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';

const dates = ['今天', '昨天', '08-10', '08-09', '08-08', '更早'];

const PlaybackPage: React.FC = () => {
  const [activeDate, setActiveDate] = useState('今天');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const { collectedMessages } = useAppStore();

  const handlePlaySession = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const handleExport = () => {
    Taro.showModal({
      title: '导出对话',
      content: '确定要导出该对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '导出成功', icon: 'success' });
        }
      }
    });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '删除对话',
      content: '确定要删除该对话记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '删除成功', icon: 'success' });
          setSelectedSession(null);
        }
      }
    });
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    Taro.showToast({
      title: isPlaying ? '已暂停' : '开始回放',
      icon: 'none',
      duration: 1000
    });
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIdx = speeds.indexOf(playSpeed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    setPlaySpeed(nextSpeed);
  };

  if (selectedSession) {
    return (
      <View className={styles.detailView}>
        <View className={styles.detailHeader}>
          <Text className={styles.backBtn} onClick={() => setSelectedSession(null)}>←</Text>
          <Image
            className={styles.sessionAvatar}
            src={selectedSession.targetAvatar}
            mode='aspectFill'
          />
          <Text className={styles.detailTitle}>{selectedSession.targetName}</Text>
          <View className={styles.exportBtn} onClick={handleExport}>
            <Text>📤 导出</Text>
          </View>
        </View>

        <ScrollView className={styles.messagesArea} scrollY>
          <View className={styles.dateDivider}>
            <Text className={styles.dateText}>今天</Text>
          </View>
          {mockMessages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <View className={styles.dateDivider}>
            <Text className={styles.dateText}>—— 共 {mockMessages.length} 条消息 ——</Text>
          </View>
        </ScrollView>

        <View className={styles.playbackControls}>
          <View className={styles.controlBtn} onClick={cycleSpeed}>
            <Text className={styles.speedBtn}>{playSpeed}x</Text>
            <Text className={styles.controlLabel}>速度</Text>
          </View>
          <View className={styles.controlBtn}>
            <Text className={styles.controlIcon}>⏮</Text>
            <Text className={styles.controlLabel}>上一条</Text>
          </View>
          <View className={styles.controlBtn} onClick={togglePlay}>
            <Text className={styles.controlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            <Text className={styles.controlLabel}>{isPlaying ? '暂停' : '播放'}</Text>
          </View>
          <View className={styles.controlBtn}>
            <Text className={styles.controlIcon}>⏭</Text>
            <Text className={styles.controlLabel}>下一条</Text>
          </View>
          <View className={styles.controlBtn} onClick={handleDelete}>
            <Text className={styles.controlIcon}>🗑️</Text>
            <Text className={styles.controlLabel}>删除</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.detailTitle}>
          <Text className='gradientText'>聊天回放</Text>
        </Text>
        <Text style={{ fontSize: '24rpx', color: '#94A3B8', marginTop: '8rpx' }}>
          回顾你和 AI 们的精彩对话
        </Text>
      </View>

      <ScrollView className={styles.dateTabs} scrollX>
        {dates.map((date) => (
          <Text
            key={date}
            className={classnames(styles.dateTab, activeDate === date && styles.active)}
            onClick={() => setActiveDate(date)}
          >
            {date}
          </Text>
        ))}
      </ScrollView>

      {activeDate === '今天' ? (
        <ScrollView className={styles.sessionList} scrollY>
          {mockChatSessions.map((session, idx) => (
            <View key={session.id} className={styles.sessionCard}>
              <View className={styles.sessionHeader}>
                <Image
                  className={styles.sessionAvatar}
                  src={session.targetAvatar}
                  mode='aspectFill'
                />
                <View className={styles.sessionInfo}>
                  <Text className={styles.sessionName}>{session.targetName}</Text>
                  <View className={styles.sessionMeta}>
                    <Text>{session.lastTime}</Text>
                    <Text>·</Text>
                    <Text>{mockMessages.length} 条消息</Text>
                  </View>
                </View>
                <View className={styles.sessionActions}>
                  <View
                    className={classnames(styles.actionBtn, styles.secondary)}
                    onClick={handleExport}
                  >
                    <Text>📤 导出</Text>
                  </View>
                  <View
                    className={classnames(styles.actionBtn, styles.primary)}
                    onClick={() => handlePlaySession(session)}
                  >
                    <Text>▶ 回放</Text>
                  </View>
                </View>
              </View>
              <View className={styles.preview}>
                <Text className={styles.previewText}>{session.lastMessage}</Text>
              </View>
            </View>
          ))}

          {collectedMessages.length > 0 && (
            <View className={styles.sessionCard}>
              <View className={styles.sessionHeader}>
                <View
                  style={{
                    width: '80rpx',
                    height: '80rpx',
                    borderRadius: '999rpx',
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40rpx'
                  }}
                >
                  <Text>⭐</Text>
                </View>
                <View className={styles.sessionInfo}>
                  <Text className={styles.sessionName}>我的收藏</Text>
                  <View className={styles.sessionMeta}>
                    <Text>共 {collectedMessages.length || mockCollectedMessages.length} 条收藏</Text>
                  </View>
                </View>
              </View>
              <View className={styles.preview}>
                <Text className={styles.previewText}>
                  {(collectedMessages.length > 0 ? collectedMessages : mockCollectedMessages)[0].content}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyTitle}>暂无历史对话</Text>
          <Text className={styles.emptyDesc}>快去和AI角色开始聊天吧~</Text>
        </View>
      )}
    </View>
  );
};

export default PlaybackPage;
