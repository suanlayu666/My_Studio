# My Studio

自用音乐播放器，黑色主题 × 绿色霓虹线条 × 音频律动特效。

> 暂时未接入音乐平台 API，后续会更新。

## 在线使用

打开网页，直接把本地音乐文件或文件夹拖入窗口即可播放。

## 本地部署

```bash
git clone <https://github.com/suanlayu666/My_Studio>
cd <My_Studio>
npm install
```

把音乐文件按歌单放入 `public/music/` 目录：

```
public/music/
├── 摇滚/
│   ├── song1.mp3
│   └── song2.flac
└── 爵士/
    └── track.mp3
```

子文件夹自动识别为歌单。


```bash
npm run dev
```

打开 `http://localhost:5173`，音乐自动加载。

## 安装为桌面应用（PWA）

Chrome / Edge 打开网页，点击地址栏 ⊕ 图标或左下角「安装为桌面应用」。

## 功能

- 本地音频播放（mp3 / flac / wav / ogg / m4a）
- ID3 标签解析（标题、歌手、专辑、封面）
- 文件夹拖拽导入，子文件夹自动识别为歌单
- 暗色 / 亮色主题切换
- 绿色霓虹光环 + 音频频谱实时律动
- 收藏歌单
- PWA 桌面应用

## 技术栈

React · TypeScript · Tailwind CSS · Vite · music-metadata · PWA
