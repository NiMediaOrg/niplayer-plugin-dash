import { DOMProps, Options, Plugin, addClass, EVENT, Toast, $ } from "niplayer";
import type Player from "niplayer"
import dashjs,{ BitrateInfo, MediaPlayerClass } from "dashjs"
import { ResolutionMenu } from "./menu";
import { Loading } from "./component/Loading";

import "./index.less"
class Resolution extends Options {
    readonly id = "Resolution";
    private dashPlayer: MediaPlayerClass;
    private dashLoading!: Loading;
    constructor(
        player: Player, 
        container: HTMLElement,
        desc?: string,
        props?: DOMProps,
    ) {
        super(player, container, 150, undefined, desc, props);
        this.dashPlayer = dashjs.MediaPlayer().create();
        this.init();
    }

    init(): void {
        this.initTemplate();
        this.initEvent();
    }

    initTemplate(): void {
        addClass(this.el,["video-controller","video-resolution"])
        let resolve = document.createElement("div");
        resolve.innerText = "Resolution"
        
        this.icon = resolve;
        this.iconBox.appendChild(this.icon);
        
    }

    initEvent(): void {
        let self = this;
        // 监听媒体资源的挂载事件
        this.player.on(EVENT.SOURCE_ATTACHED,(source: string) => {
            this.dashPlayer.initialize(this.player.video, source);
            new ResolutionMenu(this.player, this.dashPlayer, this.hideBox);
        })

        this.player.on("videoItemClick", (quality: string) => {
            (this.icon as HTMLElement).innerText = quality;
            if(quality !== "Auto Switch") {
                this.dashLoading = new Loading("正在切换视频分辨率ing....",this.player.el);
            }
        })

        // 监听媒体质量发生变化的事件
        this.player.on("qualityChanged",(newQuality: BitrateInfo) => {
            console.log("媒体质量发生变化",newQuality);
            self.dashLoading && self.dashLoading.dispose();
            let dom = $("div.video-resolution-toast");
            dom.innerText = `成功切换到${newQuality.width}x${newQuality.height}`;

            let toast: any = new Toast(this.player,dom)

            setTimeout(() => {
                toast.dispose();
                toast = null;
            }, 2000)
        })
    }
}

const plugin: Plugin = {
    install(player: Player) {
        console.log("插件开始进行注册")
        // 注册controllers组件
        player.registerControllers(Resolution, "right");
    },
}

export default plugin;