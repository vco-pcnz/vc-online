import { createPinia } from "pinia";
import { createPersistedState } from 'pinia-plugin-persistedstate';
import useUserStore from "./modules/user";
import useAppStore from "./modules/app";
import useUserDetailStore from "./modules/userDetail";
import useNoticeStore from "./modules/notice";
import useUsersStore from "./modules/users";
import useOrgsStore from "./modules/orgs";
import useOrgsDetailStore from "./modules/orgsDetail";
import useCloseProjectsStore from "./modules/closeProjects";

const pinia = createPinia();
pinia.use(createPersistedState())

export { useUserStore, useAppStore, useUserDetailStore, useNoticeStore, useUsersStore, useOrgsStore, useOrgsDetailStore, useCloseProjectsStore };
export default pinia;