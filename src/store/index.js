import { createPinia } from "pinia";
import useUserStore from "./modules/user";
import useAppStore from "./modules/app";
import useUserDetailStore from "./modules/userDetail";
import useNoticeStore from "./modules/notice";

const pinia = createPinia();

export { useUserStore, useAppStore, useUserDetailStore, useNoticeStore };
export default pinia;
