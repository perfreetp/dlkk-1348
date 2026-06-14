import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import RoomCard from '@/components/RoomCard';
import ChatBubble from '@/components/ChatBubble';
import { mockCharacters } from '@/data/characters';
import { Room, Message, Character } from '@/types';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';

const filters = ['全部', '热门', '进行中', '文学', '科技', '娱乐', '生活'];

const FREQ_INTERVAL: Record<Room['autoFrequency'], number> = {
  low: 8000,
  medium: 3500,
  high: 1200
};

interface TopicReply {
  topic: string;
  direction: string;
  replies: Record<string, string[]>;
}

const TOPIC_REPLIES: TopicReply[] = [
  {
    topic: '人工智能的未来',
    direction: '技术趋势 · 社会影响',
    replies: {
      default: [
        '我觉得AI未来会在更多领域发挥作用呢~',
        'AI会不会有一天真的能理解人类情感？',
        '这个话题很有深度，让我想想...',
        '从技术角度来看，还有很长的路要走',
        'AI的发展速度真的超出想象！'
      ]
    }
  },
  {
    topic: '人生意义探讨',
    direction: '哲学思辨 · 生活感悟',
    replies: {
      default: [
        '我觉得人生的意义在于体验和成长~',
        '每个人的答案可能都不一样吧',
        '这个问题太深奥了，让我沉思一下...',
        '活在当下可能就是最好的答案',
        '寻找意义本身就是一种意义吧'
      ]
    }
  },
  {
    topic: '日常趣事分享',
    direction: '轻松幽默 · 生活点滴',
    replies: {
      default: [
        '哈哈哈今天我遇到一件超好笑的事！',
        '生活中处处都是小确幸呢~',
        '说到趣事我就来劲了！',
        '平凡的日子也能闪闪发光',
        '你最近有什么有趣的事吗？'
      ]
    }
  },
  {
    topic: '科技前沿讨论',
    direction: '技术探索 · 创新突破',
    replies: {
      default: [
        '最新的技术发展真的很让人期待啊',
        '量子计算会不会是下一个突破口？',
        '从工程角度来说，这个实现起来有难度',
        '科技发展永远让人热血沸腾！',
        '我对这个方向很感兴趣~'
      ]
    }
  },
  {
    topic: '美食文化交流',
    direction: '饮食文化 · 舌尖体验',
    replies: {
      default: [
        '说到美食我就精神了！',
        '不同地方的美食真的各有特色~',
        '这道菜怎么做的？教教我！',
        '美食是跨越语言的文化呀~',
        '好想去尝尝正宗的味道！'
      ]
    }
  },
  {
    topic: '文学作品漫谈',
    direction: '文学鉴赏 · 思想共鸣',
    replies: {
      default: [
        '最近在读一本很有意思的书~',
        '文学真的能触动人心啊',
        '这本小说的情节设计太棒了！',
        '经典作品果然经得起时间考验',
        '每次重读都有新的感悟~'
      ]
    }
  }
];

const defaultReplies = [
  '这个话题很有意思呢~',
  '我觉得可以从另一个角度来看',
  '哈哈哈你说得太对了！',
  '让我想想这个问题...',
  '确实如此，我也这么认为'
];

const RoomPage: React.FC = () => {
  const {
    rooms,
    addRoom,
    updateRoomFrequency,
    toggleRoomStatus,
    setRoomCurrentTopic,
    setTopicDuration,
    setRoomPhase,
    startVote,
    castVote,
    endVote,
    getRoomMessages,
    appendRoomMessage,
    setRoomReadPosition,
    getRoomReadPosition
  } = useAppStore();

  const [activeFilter, setActiveFilter] = useState('全部');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [frequency, setFrequency] = useState<'low' | 'medium' | 'high'>('medium');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [isSpectator, setIsSpectator] = useState(false);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [newMsgBadge, setNewMsgBadge] = useState(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    frequency: 'medium' as 'low' | 'medium' | 'high',
    topic: '人工智能的未来'
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<any>(null);
  const isAtBottomRef = useRef(true);
  const roomRef = useRef<Room | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    roomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    messagesRef.current = roomMessages;
  }, [roomMessages]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const clearVoteTimer = useCallback(() => {
    if (voteTimerRef.current) {
      clearInterval(voteTimerRef.current);
      voteTimerRef.current = null;
    }
  }, []);

  const getRandomReply = (topic?: string): string => {
    const topicData = TOPIC_REPLIES.find((t) => t.topic === topic);
    const pool = topicData?.replies.default || defaultReplies;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const startCountdown = useCallback((durationMin: number) => {
    setCountdown(durationMin * 60);
    clearCountdown();
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  const formatCountdown = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCurrentDirection = (topic?: string): string => {
    const t = TOPIC_REPLIES.find((x) => x.topic === topic);
    return t?.direction || '';
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atBottom = scrollHeight - scrollTop - clientHeight < 80;
    isAtBottomRef.current = atBottom;
    if (atBottom && newMsgBadge > 0) {
      setNewMsgBadge(0);
    }
  };

  const scrollToBottom = useCallback(() => {
    const msgs = messagesRef.current;
    if (msgs.length > 0) {
      const lastId = `rmsg-${msgs[msgs.length - 1].id}`;
      setScrollIntoViewId(lastId);
      setNewMsgBadge(0);
      isAtBottomRef.current = true;
      setTimeout(() => setScrollIntoViewId(''), 300);
    }
  }, []);

  const saveReadPosition = useCallback(() => {
    const room = roomRef.current;
    if (!room || !isSpectator) return;
    const msgs = messagesRef.current;
    if (msgs.length === 0) return;

    if (isAtBottomRef.current) {
      const lastMsg = msgs[msgs.length - 1];
      setRoomReadPosition(room.id, lastMsg.id);
    } else {
      const readCount = msgs.length - newMsgBadge;
      const safeIdx = Math.max(0, Math.min(readCount - 1, msgs.length - 1));
      const readMsg = msgs[safeIdx];
      if (readMsg) {
        setRoomReadPosition(room.id, readMsg.id);
      }
    }
  }, [isSpectator, newMsgBadge, setRoomReadPosition]);

  const restoreReadPosition = useCallback((roomId: string, msgs: Message[]) => {
    const savedId = getRoomReadPosition(roomId);
    if (!savedId) {
      hasRestoredRef.current = true;
      return false;
    }
    const idx = msgs.findIndex((m) => m.id === savedId);
    if (idx === -1) {
      hasRestoredRef.current = true;
      return false;
    }
    const targetId = `rmsg-${msgs[idx].id}`;
    setTimeout(() => {
      setScrollIntoViewId(targetId);
      hasRestoredRef.current = true;
      setTimeout(() => setScrollIntoViewId(''), 500);
    }, 100);
    return true;
  }, [getRoomReadPosition]);

  useEffect(() => {
    clearTimer();
    const room = roomRef.current;
    if (!room) return;
    if (room.status !== 'active' || room.phase === 'voting') return;

    const interval = FREQ_INTERVAL[frequency];
    timerRef.current = setInterval(() => {
      const currentRoom = roomRef.current;
      if (!currentRoom || currentRoom.status !== 'active' || currentRoom.phase === 'voting') {
        return;
      }

      const randomChar =
        currentRoom.participants[
          Math.floor(Math.random() * currentRoom.participants.length)
        ] || mockCharacters[Math.floor(Math.random() * mockCharacters.length)];

      const isHighlight = Math.random() < 0.12;
      const newMsg: Message = {
        id: `room-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        roomId: currentRoom.id,
        senderId: randomChar.id,
        senderName: randomChar.name,
        senderAvatar: randomChar.avatar,
        content: getRandomReply(currentRoom.currentTopic),
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        isAI: true,
        type: 'text',
        isHighlighted: isHighlight
      };

      appendRoomMessage(currentRoom.id, newMsg);
      setRoomMessages((prev) => {
        const next = [...prev, newMsg];
        messagesRef.current = next.slice(-120);
        return messagesRef.current;
      });

      if (!isAtBottomRef.current) {
        setNewMsgBadge((prev) => prev + 1);
      } else {
        setTimeout(() => {
          setScrollIntoViewId(`rmsg-${newMsg.id}`);
          setTimeout(() => setScrollIntoViewId(''), 200);
        }, 10);
      }
    }, interval);

    return () => clearTimer();
  }, [selectedRoom?.id, selectedRoom?.status, selectedRoom?.phase, frequency, clearTimer, appendRoomMessage]);

  useEffect(() => {
    if (selectedRoom && selectedRoom.topicDuration && selectedRoom.phase === 'discussing') {
      const elapsed = Math.floor((Date.now() - (selectedRoom.topicStartTime || Date.now())) / 1000);
      const remaining = selectedRoom.topicDuration * 60 - elapsed;
      if (remaining > 0) {
        startCountdown(Math.ceil(remaining / 60));
      }
    }
    return () => clearCountdown();
  }, [selectedRoom?.id, selectedRoom?.phase, selectedRoom?.topicDuration, selectedRoom?.topicStartTime, startCountdown, clearCountdown]);

  const filteredRooms = rooms.filter((room) => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '热门') return !!room.isHot;
    if (activeFilter === '进行中') return room.status === 'active';
    return room.topics.some((t) => t.includes(activeFilter));
  });

  const handleRoomClick = (room: Room) => {
    hasRestoredRef.current = false;
    setSelectedRoom(room);
    setFrequency(room.autoFrequency);
    const stored = getRoomMessages(room.id);
    const initMessages: Message[] =
      stored.length > 0
        ? stored
        : (() => {
            const msgs: Message[] = [];
            if (room.currentTopic) {
              msgs.push({
                id: `topic-${room.id}`,
                roomId: room.id,
                senderId: 'system',
                senderName: '系统',
                senderAvatar: '',
                content: `当前话题：${room.currentTopic}`,
                timestamp: '—',
                isAI: false,
                type: 'topic'
              });
            }
            for (let i = 0; i < 6; i++) {
              const c =
                room.participants[i % room.participants.length] ||
                mockCharacters[i % mockCharacters.length];
              msgs.push({
                id: `init-${room.id}-${i}`,
                roomId: room.id,
                senderId: c.id,
                senderName: c.name,
                senderAvatar: c.avatar,
                content: getRandomReply(room.currentTopic),
                timestamp: new Date(Date.now() - (6 - i) * 60000).toLocaleTimeString().slice(0, 5),
                isAI: true,
                type: 'text'
              } as Message);
            }
            return msgs;
          })();

    setRoomMessages(initMessages);
    messagesRef.current = initMessages;
    setIsSpectator(false);
    setNewMsgBadge(0);

    restoreReadPosition(room.id, initMessages);
  };

  const handleBack = () => {
    saveReadPosition();
    clearTimer();
    clearCountdown();
    clearVoteTimer();
    setSelectedRoom(null);
    setRoomMessages([]);
    messagesRef.current = [];
    setIsSpectator(false);
    setShowTopicPicker(false);
    setShowDurationPicker(false);
    setNewMsgBadge(0);
    setScrollIntoViewId('');
    hasRestoredRef.current = false;
  };

  const handleJoinRoom = () => {
    setIsSpectator(true);
    Taro.showToast({ title: '已加入旁听', icon: 'success' });
    setTimeout(scrollToBottom, 200);
  };

  const handleFrequencyChange = (freq: 'low' | 'medium' | 'high') => {
    setFrequency(freq);
    if (selectedRoom) {
      updateRoomFrequency(selectedRoom.id, freq);
      setSelectedRoom({ ...selectedRoom, autoFrequency: freq });
    }
  };

  const handleToggleStatus = () => {
    if (!selectedRoom) return;
    const newStatus = selectedRoom.status === 'active' ? 'paused' : 'active';
    toggleRoomStatus(selectedRoom.id);
    setSelectedRoom({ ...selectedRoom, status: newStatus });
    Taro.showToast({
      title: newStatus === 'active' ? '已恢复讨论' : '已暂停讨论',
      icon: 'none'
    });
  };

  const handlePickTopic = (topic: string) => {
    if (!selectedRoom) return;
    setRoomCurrentTopic(selectedRoom.id, topic);
    const updated = { ...selectedRoom, currentTopic: topic, topicStartTime: Date.now() };
    setSelectedRoom(updated);
    const systemMsg: Message = {
      id: `topic-change-${Date.now()}`,
      roomId: selectedRoom.id,
      senderId: 'system',
      senderName: '系统',
      senderAvatar: '',
      content: `💡 话题已切换为：${topic}`,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      isAI: false,
      type: 'topic'
    };
    setRoomMessages((prev) => {
      const next = [...prev, systemMsg];
      messagesRef.current = next;
      return next;
    });
    appendRoomMessage(selectedRoom.id, systemMsg);
    setShowTopicPicker(false);
    if (selectedRoom.topicDuration) {
      startCountdown(selectedRoom.topicDuration);
    }
    if (isAtBottomRef.current) {
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleSetDuration = (min: number) => {
    if (!selectedRoom) return;
    setTopicDuration(selectedRoom.id, min);
    setSelectedRoom({ ...selectedRoom, topicDuration: min, topicStartTime: Date.now() });
    startCountdown(min);
    setShowDurationPicker(false);
    Taro.showToast({ title: `话题时长设为 ${min} 分钟`, icon: 'success' });
  };

  const handleStartVote = () => {
    if (!selectedRoom) return;
    const options = TOPIC_REPLIES.filter((t) => t.topic !== selectedRoom.currentTopic)
      .slice(0, 4)
      .map((t) => t.topic);

    startVote(selectedRoom.id, options);
    const updated = {
      ...selectedRoom,
      phase: 'voting' as const,
      voteOptions: options,
      voteResults: options.reduce((acc, o) => ({ ...acc, [o]: 0 }), {})
    };
    setSelectedRoom(updated);
    setRoomPhase(selectedRoom.id, 'voting');

    const voteMsg: Message = {
      id: `vote-start-${Date.now()}`,
      roomId: selectedRoom.id,
      senderId: 'system',
      senderName: '系统',
      senderAvatar: '',
      content: '🗳 下一话题投票开始！',
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      isAI: false,
      type: 'vote'
    };
    setRoomMessages((prev) => {
      const next = [...prev, voteMsg];
      messagesRef.current = next;
      return next;
    });
    appendRoomMessage(selectedRoom.id, voteMsg);

    if (isAtBottomRef.current) {
      setTimeout(scrollToBottom, 50);
    }

    clearVoteTimer();
    let count = 0;
    const total = updated.participants.length * 2;
    voteTimerRef.current = setInterval(() => {
      if (count >= total) {
        clearVoteTimer();
        setTimeout(() => handleEndVote(), 800);
        return;
      }
      const option = options[Math.floor(Math.random() * options.length)];
      castVote(updated.id, option);
      setSelectedRoom((prev) => {
        if (!prev) return prev;
        const results = { ...prev.voteResults };
        results[option] = (results[option] || 0) + 1;
        return { ...prev, voteResults: results };
      });
      count++;
    }, 500);
  };

  const handleEndVote = () => {
    clearVoteTimer();
    const room = roomRef.current;
    if (!room) return;

    const { winner, maxVotes } = endVote(room.id);
    if (!winner) return;

    const resultMsg: Message = {
      id: `vote-result-${Date.now()}`,
      roomId: room.id,
      senderId: 'system',
      senderName: '系统',
      senderAvatar: '',
      content: `🎉 投票结束！「${winner}」以 ${maxVotes} 票胜出`,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      isAI: false,
      type: 'vote'
    };
    setRoomMessages((prev) => {
      const next = [...prev, resultMsg];
      messagesRef.current = next;
      return next;
    });
    appendRoomMessage(room.id, resultMsg);

    setTimeout(() => {
      const currentRoom = roomRef.current;
      if (!currentRoom) return;

      setRoomCurrentTopic(currentRoom.id, winner);
      setRoomPhase(currentRoom.id, 'discussing');
      setSelectedRoom((prev) =>
        prev
          ? {
              ...prev,
              phase: 'discussing',
              currentTopic: winner,
              topicStartTime: Date.now(),
              voteOptions: undefined,
              voteResults: undefined
            }
          : prev
      );

      const topicMsg: Message = {
        id: `topic-switch-${Date.now()}`,
        roomId: currentRoom.id,
        senderId: 'system',
        senderName: '系统',
        senderAvatar: '',
        content: `💡 新话题：${winner}`,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        isAI: false,
        type: 'topic'
      };
      setRoomMessages((prev) => {
        const next = [...prev, topicMsg];
        messagesRef.current = next;
        return next;
      });
      appendRoomMessage(currentRoom.id, topicMsg);

      if (currentRoom.topicDuration) {
        startCountdown(currentRoom.topicDuration);
      }

      if (isAtBottomRef.current) {
        setTimeout(scrollToBottom, 50);
      }
    }, 1200);
  };

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      Taro.showToast({ title: '请输入房间名称', icon: 'none' });
      return;
    }
    const roomId = `room-user-${Date.now()}`;
    const participants = [mockCharacters[0], mockCharacters[3], mockCharacters[1]];
    const createdRoom: Room = {
      id: roomId,
      name: newRoom.name.trim(),
      cover: `https://picsum.photos/seed/${roomId}/750/400`,
      description: newRoom.description.trim() || '一个有趣的AI对话房间',
      participants,
      participantCount: participants.length,
      spectatorCount: 0,
      autoFrequency: newRoom.frequency,
      topics: [newRoom.topic, '自定义房间'],
      currentTopic: newRoom.topic,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      isHot: false,
      isOwner: true,
      phase: 'discussing'
    };
    addRoom(createdRoom);
    Taro.showToast({ title: '房间创建成功', icon: 'success' });
    setShowCreateModal(false);
    setNewRoom({ name: '', description: '', frequency: 'medium', topic: '人工智能的未来' });
    setTimeout(() => handleRoomClick(createdRoom), 300);
  };

  if (selectedRoom) {
    const isVoting = selectedRoom.phase === 'voting';
    const direction = getCurrentDirection(selectedRoom.currentTopic);

    return (
      <View className={styles.roomDetail}>
        <View className={styles.roomHeader}>
          <Text className={styles.backBtn} onClick={handleBack}>
            ←
          </Text>
          <Text className={styles.roomTitle}>{selectedRoom.name}</Text>
          <Text className={styles.roomDesc}>{selectedRoom.description}</Text>
          <View className={styles.roomStats}>
            <View className={styles.stat}>
              <Text>👥</Text>
              <Text>{selectedRoom.participantCount} 位角色</Text>
            </View>
            <View className={styles.stat}>
              <Text>👁️</Text>
              <Text>{selectedRoom.spectatorCount + (isSpectator ? 1 : 0)} 人旁听</Text>
            </View>
            <View className={styles.stat}>
              <Text>{selectedRoom.status === 'active' ? '🟢' : '⏸️'}</Text>
              <Text>{selectedRoom.status === 'active' ? '进行中' : '已暂停'}</Text>
            </View>
          </View>
          {selectedRoom.isOwner && (
            <View className={styles.ownerBadge}>
              <Text>👑 房主</Text>
            </View>
          )}
        </View>

        <View className={styles.phaseBar}>
          <View className={styles.phaseInfo}>
            <View className={classnames(styles.phaseTag, isVoting && styles.voting)}>
              <Text>{isVoting ? '🗳 投票阶段' : '💬 讨论阶段'}</Text>
            </View>
            {!isVoting && countdown > 0 && (
              <View className={styles.countdown}>
                <Text className={styles.countdownIcon}>⏱</Text>
                <Text className={styles.countdownText}>{formatCountdown(countdown)}</Text>
              </View>
            )}
            {direction && !isVoting && (
              <View className={styles.directionTag}>
                <Text>🎯 {direction}</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.participantsBar}>
          <Text className={styles.participantsTitle}>参与角色</Text>
          <ScrollView className={styles.participantsList} scrollX>
            {selectedRoom.participants.map((p) => (
              <View key={p.id} className={styles.participantItem}>
                <Image className={styles.participantAvatar} src={p.avatar} mode='aspectFill' />
                <Text className={styles.participantName}>{p.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {selectedRoom.currentTopic && (
          <View className={styles.currentTopicBar}>
            <Text className={styles.topicLabel}>💡 当前话题</Text>
            <Text className={styles.topicText}>{selectedRoom.currentTopic}</Text>
            {selectedRoom.isOwner && !isVoting && (
              <View className={styles.topicActions}>
                <Text className={styles.topicAction} onClick={() => setShowDurationPicker(true)}>
                  ⏱ {selectedRoom.topicDuration ? `${selectedRoom.topicDuration}分` : '时长'}
                </Text>
                <Text className={styles.changeTopicBtn} onClick={() => setShowTopicPicker(true)}>
                  切换
                </Text>
              </View>
            )}
          </View>
        )}

        {isVoting && selectedRoom.voteOptions && (
          <View className={styles.votePanel}>
            <Text className={styles.voteTitle}>🗳 下一话题投票</Text>
            <View className={styles.voteOptions}>
              {selectedRoom.voteOptions.map((opt) => {
                const votes = selectedRoom.voteResults?.[opt] || 0;
                const total =
                  Object.values(selectedRoom.voteResults || {}).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((votes / total) * 100);
                return (
                  <View key={opt} className={styles.voteOption}>
                    <View className={styles.voteOptionBar}>
                      <View
                        className={styles.voteOptionFill}
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                    <View className={styles.voteOptionInfo}>
                      <Text className={styles.voteOptionName}>{opt}</Text>
                      <Text className={styles.voteOptionCount}>{votes} 票 · {pct}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <ScrollView
          className={styles.chatArea}
          scrollY
          ref={scrollRef}
          onScroll={handleScroll}
          scrollIntoView={scrollIntoViewId || undefined}
          scrollWithAnimation
        >
          {selectedRoom.status === 'paused' && (
            <View className={styles.pausedHint}>
              <Text>⏸️ 房间已暂停，AI 角色暂时停止发言</Text>
            </View>
          )}
          {roomMessages.map((msg) => (
            <View key={msg.id} id={`rmsg-${msg.id}`} className={styles.msgWrapper}>
              {msg.type === 'topic' ? (
                <View className={styles.topicMsg}>
                  <Text>{msg.content}</Text>
                </View>
              ) : msg.type === 'vote' ? (
                <View className={styles.voteMsg}>
                  <Text>{msg.content}</Text>
                </View>
              ) : (
                <ChatBubble
                  message={msg}
                  showName={msg.isAI}
                  highlight={msg.isHighlighted}
                />
              )}
              {msg.isHighlighted && (
                <View className={styles.highlightBadge}>
                  <Text>✨ 关键发言</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {newMsgBadge > 0 && isSpectator && (
          <View className={styles.newMsgBadge} onClick={scrollToBottom}>
            <Text>↓ {newMsgBadge} 条新消息</Text>
          </View>
        )}

        {selectedRoom.isOwner && (
          <View className={styles.ownerBar}>
            <View className={styles.frequencySection}>
              <Text className={styles.freqLabel}>发言频率</Text>
              <View className={styles.freqOptions}>
                {(['low', 'medium', 'high'] as const).map((freq) => (
                  <Text
                    key={freq}
                    className={classnames(styles.freqBtn, frequency === freq && styles.active)}
                    onClick={() => handleFrequencyChange(freq)}
                  >
                    {freq === 'low' ? '低频' : freq === 'medium' ? '中频' : '高频'}
                  </Text>
                ))}
              </View>
            </View>
            <View className={styles.ownerActions}>
              {!isVoting && (
                <Text className={styles.ownerActionBtn} onClick={handleStartVote}>
                  🗳 发起投票
                </Text>
              )}
              {isVoting && (
                <Text className={styles.ownerActionBtn} onClick={handleEndVote}>
                  ✅ 结束投票
                </Text>
              )}
              <View
                className={classnames(
                  styles.statusBtn,
                  selectedRoom.status === 'paused' && styles.resume
                )}
                onClick={handleToggleStatus}
              >
                <Text>{selectedRoom.status === 'active' ? '⏸ 暂停' : '▶ 恢复'}</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.spectatorBar}>
          <Text className={styles.spectatorInfo}>
            👁️{' '}
            <Text className={styles.spectatorNum}>
              {selectedRoom.spectatorCount + (isSpectator ? 1 : 0)}
            </Text>{' '}
            人正在旁听
          </Text>
          <View className={classnames(styles.joinBtn, isSpectator && styles.joined)} onClick={handleJoinRoom}>
            <Text>{isSpectator ? '已旁听' : '加入旁听'}</Text>
          </View>
        </View>

        {showTopicPicker && selectedRoom.isOwner && (
          <View className={styles.topicPickerMask} onClick={() => setShowTopicPicker(false)}>
            <View className={styles.topicPicker} onClick={(e) => e.stopPropagation()}>
              <Text className={styles.pickerTitle}>选择话题</Text>
              {TOPIC_REPLIES.map((t) => (
                <View
                  key={t.topic}
                  className={classnames(
                    styles.topicOption,
                    selectedRoom.currentTopic === t.topic && styles.active
                  )}
                  onClick={() => handlePickTopic(t.topic)}
                >
                  <Text className={styles.topicOptionText}>{t.topic}</Text>
                  <Text className={styles.topicOptionDesc}>{t.direction}</Text>
                </View>
              ))}
              <View className={styles.topicOption} onClick={() => setShowTopicPicker(false)}>
                <Text className={styles.topicCancel}>取消</Text>
              </View>
            </View>
          </View>
        )}

        {showDurationPicker && selectedRoom.isOwner && (
          <View className={styles.topicPickerMask} onClick={() => setShowDurationPicker(false)}>
            <View className={styles.topicPicker} onClick={(e) => e.stopPropagation()}>
              <Text className={styles.pickerTitle}>设置话题时长</Text>
              {[5, 10, 15, 20, 30, 45, 60].map((min) => (
                <View
                  key={min}
                  className={classnames(
                    styles.topicOption,
                    selectedRoom.topicDuration === min && styles.active
                  )}
                  onClick={() => handleSetDuration(min)}
                >
                  <Text className={styles.topicOptionText}>{min} 分钟</Text>
                </View>
              ))}
              <View className={styles.topicOption} onClick={() => setShowDurationPicker(false)}>
                <Text className={styles.topicCancel}>取消</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>
          <Text className='gradientText'>AI 房间</Text>
        </Text>
        <Text className={styles.subtitle}>围观 AI 们的精彩对话</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input className={styles.searchInput} placeholder='搜索房间...' />
      </View>

      <ScrollView className={styles.filterRow} scrollX>
        {filters.map((f) => (
          <Text
            key={f}
            className={classnames(styles.filterChip, activeFilter === f && styles.active)}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </Text>
        ))}
      </ScrollView>

      <ScrollView className={styles.roomList} scrollY>
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={() => handleRoomClick(room)} />
        ))}
        {filteredRooms.length === 0 && (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🚪</Text>
            <Text className={styles.emptyText}>暂无房间，点击右下角创建吧</Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.fab} onClick={() => setShowCreateModal(true)}>
        <Text>+</Text>
      </View>

      {showCreateModal && (
        <View className={styles.createModal} onClick={() => setShowCreateModal(false)}>
          <View className={styles.createContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.createHeader}>
              <Text className={styles.createTitle}>创建房间</Text>
              <Text className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                ✕
              </Text>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>房间名称</Text>
              <Input
                className={styles.formInput}
                placeholder='给你的房间起个名字'
                value={newRoom.name}
                onInput={(e) => setNewRoom({ ...newRoom, name: e.detail.value })}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>房间描述</Text>
              <Input
                className={styles.formTextarea}
                placeholder='介绍一下这个房间的主题...'
                value={newRoom.description}
                onInput={(e) => setNewRoom({ ...newRoom, description: e.detail.value })}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>初始话题</Text>
              <ScrollView className={styles.topicScroll} scrollX>
                {TOPIC_REPLIES.map((t) => (
                  <View
                    key={t.topic}
                    className={classnames(
                      styles.topicPill,
                      newRoom.topic === t.topic && styles.active
                    )}
                    onClick={() => setNewRoom({ ...newRoom, topic: t.topic })}
                  >
                    <Text>{t.topic}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>自动发言频率</Text>
              <View className={styles.freqSelect}>
                {(['low', 'medium', 'high'] as const).map((freq) => (
                  <View
                    key={freq}
                    className={classnames(
                      styles.freqOption,
                      newRoom.frequency === freq && styles.active
                    )}
                    onClick={() => setNewRoom({ ...newRoom, frequency: freq })}
                  >
                    <Text className={styles.freqOptionName}>
                      {freq === 'low' ? '低频' : freq === 'medium' ? '中频' : '高频'}
                    </Text>
                    <Text className={styles.freqOptionDesc}>
                      {freq === 'low'
                        ? '间隔约8秒'
                        : freq === 'medium'
                          ? '间隔约3.5秒'
                          : '间隔约1秒'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.submitBtn} onClick={handleCreateRoom}>
              <Text>创建房间</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RoomPage;
