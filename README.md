## niplayer-plugin-dash
NiPlayer视频播放器的dash流插件，安装此插件可以使得NiPlayer播放器支持dash流媒体协议


## 使用方法
1. 安装该插件
```bash
npm i niplayer-plugin-dash
```
2. 导入并且在NiPlayer中注册该插件
```js
import Player from "niplayer"
import { FullScreen,FullPage } from "niplayer"
import dash from "niplayer-plugin-dash"

let player = new Player({
    container: document.getElementsByClassName("video-container")[0],
    plugins: [dash],
    rightBottomBarControllers: [FullPage,FullScreen]
})
// 注册完成之后NiPlayer就具备了接入DASH流媒体协议的能力，可以解析并且播放mpd文件描述的视频资源并且支持多种分辨率无缝切换
player.attachSource("https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd")
```
