import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import useUserStore from './modules/user';
import useAppStore from './modules/app';
import useUserDetailStore from './modules/userDetail';
import useNoticeStore from './modules/notice';
import useUsersStore from './modules/users';
import useOrgsStore from './modules/orgs';
import useOrgsDetailStore from './modules/orgsDetail';
import useProjectsStore from './modules/projects';
import useProductStore from './modules/product';
import useInvestment_project from './modules/Investment_project';

const pinia = createPinia();
pinia.use(createPersistedState());

export { useUserStore, useAppStore, useUserDetailStore, useNoticeStore, useUsersStore, useOrgsStore, useOrgsDetailStore, useProjectsStore, useProductStore, useInvestment_project };
export default pinia;
