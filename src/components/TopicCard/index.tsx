import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { Topic } from '@/types';
import { formatNumber } from '@/utils';
import classnames from 'classnames';

interface TopicCardProps {
  topic: Topic;
  onUse?: () => void;
  className?: string;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onUse, className }) => {
  return (
    <View className={classnames(styles.card, className)}>
      <View className={styles.header}>
        <Text className={styles.icon}>{topic.icon}</Text>
        <View className={styles.heat}>
          <Text>🔥</Text>
          <Text>{formatNumber(topic.heat)}</Text>
        </View>
      </View>
      <Text className={styles.title}>{topic.title}</Text>
      <Text className={styles.desc}>{topic.description}</Text>
      <View className={styles.footer}>
        <Text className={styles.category}>{topic.category}</Text>
        <Text className={styles.useBtn} onClick={onUse}>使用话题</Text>
      </View>
    </View>
  );
};

export default TopicCard;
