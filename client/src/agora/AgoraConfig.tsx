import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "a32fa0ab368c43aa85985bb65628111f"; // <-- Replace with your Agora App ID
const config = { mode: "rtc", codec: "vp8" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export { appId };
