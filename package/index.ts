import { Options, $, addClass, EVENT, Toast } from "niplayer";
import type Player from "niplayer"
import type { Plugin,DOMProps } from "niplayer"
import dashjs, { BitrateInfo, MediaPlayerClass } from "dashjs"
import { ResolutionMenu } from "./component/menu";
import Event from "./event";
import { Loading } from "./component/Loading";
import "./index.less"

//TODO 构造一个分辨率组件
class Resolution extends Options {
    readonly id = "Resolution";
    private dashPlayer: MediaPlayerClass;
    // dash流媒体下切换分辨率的加载动画div
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
        resolve.innerText = "画质"
        this.icon = resolve;
        this.iconBox.appendChild(this.icon);
    }

    //TODO 初始化相关事件的回调函数
    initEvent(): void {
        // 监听媒体资源的挂载事件,source为媒体资源的地址
        this.player.on(EVENT.SOURCE_ATTACHED,(source: string) => {
            // 初始化dashjs的控制器，将播放器中的video元素托管给dashjs控制器
            this.dashPlayer.initialize(this.player.video, source);
            // 初始化视频的分辨率列表
            new ResolutionMenu(this.player, this.dashPlayer, this.hideBox);
        })

        //TODO 发生分辨率栏的点击事件后触发回调函数
        this.player.on(Event.MENU_ITEM_CLICK, (quality: string) => {
            (this.icon as HTMLElement).innerText = quality;
            if(quality !== "自动") {
                this.dashLoading = new Loading("正在切换视频分辨率ing....",this.player.el);
            }
        })

        //TODO 监听媒体质量发生变化的事件
        this.player.on(Event.QUALITY_CHANGED,(newQuality: BitrateInfo) => {
            console.log("媒体质量发生变化",newQuality);
            this.dashLoading && this.dashLoading.dispose();
            let dom = $("div.video-resolution-toast");
            dom.innerText = `成功切换到${newQuality.height}P`;

            let toast: Toast = new Toast(this.player,dom)

            window.setTimeout(() => {
                toast.dispose();
            }, 2000)
        })
    }
}

const plugin: Plugin = {
    install(player: Player) {
        // 注册controllers组件
        player.registerControllers(Resolution, "right");
    },
}

export default plugin;