import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import RoomCard from '@/components/RoomCard';
import ChatBubble from '@/components/ChatBubble';
import { mockRooms } from '@/data/rooms';
import { mockCharacters } from '@/data/characters';
import { mockMessages } from '@/data/messages';
import { Room, Message } from '@/types';
import classnames from 'classnames';

const filters = ['全部', '热门', '进行中', '文学', '科技', '娱乐', '生活'];

const RoomPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [frequency, setFrequency] = useState<'low' | 'medium' | 'high'>('medium');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomMessages, setRoomMessages] = useState<Message[]>(mockMessages);
  const [isSpectator, setIsSpectator] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    frequency: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    if (selectedRoom && selectedRoom.status === 'active') {
      const interval = setInterval(() => {
        const randomChar = mockCharacters[Math.floor(Math.random() * mockCharacters.length)];
        const replies = [
          '这个话题很有意思呢~',
          '我觉得可以从另一个角度来看',
          '哈哈哈你说得太对了！',
          '让我想想这个问题...',
          '确实如此，我也这么认为'
        ];
        const newMsg: Message = {
          id: `room-msg-${Date.now()}`,
          senderId: randomChar.id,
          senderName: randomChar.name,
          senderAvatar: randomChar.avatar,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          isAI: true,
          type: 'text'
        };
        setRoomMessages(prev => [...prev.slice(-30), newMsg]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setFrequency(room.autoFrequency);
  };

  const handleBack = () => {
    setSelectedRoom(null);
    setRoomMessages(mockMessages);
    setIsSpectator(false);
  };

  const handleJoinRoom = () => {
    setIsSpectator(true);
    Taro.showToast({ title: '已加入旁听', icon: 'success' });
  };

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      Taro.showToast({ title: '请输入房间名称', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '房间创建成功', icon: 'success' });
    setShowCreateModal(false);
    setNewRoom({ name: '', description: '', frequency: 'medium' });
  };

  if (selectedRoom) {
    return (
      <View className={styles.roomDetail}>
        <View className={styles.roomHeader}>
          <Text className={styles.backBtn} onClick={handleBack}>←</Text>
          <Text className={styles.roomTitle}>{selectedRoom.name}</Text>
          <Text className={styles.roomDesc}>{selectedRoom.description}</Text>
          <View className={styles.roomStats}>
            <View className={styles.stat}>
              <Text>👥</Text>
              <Text>{selectedRoom.participantCount} 位角色</Text>
            </View>
            <View className={styles.stat}>
              <Text>👁️</Text>
              <Text>{selectedRoom.spectatorCount} 人旁听</Text>
            </View>
            <View className={styles.stat}>
              <Text>{selectedRoom.status === 'active' ? '🟢' : '⏸️'}</Text>
              <Text>{selectedRoom.status === 'active' ? '进行中' : '已暂停'}</Text>
            </View>
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

        <ScrollView className={styles.chatArea} scrollY scrollIntoView={`rmsg-${roomMessages.length - 1}`}>
          {roomMessages.map((msg, idx) => (
            <View key={msg.id} id={`rmsg-${idx}`}>
              <ChatBubble message={msg} showName={msg.isAI} />
            </View>
          ))}
        </ScrollView>

        <View className={styles.frequencyBar}>
          <Text className={styles.freqLabel}>发言频率</Text>
          <View className={styles.freqOptions}>
            {(['low', 'medium', 'high'] as const).map((freq) => (
              <Text
                key={freq}
                className={classnames(styles.freqBtn, frequency === freq && styles.active)}
                onClick={() => setFrequency(freq)}
              >
                {freq === 'low' ? '低频' : freq === 'medium' ? '中频' : '高频'}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.spectatorBar}>
          <Text className={styles.spectatorInfo}>
            👁️ <Text className={styles.spectatorNum}>{selectedRoom.spectatorCount + (isSpectator ? 1 : 0)}</Text> 人正在旁听
          </Text>
          <View className={styles.joinBtn} onClick={handleJoinRoom}>
            <Text>{isSpectator ? '已旁听' : '加入旁听'}</Text>
          </View>
        </View>
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
        {mockRooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={() => handleRoomClick(room)} />
        ))}
      </ScrollView>

      <View className={styles.fab} onClick={() => setShowCreateModal(true)}>
        <Text>+</Text>
      </View>

      {showCreateModal && (
        <View className={styles.createModal} onClick={() => setShowCreateModal(false)}>
          <View className={styles.createContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.createHeader}>
              <Text className={styles.createTitle}>创建房间</Text>
              <Text className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>✕</Text>
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
              <Text className={styles.formLabel}>自动发言频率</Text>
              <View className={styles.freqSelect}>
                {(['low', 'medium', 'high'] as const).map((freq) => (
                  <View
                    key={freq}
                    className={classnames(styles.freqOption, newRoom.frequency === freq && styles.active)}
                    onClick={() => setNewRoom({ ...newRoom, frequency: freq })}
                  >
                    <Text className={styles.freqOptionName}>
                      {freq === 'low' ? '低频' : freq === 'medium' ? '中频' : '高频'}
                    </Text>
                    <Text className={styles.freqOptionDesc}>
                      {freq === 'low' ? '间隔较长' : freq === 'medium' ? '适中节奏' : '快速对话'}
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
