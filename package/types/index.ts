import { BitrateInfo } from "dashjs";

export type bitrateObj = {

    menuType: string;
    audio: BitrateInfo[],
    video: BitrateInfo[]
}