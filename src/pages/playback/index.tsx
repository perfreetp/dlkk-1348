import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import ChatBubble from '@/components/ChatBubble';
import { mockMessages } from '@/data/messages';
import { ChatSession, Message } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';
import { mockCharacters } from '@/data/characters';

const dates = ['今天', '昨天', '08-10', '08-09', '08-08', '更早'];

const TIME_FILTERS = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
];

const PlaybackPage: React.FC = () => {
  const [activeDate, setActiveDate] = useState('今天');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [viewingCollection, setViewingCollection] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [filterChar, setFilterChar] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const {
    collectedMessages,
    getMessagesForTarget,
    chatSessions,
    batchUncollect
  } = useAppStore();

  const collectedCharacters = useMemo(() => {
    const idSet = new Set(collectedMessages.map((m) => m.senderId));
    return mockCharacters.filter((c) => idSet.has(c.id));
  }, [collectedMessages]);

  const filteredCollected = useMemo(() => {
    let list = collectedMessages;
    if (filterChar !== 'all') {
      list = list.filter((m) => m.senderId === filterChar);
    }
    if (filterTime !== 'all') {
      const now = new Date();
      list = list.filter((m) => {
        const mDate = new Date(m.timestamp);
        if (filterTime === 'today') {
          return mDate.toDateString() === now.toDateString();
        }
        if (filterTime === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return mDate >= weekAgo;
        }
        if (filterTime === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return mDate >= monthAgo;
        }
        return true;
      });
    }
    return list;
  }, [collectedMessages, filterChar, filterTime]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchUncollect = () => {
    if (selectedIds.size === 0) return;
    Taro.showModal({
      title: '取消收藏',
      content: `确定取消收藏 ${selectedIds.size} 条消息吗？`,
      success: (res) => {
        if (res.confirm) {
          batchUncollect(Array.from(selectedIds));
          setSelectedIds(new Set());
          Taro.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  };

  const handleBatchExport = () => {
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '请先选择消息', icon: 'none' });
      return;
    }
    Taro.showToast({ title: `导出 ${selectedIds.size} 条收藏`, icon: 'success' });
  };

  const handlePlaySession = (session: ChatSession) => {
    setSelectedSession(session);
    setViewingCollection(false);
  };

  const handleViewCollection = () => {
    setViewingCollection(true);
    setSelectedSession(null);
  };

  const handleBack = () => {
    setSelectedSession(null);
    setViewingCollection(false);
  };

  const getSessionMessages = (targetId: string): Message[] => {
    const stored = getMessagesForTarget(targetId);
    if (stored.length > 0) return stored;
    return mockMessages.map((m) => ({
      ...m,
      id: `${m.id}-${targetId}`,
      senderId: m.isAI ? targetId : 'me',
      senderName: m.isAI
        ? chatSessions.find((s) => s.targetId === targetId)?.targetName || ''
        : '我',
      senderAvatar: m.isAI
        ? chatSessions.find((s) => s.targetId === targetId)?.targetAvatar || ''
        : ''
    }));
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

  if (selectedSession || viewingCollection) {
    const isCollection = viewingCollection;
    const messages = isCollection
      ? filteredCollected
      : getSessionMessages(selectedSession!.targetId);
    const title = isCollection ? '我的收藏' : selectedSession!.targetName;
    const avatar = isCollection ? '' : selectedSession!.targetAvatar;

    return (
      <View className={styles.detailView}>
        <View className={styles.detailHeader}>
          <Text
            className={styles.backBtn}
            onClick={() => {
              handleBack();
              setFilterChar('all');
              setFilterTime('all');
              setSelectMode(false);
              setSelectedIds(new Set());
            }}
          >
            ←
          </Text>
          {isCollection ? (
            <View className={styles.collectionAvatar}>
              <Text>⭐</Text>
            </View>
          ) : (
            <Image
              className={styles.sessionAvatar}
              src={avatar}
              mode='aspectFill'
            />
          )}
          <Text className={styles.detailTitle}>{title}</Text>
          {isCollection ? (
            <View className={styles.headerActions}>
              {!selectMode && filteredCollected.length > 0 && (
                <Text className={styles.headerAction} onClick={handleBatchExport}>
                  📤
                </Text>
              )}
              {filteredCollected.length > 0 && (
                <Text
                  className={classnames(styles.headerAction, selectMode && styles.active)}
                  onClick={() => {
                    setSelectMode(!selectMode);
                    setSelectedIds(new Set());
                  }}
                >
                  {selectMode ? '取消' : '多选'}
                </Text>
              )}
            </View>
          ) : (
            <View className={styles.exportBtn} onClick={handleExport}>
              <Text>📤 导出</Text>
            </View>
          )}
        </View>

        {isCollection && (
          <View className={styles.collectFilters}>
            <ScrollView className={styles.charFilter} scrollX>
              <View
                className={classnames(
                  styles.filterPill,
                  filterChar === 'all' && styles.active
                )}
                onClick={() => setFilterChar('all')}
              >
                <Text>全部角色</Text>
              </View>
              {collectedCharacters.map((c) => (
                <View
                  key={c.id}
                  className={classnames(
                    styles.filterPill,
                    filterChar === c.id && styles.active
                  )}
                  onClick={() => setFilterChar(c.id)}
                >
                  <Image
                    className={styles.filterAvatar}
                    src={c.avatar}
                    mode='aspectFill'
                  />
                  <Text>{c.name}</Text>
                </View>
              ))}
            </ScrollView>
            <View className={styles.timeFilters}>
              {TIME_FILTERS.map((t) => (
                <Text
                  key={t.value}
                  className={classnames(
                    styles.timeChip,
                    filterTime === t.value && styles.active
                  )}
                  onClick={() => setFilterTime(t.value)}
                >
                  {t.label}
                </Text>
              ))}
            </View>
          </View>
        )}

        {isCollection && selectMode && selectedIds.size > 0 && (
          <View className={styles.batchBar}>
            <Text className={styles.batchInfo}>已选 {selectedIds.size} 条</Text>
            <View className={styles.batchActions}>
              <Text className={styles.batchBtn} onClick={handleBatchExport}>
                📤 导出
              </Text>
              <Text
                className={classnames(styles.batchBtn, styles.danger)}
                onClick={handleBatchUncollect}
              >
                ✕ 取消收藏
              </Text>
            </View>
          </View>
        )}

        <ScrollView className={styles.messagesArea} scrollY>
          <View className={styles.dateDivider}>
            <Text className={styles.dateText}>
              {isCollection ? `共 ${messages.length} 条收藏` : '今天'}
            </Text>
          </View>
          {messages.length === 0 ? (
            <View className={styles.emptyMsgs}>
              <Text className={styles.emptyMsgsIcon}>💭</Text>
              <Text className={styles.emptyMsgsText}>还没有收藏的消息</Text>
            </View>
          ) : isCollection && selectMode ? (
            messages.map((msg) => (
              <View
                key={msg.id}
                className={classnames(
                  styles.selectableMsg,
                  selectedIds.has(msg.id) && styles.selected
                )}
                onClick={() => toggleSelect(msg.id)}
              >
                <View
                  className={classnames(
                    styles.checkbox,
                    selectedIds.has(msg.id) && styles.checked
                  )}
                >
                  <Text>{selectedIds.has(msg.id) ? '✓' : ''}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <ChatBubble message={msg} />
                </View>
              </View>
            ))
          ) : (
            messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
          )}
          {!isCollection && (
            <View className={styles.dateDivider}>
              <Text className={styles.dateText}>—— 共 {messages.length} 条消息 ——</Text>
            </View>
          )}
        </ScrollView>

        {!isCollection && (
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
        )}
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
          {chatSessions.map((session, idx) => (
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
                    <Text>{getSessionMessages(session.targetId).length} 条消息</Text>
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

          <View className={styles.sessionCard} onClick={handleViewCollection}>
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
                  <Text>共 {collectedMessages.length} 条收藏</Text>
                </View>
              </View>
              <View className={classnames(styles.actionBtn, styles.primary)}>
                <Text>查看 →</Text>
              </View>
            </View>
            <View className={styles.preview}>
              <Text className={styles.previewText}>
                {collectedMessages.length > 0
                  ? collectedMessages[0].content
                  : '还没有收藏的消息'}
              </Text>
            </View>
          </View>
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
