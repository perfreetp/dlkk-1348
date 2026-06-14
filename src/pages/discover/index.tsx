import React from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { eventCenter } from '@tarojs/taro';
import styles from './index.module.scss';
import CharacterCard from '@/components/CharacterCard';
import TopicCard from '@/components/TopicCard';
import RoomCard from '@/components/RoomCard';
import { mockCharacters } from '@/data/characters';
import { mockTopics } from '@/data/topics';
import { useAppStore } from '@/store/appStore';
import { Character, ChatSession } from '@/types';

const DiscoverPage: React.FC = () => {
  const { rooms, addChatSession, chatSessions, blockedUsers } = useAppStore();
  const visibleCharacters = mockCharacters.filter((c) => !blockedUsers.includes(c.id));

  const handleCreateRole = () => {
    Taro.navigateTo({ url: '/pages/create/index' });
  };

  const handleCharacterClick = (char: Character) => {
    const exists = chatSessions.find((s) => s.targetId === char.id);
    if (!exists) {
      const session: ChatSession = {
        id: `session-${char.id}-${Date.now()}`,
        targetId: char.id,
        targetName: char.name,
        targetAvatar: char.avatar,
        lastMessage: `你好呀~ 我是${char.name}，很高兴认识你！`,
        lastTime: '刚刚',
        unreadCount: 0,
        isAI: true
      };
      addChatSession(session);
    }
    eventCenter.trigger('openChatWith', char.id);
    Taro.switchTab({ url: '/pages/chat/index' });
  };

  const handleTopicUse = (title: string) => {
    Taro.showToast({ title: `使用话题：${title}`, icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>
          <Text className='gradientText'>发现</Text>
        </Text>
        <Text className={styles.subtitle}>探索更多有趣的 AI 角色和房间</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input className={styles.searchInput} placeholder='搜索角色、房间、话题...' />
      </View>

      <View className={styles.banner} onClick={handleCreateRole}>
        <View className={styles.bannerDecoration} />
        <Text className={styles.bannerTitle}>✨ 创建你的 AI 角色</Text>
        <Text className={styles.bannerDesc}>自定义人设、语气，打造独一无二的 AI 伙伴</Text>
        <View className={styles.bannerBtn}>
          <Text>立即创建 →</Text>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🌟 热门 AI 角色</Text>
            <Text className={styles.moreBtn}>查看更多 →</Text>
          </View>
          <View className={styles.hotCharacters}>
            {visibleCharacters.slice(0, 4).map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onClick={() => handleCharacterClick(char)}
              />
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>💡 热门话题</Text>
            <Text className={styles.moreBtn}>更多话题 →</Text>
          </View>
          <ScrollView className={styles.topicsRow} scrollX>
            {mockTopics.map((topic) => (
              <View key={topic.id} className={styles.topicCardWrap}>
                <TopicCard topic={topic} onUse={() => handleTopicUse(topic.title)} />
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🚪 推荐房间</Text>
            <Text className={styles.moreBtn}>更多房间 →</Text>
          </View>
          <View className={styles.roomsGrid}>
            {rooms.slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} onClick={() => Taro.switchTab({ url: '/pages/room/index' })} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DiscoverPage;
