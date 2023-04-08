import dashjs, { BitrateInfo, MediaPlayerClass } from "dashjs";
import { bitrateObj } from "./types";
import { $ } from "niplayer";
import type Player from "niplayer"
// dash.js库的配置信息
const cfg = {
    'streaming': {
        'abr': {
            'autoSwitchBitrate': {}
        }
    }
};

// 生成具体分辨率的字符串
function generateContent(element: BitrateInfo | undefined, index: number | undefined): string {
    if(typeof element === "undefined" && typeof index === "undefined") {
        return "Auto Switch";
    } else if(typeof element !== "undefined" && typeof index !== "undefined"){
        var result = Math.floor(element.bitrate / 1000) + ' kbps';
        result += element && element.width && element.height ? ' (' + element.width + 'x' + element.height + ')' : '';
        return result;
    }
    return "";
}

export class ResolutionMenu {
    private dashPlayer: MediaPlayerClass;
    private niPlayer: Player;
    private container: HTMLElement;
    private forceQuality: boolean = true;
    constructor(niPlayer: Player, dashPlayer: MediaPlayerClass, container: HTMLElement) {
        this.dashPlayer = dashPlayer;
        this.container = container;
        this.niPlayer = niPlayer;
        this.dashPlayer.on(dashjs.MediaPlayer.events.STREAM_ACTIVATED, this._onStreamActivated, this);
        this.dashPlayer.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, this._onQualityChanged, this)
    }

    private _onStreamActivated() {
        console.log("dash流已经启动");
        this.createBiterateMenu(this.dashPlayer,this.container);
    }

    // 监听媒体流质量发生变化的事件
    private _onQualityChanged(e: any) {
        let newQualityIndex = e.newQuality;
        let newQuality = this.dashPlayer.getBitrateInfoListFor("video")[newQualityIndex];
        this.niPlayer.emit("qualityChanged", newQuality);
        
    }

    // 创建码率菜单，也就是视频分辨率和音频音质的集中菜单
    private createBiterateMenu(player: MediaPlayerClass, container: HTMLElement): void {
        // 获取video和audio的集中信息
        let videoInfo = player.getBitrateInfoListFor && player.getBitrateInfoListFor("video");
        let audioInfo = player.getBitrateInfoListFor && player.getBitrateInfoListFor("audio");
        let availableBitrates: bitrateObj = { menuType: "bitrate", audio: [], video: []};
        availableBitrates.audio = audioInfo;
        availableBitrates.video = videoInfo;
        let videoUl = this.createMenuContent("video", videoInfo);
        let audioUl = this.createMenuContent("audio", audioInfo);
        container.append(videoUl,audioUl);
    }

    private createMenuContent(type: "audio" | "video", info: BitrateInfo[]): HTMLElement {
        let ul = $("ul.video-resolution-submenu")
        let title = $("li.video-resolution-submenuTitle");
        if(type === "audio") {
            title.innerText = "Audio";
        } else {
            title.innerText = "Video";
        }
        ul.append(title);
    
        let AutoSwitch = $("li.video-resolution-submenuItem");
        AutoSwitch.innerText = generateContent(undefined,undefined);
        AutoSwitch.onclick = (e:Event) => {
            (cfg.streaming.abr.autoSwitchBitrate as any)[info[0].mediaType] = true;
            this.dashPlayer.updateSettings(cfg);
            if(type === "video") {
                this.niPlayer.emit("videoItemClick",AutoSwitch.innerText);
            } else {
                this.niPlayer.emit("audioItemClick",AutoSwitch.innerText);
            }
            
            e.stopPropagation();
        }
        ul.append(AutoSwitch);
        for(let item of info) {
            let content = generateContent(item,0);
            let li = $("li.video-resolution-submenuItem");
            li.onclick = (e: Event) => {
                (cfg.streaming.abr.autoSwitchBitrate as any)[item.mediaType] = false;
                this.dashPlayer.updateSettings(cfg);
                this.dashPlayer.setQualityFor(item.mediaType, item.qualityIndex - 1, this.forceQuality);
                if(type === "video") {
                    this.niPlayer.emit("videoItemClick", item.width + 'x' + item.height)
                } else {
                    this.niPlayer.emit("audioItemClick", item.bitrate);
                }
                
                e.stopPropagation();
            }
            li.innerText = content;
            ul.append(li);
        }
        return ul;
    }
}