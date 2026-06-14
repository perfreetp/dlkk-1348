import React, { useState } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { TONE_OPTIONS, Character } from '@/types';
import { useAppStore } from '@/store/appStore';
import classnames from 'classnames';

const presetTags = ['温柔', '幽默', '高冷', '可爱', '文艺', '科技', '神秘', '活力', '知性', '傲娇'];

const avatarOptions = [
  'https://picsum.photos/id/1005/200/200',
  'https://picsum.photos/id/1011/200/200',
  'https://picsum.photos/id/1012/200/200',
  'https://picsum.photos/id/1025/200/200',
  'https://picsum.photos/id/1027/200/200',
  'https://picsum.photos/id/1062/200/200'
];

const CreatePage: React.FC = () => {
  const { myCharacter, setMyCharacter } = useAppStore();
  const [name, setName] = useState(myCharacter.name === '我的AI角色' ? '' : myCharacter.name);
  const [description, setDescription] = useState(myCharacter.description);
  const [personality, setPersonality] = useState(myCharacter.personality);
  const [tone, setTone] = useState<Character['tone']>(myCharacter.tone);
  const [memoryEnabled, setMemoryEnabled] = useState(myCharacter.memoryEnabled);
  const [selectedTags, setSelectedTags] = useState<string[]>(myCharacter.tags);
  const [avatar, setAvatar] = useState(myCharacter.avatar);

  const handleChangeAvatar = () => {
    const currentIdx = avatarOptions.indexOf(avatar);
    const nextIdx = (currentIdx + 1) % avatarOptions.length;
    setAvatar(avatarOptions[nextIdx]);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      Taro.showToast({ title: '最多选择5个标签', icon: 'none' });
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入角色名称', icon: 'none' });
      return;
    }
    if (name.length > 20) {
      Taro.showToast({ title: '名称不超过20个字符', icon: 'none' });
      return;
    }
    if (!personality.trim()) {
      Taro.showToast({ title: '请输入人设描述', icon: 'none' });
      return;
    }

    const updatedChar: Character = {
      ...myCharacter,
      name: name.trim(),
      avatar,
      description: description.trim() || `一个${tone}风格的AI角色`,
      personality: personality.trim(),
      tone,
      memoryEnabled,
      tags: selectedTags.length > 0 ? selectedTags : ['自定义']
    };
    setMyCharacter(updatedChar);
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1000);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.avatarSection}>
        <Text className={styles.avatarLabel}>角色头像</Text>
        <View className={styles.avatarWrap} onClick={handleChangeAvatar}>
          <Image className={styles.avatar} src={avatar} mode='aspectFill' />
          <View className={styles.changeBtn}>
            <Text>↻</Text>
          </View>
        </View>
        <Text className={styles.avatarHint}>点击头像切换</Text>
      </View>

      <View className={styles.formSection}>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text> 角色名称
          </Text>
          <Input
            className={styles.formInput}
            placeholder='给你的AI角色起个名字'
            value={name}
            maxLength={20}
            onInput={(e) => setName(e.detail.value)}
          />
          <View className={styles.charCount}>
            <Text>{name.length}/20</Text>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text> 人设描述
          </Text>
          <Input
            className={styles.formTextarea}
            placeholder='详细描述这个角色的性格、背景、说话习惯等...'
            value={personality}
            maxLength={200}
            onInput={(e) => setPersonality(e.detail.value)}
          />
          <View className={styles.charCount}>
            <Text>{personality.length}/200</Text>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>角色简介</Text>
          <Input
            className={styles.formInput}
            placeholder='一句话介绍这个角色（选填）'
            value={description}
            maxLength={50}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>🗣️ 语气风格</Text>
          <View className={styles.toneGrid}>
            {TONE_OPTIONS.map((opt) => (
              <View
                key={opt.value}
                className={classnames(styles.toneCard, tone === opt.value && styles.active)}
                onClick={() => setTone(opt.value)}
              >
                <View className={styles.toneHeader}>
                  <Text className={styles.toneName}>{opt.label}</Text>
                  {tone === opt.value ? (
                    <View className={styles.checkIcon}><Text>✓</Text></View>
                  ) : null}
                </View>
                <Text className={styles.toneDesc}>{opt.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>🧠 记忆开关</Text>
          <View className={styles.memorySection}>
            <View className={styles.memoryInfo}>
              <Text className={styles.memoryTitle}>
                <Text>🧠</Text>
                <Text>开启记忆功能</Text>
              </Text>
              <Text className={styles.memoryDesc}>
                开启后AI会记住之前的对话内容，让聊天更连贯
              </Text>
            </View>
            <View
              className={classnames(styles.switch, memoryEnabled && styles.active)}
              onClick={() => setMemoryEnabled(!memoryEnabled)}
            >
              <View className={classnames(styles.switchDot, memoryEnabled && styles.active)} />
            </View>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>🏷️ 角色标签（最多5个）</Text>
          <View className={styles.tagsSection}>
            {presetTags.map((tag) => (
              <Text
                key={tag}
                className={classnames(styles.tagItem, selectedTags.includes(tag) && styles.active)}
                onClick={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.cancelBtn} onClick={handleCancel}>
          <Text>取消</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>保存角色</Text>
        </View>
      </View>
    </View>
  );
};

export default CreatePage;
