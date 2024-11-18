<template>
  <div>
    <a-dropdown :trigger="['click']">
      <div class="lang-item" @click.prevent>
        <img v-if="showImg" :src="langInfo.image" alt="">
        <p>{{ langInfo.title }}</p>
        <DownOutlined :style="{fontSize: '12px'}" />
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item v-for="item in langData" :key="item.key">
            <div class="lang-item" @click="changeLang(item.key)">
              <img v-if="showImg" :src="item.image" alt="">
              <p>{{ item.title }}</p>
            </div>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
  import { reactive, onMounted } from 'vue'
  import { DownOutlined } from '@ant-design/icons-vue'
  import tool from '@/utils/tool'
  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    showImg: {
      type: Boolean,
      default: false
    }
  })

  const { locale } = useI18n()
  const langData = [
    {
      title: 'English',
      key: 'en',
      image: new URL('@/assets/images/lang/en.png', import.meta.url)
    },
    {
      title: '简体中文',
      key: 'zh-cn',
      image: new URL('@/assets/images/lang/cn.png', import.meta.url)
    },
    {
      title: '繁體中文',
      key: 'zh-tw',
      image: new URL('@/assets/images/lang/tw.png', import.meta.url)
    }
  ]

  const langInfo = reactive({
    title: "",
    image: ""
  })

  const getLangInfo = () => {
    const key = locale.value || 'en'
    const langObj = langData.find(item => item.key === key)
    langInfo.title = langObj.title
    langInfo.image = langObj.image.href
  }

  const changeLang = (lang) => {
    if (lang !== locale.value) {
      locale.value = lang
      tool.local.set('vc-online-language', lang)
      window.location.reload()
    }
  }

  onMounted(() => {
    getLangInfo()
  })
</script>

<style lang="less" scoped>
  .lang-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px 0;
    > img {
      width: 22px;
      margin-right: 10px;
    }
    > p {
      font-size: 14px;
      margin-right: 5px;
    }
  }
</style>
