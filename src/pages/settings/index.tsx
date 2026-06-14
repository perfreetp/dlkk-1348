import React, { useState } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/appStore';
import { mockCharacters } from '@/data/characters';
import classnames from 'classnames';

const SettingsPage: React.FC = () => {
  const { forbiddenWords, addForbiddenWord, removeForbiddenWord, blockedUsers, unblockUser } = useAppStore();
  const [newWord, setNewWord] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    if (forbiddenWords.includes(newWord.trim())) {
      Taro.showToast({ title: '该词已存在', icon: 'none' });
      return;
    }
    addForbiddenWord(newWord.trim());
    setNewWord('');
    Taro.showToast({ title: '添加成功', icon: 'success' });
  };

  const handleInvite = () => {
    Taro.showToast({ title: '邀请链接已复制', icon: 'success' });
  };

  const handleExport = () => {
    Taro.showModal({
      title: '数据导出',
      content: '确定要导出所有聊天数据吗？将生成一个JSON文件。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '数据导出成功', icon: 'success' });
        }
      }
    });
  };

  const handleReportList = () => {
    Taro.showToast({ title: '查看举报记录', icon: 'none' });
  };

  const handleFeedback = () => {
    Taro.showToast({ title: '意见反馈', icon: 'none' });
  };

  const handleAbout = () => {
    Taro.showToast({ title: '关于我们 v1.0.0', icon: 'none' });
  };

  const blockedList = mockCharacters.filter(c => blockedUsers.includes(c.id));

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>
          <Text className='gradientText'>设置</Text>
        </Text>
        <Text className={styles.subtitle}>管理你的账户和偏好</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>通用设置</Text>

        <View className={styles.listItem}>
          <View className={styles.itemIcon} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <Text>🔔</Text>
          </View>
          <View className={styles.itemContent}>
            <Text className={styles.itemTitle}>消息通知</Text>
          </View>
          <View
            className={classnames(styles.switch, notifications && styles.active)}
            onClick={() => setNotifications(!notifications)}
          >
            <View className={classnames(styles.switchDot, notifications && styles.active)} />
          </View>
        </View>

        <View className={styles.listItem}>
          <View className={styles.itemIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Text>💾</Text>
          </View>
          <View className={styles.itemContent}>
            <Text className={styles.itemTitle}>自动保存对话</Text>
            <Text className={styles.itemDesc}>自动保存所有聊天记录</Text>
          </View>
          <View
            className={classnames(styles.switch, autoSave && styles.active)}
            onClick={() => setAutoSave(!autoSave)}
          >
            <View className={classnames(styles.switchDot, autoSave && styles.active)} />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🚫 禁词管理</Text>
        <View className={styles.forbiddenWords}>
          {forbiddenWords.map((word) => (
            <View key={word} className={styles.forbiddenTag}>
              <Text>{word}</Text>
              <Text className={styles.removeWord} onClick={() => removeForbiddenWord(word)}>✕</Text>
            </View>
          ))}
        </View>
        <View className={styles.addWordInput}>
          <Input
            className={styles.wordInput}
            placeholder='添加屏蔽词汇...'
            value={newWord}
            onInput={(e) => setNewWord(e.detail.value)}
            confirmType='done'
            onConfirm={handleAddWord}
          />
          <View className={styles.addWordBtn} onClick={handleAddWord}>
            <Text>添加</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.listItem} onClick={handleInvite}>
          <View className={styles.itemIcon} style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
            <Text>👥</Text>
          </View>
          <View className={styles.itemContent}>
            <Text className={styles.itemTitle}>邀请好友</Text>
            <Text className={styles.itemDesc}>邀请好友加入AI聊天</Text>
          </View>
          <Text className={styles.itemArrow}>›</Text>
        </View>

        <View className={styles.listItem} onClick={handleExport}>
          <View className={styles.itemIcon} style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
            <Text>📤</Text>
          </View>
          <View className={styles.itemContent}>
            <Text className={styles.itemTitle}>数据导出</Text>
            <Text className={styles.itemDesc}>导出所有聊天记录和收藏</Text>
          </View>
          <Text className={styles.itemArrow}>›</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>⚠️ 举报与屏蔽</Text>
        <View className={styles.listItem} onClick={handleReportList}>
          <View className={styles.itemIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Text>📋</Text>
          </View>
          <View className={styles.itemContent}>
            <Text className={styles.itemTitle}>举报记录</Text>
          </View>
          <Text className={styles.itemArrow}>›</Text>
        </View>

        {blockedList.length > 0 ? (
          <View className={styles.blockedList}>
            {blockedList.map((char) => (
              <View key={char.id} className={styles.blockedItem}>
                <Image className={styles.blockedAvatar} src={char.avatar} mode='aspectFill' />
                <View className={styles.blockedInfo}>
                  <Text className={styles.blockedName}>{char.name}</Text>
                  <Text className={styles.blockedTime}>已屏蔽</Text>
                </View>
                <View className={styles.unblockBtn} onClick={() => unblockUser(char.id)}>
                  <Text>解除</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className={styles.emptyHint}>暂无屏蔽的用户</Text>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.listItem} onClick={handleFeedback}>
          <View className={styles.itemIcon} style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
            <Text>💬</Text>
          </View>
          <View className={styles.itemContent}>
            <Text className={styles.itemTitle}>意见反馈</Text>
          </View>
          <Text className={styles.itemArrow}>›</Text>
        </View>

        <View className={styles.listItem} onClick={handleAbout}>
          <View className={styles.itemIcon} style={{ background: 'rgba(100, 116, 139, 0.1)' }}>
            <Text>ℹ️</Text>
          </View>
          <View className={styles.itemContent}>
            <Text className={styles.itemTitle}>关于</Text>
          </View>
          <Text className={styles.itemValue}>v1.0.0</Text>
          <Text className={styles.itemArrow}>›</Text>
        </View>
      </View>

      <View
        className={styles.logoutBtn}
        onClick={() => Taro.showModal({ title: '提示', content: '确定要退出登录吗？' })}
      >
        <Text>退出登录</Text>
      </View>
    </View>
  );
};

export default SettingsPage;
