import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro, { eventCenter } from '@tarojs/taro';
import styles from './index.module.scss';
import MessageItem from '@/components/MessageItem';
import ChatBubble from '@/components/ChatBubble';
import { ChatSession, Message } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';
import { mockCharacters } from '@/data/characters';

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

const TONE_MAP: Record<string, string> = {
  'char-001': 'friendly',
  'char-002': 'humorous',
  'char-003': 'cold',
  'char-004': 'cute',
  'char-005': 'formal',
  'char-006': 'friendly',
  'char-007': 'humorous',
  'char-008': 'formal'
};

const TIME_FILTERS = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
];

const ChatPage: React.FC = () => {
  const {
    collectedMessages,
    myCharacter,
    getMessagesForTarget,
    appendMessage,
    getSortedSessions,
    getArchivedSessions,
    pinSession,
    unpinSession,
    deleteSession,
    markSessionUnread,
    clearUnread,
    archiveSessions,
    unarchiveSessions,
    batchUncollect,
    chatSessions
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'chats' | 'collects'>('chats');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [actionSheetVisible, setActionSheetVisible] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collectFilterChar, setCollectFilterChar] = useState<string>('all');
  const [collectFilterTime, setCollectFilterTime] = useState<string>('all');
  const [collectSelectMode, setCollectSelectMode] = useState(false);
  const [collectSelectedIds, setCollectSelectedIds] = useState<Set<string>>(new Set());
  const replyingRef = useRef(false);

  const sessions = showArchive ? getArchivedSessions() : getSortedSessions();

  const collectedCharacters = useMemo(() => {
    const idSet = new Set(collectedMessages.map((m) => m.senderId));
    return mockCharacters.filter((c) => idSet.has(c.id));
  }, [collectedMessages]);

  const filteredCollected = useMemo(() => {
    let list = collectedMessages;
    if (collectFilterChar !== 'all') {
      list = list.filter((m) => m.senderId === collectFilterChar);
    }
    if (collectFilterTime !== 'all') {
      const now = new Date();
      list = list.filter((m) => {
        const mDate = new Date(m.timestamp);
        if (collectFilterTime === 'today') {
          return mDate.toDateString() === now.toDateString();
        }
        if (collectFilterTime === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return mDate >= weekAgo;
        }
        if (collectFilterTime === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return mDate >= monthAgo;
        }
        return true;
      });
    }
    return list;
  }, [collectedMessages, collectFilterChar, collectFilterTime]);

  useEffect(() => {
    const handler = (targetId: string) => {
      const session = chatSessions.find((s) => s.targetId === targetId);
      if (session) {
        setSelectedSession(session);
        setLocalMessages(getMessagesForTarget(targetId));
        clearUnread(targetId);
      }
    };
    eventCenter.on('openChatWith', handler);
    return () => {
      eventCenter.off('openChatWith', handler);
    };
  }, [chatSessions, getMessagesForTarget, clearUnread]);

  useEffect(() => {
    if (selectedSession) {
      setLocalMessages(getMessagesForTarget(selectedSession.targetId));
    }
  }, [selectedSession, getMessagesForTarget]);

  const handleSessionClick = (session: ChatSession) => {
    if (selectMode) {
      toggleSelect(session.targetId);
      return;
    }
    if (actionSheetVisible) {
      setActionSheetVisible(null);
      return;
    }
    setSelectedSession(session);
    clearUnread(session.targetId);
  };

  const handleSessionLongPress = (session: ChatSession) => {
    if (selectMode) return;
    setActionSheetVisible(session.targetId);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCollectSelect = (id: string) => {
    setCollectSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePin = (session: ChatSession) => {
    if (session.isPinned) unpinSession(session.targetId);
    else pinSession(session.targetId);
    setActionSheetVisible(null);
  };

  const handleMarkUnread = (session: ChatSession) => {
    markSessionUnread(session.targetId);
    setActionSheetVisible(null);
  };

  const handleDelete = (session: ChatSession) => {
    Taro.showModal({
      title: '删除会话',
      content: `确定要删除与"${session.targetName}"的聊天记录吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteSession(session.targetId);
          if (selectedSession?.targetId === session.targetId) {
            setSelectedSession(null);
          }
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
    setActionSheetVisible(null);
  };

  const handleArchive = () => {
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '请先选择会话', icon: 'none' });
      return;
    }
    if (showArchive) {
      unarchiveSessions(Array.from(selectedIds));
      Taro.showToast({ title: `已恢复 ${selectedIds.size} 个会话`, icon: 'success' });
    } else {
      archiveSessions(Array.from(selectedIds));
      Taro.showToast({ title: `已归档 ${selectedIds.size} 个会话`, icon: 'success' });
    }
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchUncollect = () => {
    if (collectSelectedIds.size === 0) return;
    Taro.showModal({
      title: '取消收藏',
      content: `确定取消收藏 ${collectSelectedIds.size} 条消息吗？`,
      success: (res) => {
        if (res.confirm) {
          batchUncollect(Array.from(collectSelectedIds));
          setCollectSelectedIds(new Set());
          Taro.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  };

  const handleBatchExport = () => {
    if (collectSelectedIds.size === 0) {
      Taro.showToast({ title: '请先选择消息', icon: 'none' });
      return;
    }
    Taro.showToast({ title: `导出 ${collectSelectedIds.size} 条收藏`, icon: 'success' });
  };

  const handleBack = () => {
    setSelectedSession(null);
  };

  const pickReply = (targetId: string): string => {
    const tone = TONE_MAP[targetId] || 'default';
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
        content: pickReply(selectedSession!.targetId),
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
          onClick={() => {
            setActiveTab('chats');
            setSelectMode(false);
            setSelectedIds(new Set());
          }}
        >
          私聊列表
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'collects' && styles.active)}
          onClick={() => {
            setActiveTab('collects');
            setCollectSelectMode(false);
            setCollectSelectedIds(new Set());
          }}
        >
          消息收藏 ({collectedMessages.length})
        </Text>
      </View>

      {activeTab === 'chats' && (
        <View className={styles.chatListSection}>
          <View className={styles.subHeader}>
            <Text className={styles.subTitle}>
              {showArchive ? '📦 归档会话' : '💬 我的会话'}
              <Text className={styles.count}>{sessions.length}</Text>
            </Text>
            <View className={styles.subActions}>
              {!selectMode && (
                <Text className={styles.subAction} onClick={() => setShowArchive(!showArchive)}>
                  {showArchive ? '← 返回' : '📦 归档'}
                </Text>
              )}
              {sessions.length > 0 && (
                <Text
                  className={classnames(styles.subAction, selectMode && styles.active)}
                  onClick={() => {
                    setSelectMode(!selectMode);
                    setSelectedIds(new Set());
                  }}
                >
                  {selectMode ? '取消' : '多选'}
                </Text>
              )}
            </View>
          </View>

          {selectMode && selectedIds.size > 0 && (
            <View className={styles.batchBar}>
              <Text className={styles.batchInfo}>已选 {selectedIds.size} 项</Text>
              <View className={styles.batchActions}>
                <Text className={styles.batchBtn} onClick={handleArchive}>
                  {showArchive ? '↩ 恢复' : '📦 归档'}
                </Text>
                <Text
                  className={classnames(styles.batchBtn, styles.danger)}
                  onClick={() => {
                    Taro.showModal({
                      title: '批量删除',
                      content: `确定删除 ${selectedIds.size} 个会话吗？`,
                      success: (res) => {
                        if (res.confirm) {
                          Array.from(selectedIds).forEach((id) => deleteSession(id));
                          setSelectedIds(new Set());
                          setSelectMode(false);
                          Taro.showToast({ title: '已删除', icon: 'success' });
                        }
                      }
                    });
                  }}
                >
                  🗑 删除
                </Text>
              </View>
            </View>
          )}

          <ScrollView className={styles.chatList} scrollY>
            {sessions.map((session) => (
              <View
                key={session.id}
                className={classnames(
                  styles.sessionWrap,
                  session.isPinned && styles.pinned,
                  selectMode && styles.selectable,
                  selectedIds.has(session.targetId) && styles.selected
                )}
                onClick={() => handleSessionClick(session)}
                onLongPress={() => handleSessionLongPress(session)}
              >
                {selectMode && (
                  <View
                    className={classnames(
                      styles.checkbox,
                      selectedIds.has(session.targetId) && styles.checked
                    )}
                  >
                    <Text>{selectedIds.has(session.targetId) ? '✓' : ''}</Text>
                  </View>
                )}
                <MessageItem session={session} />
              </View>
            ))}
            {sessions.length === 0 && (
              <View className={styles.empty}>
                <Text className={styles.emptyIcon}>
                  {showArchive ? '📦' : '💬'}
                </Text>
                <Text className={styles.emptyText}>
                  {showArchive ? '暂无归档会话' : '还没有聊天记录，快去发现页找个AI聊天吧'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {activeTab === 'collects' && (
        <View className={styles.collectSection}>
          <View className={styles.subHeader}>
            <Text className={styles.subTitle}>
              ⭐ 我的收藏
              <Text className={styles.count}>{filteredCollected.length}</Text>
            </Text>
            <View className={styles.subActions}>
              {!collectSelectMode && filteredCollected.length > 0 && (
                <Text className={styles.subAction} onClick={handleBatchExport}>
                  📤 导出
                </Text>
              )}
              {filteredCollected.length > 0 && (
                <Text
                  className={classnames(styles.subAction, collectSelectMode && styles.active)}
                  onClick={() => {
                    setCollectSelectMode(!collectSelectMode);
                    setCollectSelectedIds(new Set());
                  }}
                >
                  {collectSelectMode ? '取消' : '多选'}
                </Text>
              )}
            </View>
          </View>

          <View className={styles.collectFilters}>
            <ScrollView className={styles.charFilter} scrollX>
              <View
                className={classnames(
                  styles.filterPill,
                  collectFilterChar === 'all' && styles.active
                )}
                onClick={() => setCollectFilterChar('all')}
              >
                <Text>全部角色</Text>
              </View>
              {collectedCharacters.map((c) => (
                <View
                  key={c.id}
                  className={classnames(
                    styles.filterPill,
                    collectFilterChar === c.id && styles.active
                  )}
                  onClick={() => setCollectFilterChar(c.id)}
                >
                  <Image className={styles.filterAvatar} src={c.avatar} mode='aspectFill' />
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
                    collectFilterTime === t.value && styles.active
                  )}
                  onClick={() => setCollectFilterTime(t.value)}
                >
                  {t.label}
                </Text>
              ))}
            </View>
          </View>

          {collectSelectMode && collectSelectedIds.size > 0 && (
            <View className={styles.batchBar}>
              <Text className={styles.batchInfo}>已选 {collectSelectedIds.size} 条</Text>
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

          <ScrollView className={styles.collectList} scrollY>
            {filteredCollected.length === 0 ? (
              <View className={styles.emptyCollect}>
                <Text className={styles.emptyIcon}>⭐</Text>
                <Text className={styles.emptyText}>还没有匹配的收藏消息</Text>
                <Text className={styles.emptyHint}>在聊天里点击气泡即可收藏</Text>
              </View>
            ) : (
              filteredCollected.map((msg) => (
                <View
                  key={msg.id}
                  className={classnames(
                    styles.collectCard,
                    collectSelectMode && styles.selectable,
                    collectSelectedIds.has(msg.id) && styles.selected
                  )}
                  onClick={() => collectSelectMode && toggleCollectSelect(msg.id)}
                >
                  {collectSelectMode && (
                    <View
                      className={classnames(
                        styles.checkbox,
                        collectSelectedIds.has(msg.id) && styles.checked
                      )}
                    >
                      <Text>{collectSelectedIds.has(msg.id) ? '✓' : ''}</Text>
                    </View>
                  )}
                  <View className={styles.collectMeta}>
                    <Image className={styles.collectAvatar} src={msg.senderAvatar} mode='aspectFill' />
                    <Text className={styles.collectName}>{msg.senderName}</Text>
                    <Text className={styles.collectTime}>{msg.timestamp}</Text>
                  </View>
                  <View className={styles.collectContent}>
                    <Text>{msg.content}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {actionSheetVisible && (
        <View
          className={styles.actionSheetMask}
          onClick={() => setActionSheetVisible(null)}
        >
          <View className={styles.actionSheet} onClick={(e) => e.stopPropagation()}>
            {!showArchive && (
              <View
                className={styles.actionItem}
                onClick={() => {
                  const s = chatSessions.find((x) => x.targetId === actionSheetVisible);
                  if (s) handlePin(s);
                }}
              >
                <Text>
                  📌{' '}
                  {chatSessions.find((s) => s.targetId === actionSheetVisible)?.isPinned
                    ? '取消置顶'
                    : '置顶会话'}
                </Text>
              </View>
            )}
            {!showArchive && (
              <View
                className={styles.actionItem}
                onClick={() => {
                  const s = chatSessions.find((x) => x.targetId === actionSheetVisible);
                  if (s) handleMarkUnread(s);
                }}
              >
                <Text>🔴 标为未读</Text>
              </View>
            )}
            <View
              className={styles.actionItem}
              onClick={() => {
                const s = chatSessions.find((x) => x.targetId === actionSheetVisible);
                if (s) {
                  if (s.isArchived) {
                    unarchiveSessions([s.targetId]);
                    Taro.showToast({ title: '已恢复', icon: 'success' });
                  } else {
                    archiveSessions([s.targetId]);
                    Taro.showToast({ title: '已归档', icon: 'success' });
                  }
                  setActionSheetVisible(null);
                }
              }}
            >
              <Text>{showArchive ? '↩ 恢复会话' : '📦 归档会话'}</Text>
            </View>
            <View
              className={classnames(styles.actionItem, styles.danger)}
              onClick={() => {
                const s = chatSessions.find((x) => x.targetId === actionSheetVisible);
                if (s) handleDelete(s);
              }}
            >
              <Text>🗑️ 删除会话</Text>
            </View>
            <View
              className={classnames(styles.actionItem, styles.cancel)}
              onClick={() => setActionSheetVisible(null)}
            >
              <Text>取消</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.fab} onClick={handleStartNewChat}>
        <Text>+</Text>
      </View>
    </View>
  );
};

export default ChatPage;
