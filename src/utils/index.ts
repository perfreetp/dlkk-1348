export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const formatTime = (time: string): string => {
  return time;
};

export const getToneLabel = (tone: string): string => {
  const toneMap: Record<string, string> = {
    friendly: '友好亲切',
    formal: '正式严谨',
    humorous: '幽默风趣',
    cold: '高冷傲娇',
    cute: '软萌可爱'
  };
  return toneMap[tone] || tone;
};

export const getFrequencyLabel = (freq: string): string => {
  const freqMap: Record<string, string> = {
    low: '低频发言',
    medium: '中频发言',
    high: '高频发言'
  };
  return freqMap[freq] || freq;
};
