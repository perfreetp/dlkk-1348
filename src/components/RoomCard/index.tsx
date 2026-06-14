import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { Room } from '@/types';
import { formatNumber, getFrequencyLabel } from '@/utils';
import classnames from 'classnames';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
  className?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, className }) => {
  return (
    <View className={classnames(styles.card, className)} onClick={onClick}>
      <View className={styles.coverWrap}>
        <Image className={styles.cover} src={room.cover} mode='aspectFill' />
        {room.isHot && <Text className={styles.hotBadge}>🔥 热门</Text>}
        <Text className={classnames(styles.statusBadge, styles[room.status])}>
          {room.status === 'active' ? '● 进行中' : '⏸ 已暂停'}
        </Text>
      </View>
      <View className={styles.content}>
        <Text className={styles.name}>{room.name}</Text>
        <Text className={styles.desc}>{room.description}</Text>
        <View className={styles.info}>
          <View className={styles.participants}>
            {room.participants.slice(0, 4).map((p) => (
              <Image
                key={p.id}
                className={styles.avatarStack}
                src={p.avatar}
                mode='aspectFill'
              />
            ))}
          </View>
          <View className={styles.stats}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{formatNumber(room.participantCount)}</Text>
              <Text>角色</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{formatNumber(room.spectatorCount)}</Text>
              <Text>旁听</Text>
            </View>
          </View>
        </View>
        <View className={styles.topics}>
          {room.topics.map((topic) => (
            <Text key={topic} className={styles.topicTag}>#{topic}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default RoomCard;
