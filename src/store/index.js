import { createPinia } from "pinia";
import useUserStore from "./modules/user";
import useAppStore from "./modules/app";
import useUserDetailStore from "./modules/userDetail";
import useNoticeStore from "./modules/notice";
import useUsersStore from "./modules/users";
import useOrgsStore from "./modules/orgs";
import useorgsDetailStore from "./modules/orgsDetail";

const pinia = createPinia();

export { useUserStore, useAppStore, useUserDetailStore, useNoticeStore, useUsersStore, useOrgsStore, useorgsDetailStore };
export default pinia;
