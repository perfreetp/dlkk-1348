import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/appStore';
import { mockRelations } from '@/data/characters';
import { formatNumber, getToneLabel } from '@/utils';

const ProfilePage: React.FC = () => {
  const { myCharacter } = useAppStore();

  const handleEdit = () => {
    Taro.navigateTo({ url: '/pages/create/index' });
  };

  const handlePlayback = () => {
    Taro.navigateTo({ url: '/pages/playback/index' });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享名片', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileHeader}>
        <View className={styles.headerActions}>
          <View className={styles.actionBtn} onClick={handleShare}>
            <Text>↗</Text>
          </View>
          <View className={styles.actionBtn} onClick={handleEdit}>
            <Text>✎</Text>
          </View>
        </View>

        <View className={styles.charInfo}>
          <View className={styles.avatarWrap} onClick={handleEdit}>
            <Image className={styles.avatar} src={myCharacter.avatar} mode='aspectFill' />
            <View className={styles.editBadge}>
              <Text>✎</Text>
            </View>
          </View>
          <View className={styles.charDetails}>
            <View className={styles.charName}>
              <Text>{myCharacter.name}</Text>
              <Text className={styles.aiBadge}>AI 角色</Text>
            </View>
            <Text className={styles.toneText}>语气风格：{getToneLabel(myCharacter.tone)}</Text>
            <View className={styles.memoryStatus}>
              <Text>{myCharacter.memoryEnabled ? '🧠' : '💭'}</Text>
              <Text>{myCharacter.memoryEnabled ? '记忆功能已开启' : '记忆功能已关闭'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{formatNumber(myCharacter.chatCount)}</Text>
            <Text className={styles.statLabel}>对话次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{formatNumber(myCharacter.followerCount)}</Text>
            <Text className={styles.statLabel}>粉丝数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{myCharacter.createdAt.slice(5)}</Text>
            <Text className={styles.statLabel}>创建日期</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 角色简介</Text>
          <View className={styles.descCard}>
            <Text className={styles.descText}>{myCharacter.description}</Text>
            <Text className={styles.personalityTitle}>🎭 性格设定</Text>
            <View className={styles.personalityText}>
              <Text>{myCharacter.personality}</Text>
            </View>
            <View className={styles.tagsWrap}>
              {myCharacter.tags.map((tag) => (
                <Text key={tag} className={styles.tag}>#{tag}</Text>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.relationSection}>
          <Text className={styles.sectionTitle}>🕸️ 关系图谱</Text>
          <View className={styles.relationCard}>
            <View className={styles.relationCenter}>
              <Image className={styles.centerAvatar} src={myCharacter.avatar} mode='aspectFill' />
            </View>
            <View className={styles.relationGrid}>
              {mockRelations.slice(0, 3).map((rel) => (
                <View key={rel.id} className={styles.relationNode}>
                  <Image className={styles.nodeAvatar} src={rel.avatar} mode='aspectFill' />
                  <Text className={styles.nodeName}>{rel.name}</Text>
                  <Text className={styles.nodeRelation}>{rel.relation}</Text>
                </View>
              ))}
              <View className={styles.emptyNode} />
              {mockRelations.slice(3, 5).map((rel) => (
                <View key={rel.id} className={styles.relationNode}>
                  <Image className={styles.nodeAvatar} src={rel.avatar} mode='aspectFill' />
                  <Text className={styles.nodeName}>{rel.name}</Text>
                  <Text className={styles.nodeRelation}>{rel.relation}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.quickBtn} onClick={handlePlayback}>
            <View className={styles.quickIcon}>
              <Text>🎬</Text>
            </View>
            <View className={styles.quickInfo}>
              <Text className={styles.quickTitle}>聊天回放</Text>
              <Text className={styles.quickDesc}>查看历史对话</Text>
            </View>
          </View>
          <View className={styles.quickBtn} onClick={handleEdit}>
            <View className={styles.quickIcon}>
              <Text>✏️</Text>
            </View>
            <View className={styles.quickInfo}>
              <Text className={styles.quickTitle}>编辑角色</Text>
              <Text className={styles.quickDesc}>修改角色设定</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
