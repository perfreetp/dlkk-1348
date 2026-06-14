export default defineAppConfig({
  pages: [
    'pages/chat/index',
    'pages/room/index',
    'pages/discover/index',
    'pages/profile/index',
    'pages/settings/index',
    'pages/create/index',
    'pages/playback/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'AI 聊天室',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F8FAFC'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/chat/index',
        text: '聊天'
      },
      {
        pagePath: 'pages/room/index',
        text: '房间'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现'
      },
      {
        pagePath: 'pages/profile/index',
        text: '名片'
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置'
      }
    ]
  }
})
