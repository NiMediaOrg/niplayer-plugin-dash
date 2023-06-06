import dashjs, { BitrateInfo, MediaPlayerClass } from "dashjs";
import { $ } from "niplayer";
import type Player from "niplayer"
import Event from "../event";
// dash.js库的配置信息
const cfg = {
    'streaming': {
        'abr': {
            'autoSwitchBitrate': {}
        }
    }
};

// 生成视频具体分辨率的字符串
function generateContent(element?: BitrateInfo): string {
    if(typeof element === "undefined") {
        return "自动";
    } else {
        let resolution = "";
        let height = element.height;
        if(height >= 2160) {
            resolution = "蓝光"
        } else if(height >= 720 && height < 2160) {
            resolution = "高清"
        } else if(height >= 480 && height < 720) {
            resolution = "标清"
        } else if(height < 480) {
            resolution = "流畅"
        }

        return `${height}P ${resolution}`;
    }
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
        this.niPlayer.emit(Event.QUALITY_CHANGED, newQuality);
    }

    // 创建码率菜单，也就是视频分辨率和音频音质的集中菜单
    private createBiterateMenu(player: MediaPlayerClass, container: HTMLElement): void {
        // 获取video和audio的集中信息
        let videoInfo = player.getBitrateInfoListFor && player.getBitrateInfoListFor("video");
        let videoList = this.createMenuContent(videoInfo);
        container.append(videoList);
    }

    private createMenuContent(info: BitrateInfo[]): DocumentFragment {

        // let ul = $("ul.video-resolution-submenu")
        let fragment = document.createDocumentFragment()
        let auto = $("div.video-resolution-item");
        auto.innerText = generateContent();
        // @ts-ignore
        auto.onclick = (e: MouseEvent) => {
            (cfg.streaming.abr.autoSwitchBitrate as any)["video"] = true;
            this.dashPlayer.updateSettings(cfg);
            this.niPlayer.emit(Event.MENU_ITEM_CLICK, auto.innerText);
            e.stopPropagation();
        }
        fragment.append(auto);
        const liList: HTMLElement[] = [];
        for(let item of info) {
            let content = generateContent(item);
            let li = $("div.video-resolution-item");
            li.innerText = content;
            li.onclick = (e: MouseEvent) => {
                // 关闭自适应算法调整视频的分辨率，该为手动调整
                (cfg.streaming.abr.autoSwitchBitrate as any)["video"] = false;
                this.dashPlayer.updateSettings(cfg);
                this.dashPlayer.setQualityFor(item.mediaType, item.qualityIndex, this.forceQuality);
                this.niPlayer.emit(Event.MENU_ITEM_CLICK, content)
                e.stopPropagation()
            }
            liList.push(li)
        }

        const resList: string[] = [];
        for(let li of Array.from(new Set(liList.reverse()))) {
            if(resList.includes(li.innerText)) continue;
            resList.push(li.innerText)
            fragment.append(li)
        }
        return fragment;
    }
}