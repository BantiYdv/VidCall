import AgoraRTC, { ClientConfig } from "agora-rtc-react";

const appId = "a32fa0ab368c43aa85985bb65628111f"; // <-- Replace with your Agora App ID
const config: ClientConfig = { mode: "rtc", codec: "vp8" };

export const client = AgoraRTC.createClient(config);
export const createMicrophoneAndCameraTracks = AgoraRTC.createMicrophoneAndCameraTracks;
export { appId };
