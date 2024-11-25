import { createPinia } from "pinia";
import useUserStore from "./modules/user";
import useAppStore from "./modules/app";
import useUserDetailStore from "./modules/userDetail";
import useNoticeStore from "./modules/notice";
import useUsersStore from "./modules/users";

const pinia = createPinia();

export { useUserStore, useAppStore, useUserDetailStore, useNoticeStore, useUsersStore };
export default pinia;
