export class Loading {
    private message: string;
    private el!: HTMLElement;
    private container: HTMLElement;
    constructor(message: string, container: HTMLElement) {
        this.message = message;
        this.container = container;
        this.init();
    }
    init() {
        this.initTemplate();
    }

    initTemplate() {
        let el = document.createElement("div")
        el.classList.add("dash-loading-wrapper")
        this.el = el;
        let msgEl = document.createElement("div")
        msgEl.classList.add("dash-loading-message")
        msgEl.innerText = this.message;
        this.el.append(msgEl);
        this.container.append(this.el);
    }

    // 销毁dash的loading组件
    dispose() {
        this.el.classList.add("dash-loading-hidden")
        // 监听动画结束的事件，在动画结束就将该组件的dom元素从document中移除
        this.el.ontransitionend = () => {
            this.el.parentElement?.removeChild(this.el);
        }
    }
}