import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { Character } from '@/types';
import { formatNumber } from '@/utils';
import classnames from 'classnames';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  className?: string;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, className }) => {
  return (
    <View className={classnames(styles.card, className)} onClick={onClick}>
      <Image className={styles.avatar} src={character.avatar} mode='aspectFill' />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{character.name}</Text>
          <Text className={styles.aiBadge}>AI</Text>
        </View>
        <Text className={styles.desc}>{character.description}</Text>
        <View className={styles.tags}>
          {character.tags.slice(0, 3).map((tag) => (
            <Text key={tag} className={styles.tag}>{tag}</Text>
          ))}
        </View>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{formatNumber(character.chatCount)}</Text>
            <Text>对话</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{formatNumber(character.followerCount)}</Text>
            <Text>粉丝</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CharacterCard;
