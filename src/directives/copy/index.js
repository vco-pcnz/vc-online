import useClipboard from 'vue-clipboard3'
import i18n from '@/i18n/index.js'
import { message } from 'ant-design-vue';

const copy = (el, binding) => {
  const { value } = binding
  el.addEventListener('click', async () => {
    if (value && value !== '') {
      try {
        await useClipboard().toClipboard(value)
        message.success(i18n.global.t('复制成功'))
      } catch(e) {
        message.error(i18n.global.t('复制失败'))
      }
    } else {
      throw new Error(`need for copy content! Like v-copy="Hello World"`)
    }
  })
}

export default {
  mounted(el, binding) {
    copy(el, binding)
  }
};
