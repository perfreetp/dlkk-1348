import React from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import CharacterCard from '@/components/CharacterCard';
import TopicCard from '@/components/TopicCard';
import RoomCard from '@/components/RoomCard';
import { mockCharacters } from '@/data/characters';
import { mockTopics } from '@/data/topics';
import { mockRooms } from '@/data/rooms';

const DiscoverPage: React.FC = () => {
  const handleCreateRole = () => {
    Taro.navigateTo({ url: '/pages/create/index' });
  };

  const handleCharacterClick = (charId: string) => {
    Taro.showToast({ title: `进入聊天：角色ID ${charId}`, icon: 'none' });
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
            {mockCharacters.slice(0, 4).map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onClick={() => handleCharacterClick(char.id)}
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
                <TopicCard
                  topic={topic}
                  onUse={() => Taro.showToast({ title: `使用话题：${topic.title}`, icon: 'none' })}
                />
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
            {mockRooms.slice(0, 3).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onClick={() => Taro.switchTab({ url: '/pages/room/index' })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DiscoverPage;
