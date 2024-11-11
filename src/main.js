import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';

import store from './store';
import router from './router';
import i18n from './i18n';
import directives from './directives'

import globalComponents from '@/components'

// 样式
import 'ant-design-vue/dist/reset.css';
import './assets/iconfont/iconfont.css'
import './styles/index.css'
import './styles/global.less'

const app = createApp(App);

app.use(Antd);
app.use(store);
app.use(router);
app.use(i18n);
app.use(directives);
app.use(globalComponents);

app.mount('#app');
