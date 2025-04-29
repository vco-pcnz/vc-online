<template>
  <div class="demo-content">
    <a-modal v-model:open="open" :footer="null" :maskClosable="false" title="Basic Modal" @ok="open = false">
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </a-modal>
    <h1 class="mt-5 mb-2">语言切换组件</h1>
    <div class="flex gap-5 items-center">
      <div>占位</div>
      <!-- <language-select></language-select> -->
    </div>
    <p>-------------------------------------------------------------------------------------</p>

    <h1 class="mt-5 mb-2">时间显示</h1>
    <p>日期：{{ tool.showDate('2024/02/12') }}</p>
    <p>时间：{{ tool.showTime('2024/02/12') }}</p>
    <p>日期间隔天数：2024-01-13 到 2024-12-22 有多少天： {{ tool.diffDate('2024-01-13', '2024-12-22') }}</p>
    <p>-------------------------------------------------------------------------------------</p>


    <h1 class="mt-5 mb-2">自动获取焦点input</h1>
    <a-input v-model="username" v-focus="true" placeholder="自动获取焦点input" />
    <p>-------------------------------------------------------------------------------------</p>
    
    
    <h1 class="mt-5 mb-2">时间日期选择</h1>
    <a-space :size="12">
      <a-date-picker v-model:value="value1" />
      <a-date-picker v-model:value="value2" picker="week" />
      <a-date-picker v-model:value="value3" picker="month" />
      <a-date-picker v-model:value="value4" picker="quarter" />
      <a-date-picker v-model:value="value5" picker="year" />
    </a-space>

    <h1 class="mt-5 mb-2">头像组件</h1>
    <a-space>
      <vco-avatar src="https://ichef.bbci.co.uk/ace/ws/240/cpsprodpb/vivo/live/images/2024/11/6/e8ab43f3-1f2f-47b1-823e-26113a9d1c2f.jpg"></vco-avatar>
      <vco-avatar src="https://images.pexels.com/photos/3565742/pexels-photo-3565742.jpeg" :size="100"></vco-avatar>
      <vco-avatar src="" :size="80"></vco-avatar>
    </a-space>
    <p>-------------------------------------------------------------------------------------</p>

    <p>-------------------------------------------------------------------------------------</p>
    <h1 class="mt-5 mb-2">英文字符</h1>
    <h2>This is a Header</h2>
    <p class="uppercase" style="font-size: 10px; letter-spacing: 0.5px;">Broker info</p>
    <p>19 x 2 level terraced houses. 7 are 2 bed + study, 1 bath and 1 carpark, 87 m2. 12 are 1 bed + study, 1 bath, 53m2. Good location for rental being close to Middlemore hospital. We issued offer back in 2023 but client delayed starting the project.</p>

    <p>-------------------------------------------------------------------------------------</p>
    <h1 class="mt-5 mb-2">数字</h1>
    <vco-number :value="10486957" :precision="2"></vco-number>
    <vco-number :value="10486957" :bold="true"></vco-number>
    <vco-number :value="10486957" :precision="2" :bold="true"></vco-number>
    <vco-number :value="-10486957" :precision="2" :bold="true"></vco-number>
    <vco-number :value="10486957" color="#dddddd" :precision="2" :bold="true" suffix="%" :line="true"></vco-number>
    <vco-number :value="10486957" color="red" :precision="2" :bold="true" suffix="%" :line="true"></vco-number>
    <vco-number :value="10486957" :precision="2" :bold="true" :end="true"></vco-number>
    <vco-number :value="20" prefix="" suffix="%"></vco-number>

    <p>加法： 0.1 + 0.2 = {{ 0.1 + 0.2 }}</p>
    <p>加法精确： 0.1 + 0.2 = {{ tool.plus(0.1, 0.2) }}</p>
    <p>减法精确： 0.1 - 0.2 = {{ tool.minus(0.1, 0.2) }}</p>
    <p>乘法精确： 0.1 x 0.2 = {{ tool.times(0.1, 0.2) }}</p>
    <p>除法精确： 0.1 / 0.2 = {{ tool.div(0.1, 0.2) }}</p>
    <p>-------------------------------------------------------------------------------------</p>

    <h1 class="mt-5 mb-2">store 数据： </h1>
    <p>{{ appStore.appName }}</p>
    <p>-------------------------------------------------------------------------------------</p>
    <h1 class="mt-5 mb-2">按钮</h1>
    <a-space>
      <a-button type="primary" v-copy="'风刀霜剑啊开发了电视剧啊放假快乐的撒积分'">点击复制</a-button>
      <a-button type="primary" disabled>打开弹窗</a-button>
      <a-button type="primary" loading>Loading</a-button>
      <a-button type="primary-line">primary 类型</a-button>
      <a-button type="primary-line" disabled>primary 类型</a-button>
      <a-button type="primary-line" loading>primary 类型</a-button>
    </a-space>

    <a-space class="flex mt-5">
      <a-button type="cyan">cyan 类型</a-button>
      <a-button type="cyan" disabled>cyan 类型</a-button>
      <a-button type="cyan" loading>cyan 类型</a-button>
      <a-button type="cyan-line">cyan 类型</a-button>
      <a-button type="cyan-line" disabled>cyan 类型</a-button>
      <a-button type="cyan-line" loading>cyan 类型</a-button>
    </a-space>

    <a-space class="flex mt-5">
      <a-button type="grey">grey 类型</a-button>
      <a-button type="grey" disabled>grey 类型</a-button>
      <a-button type="grey" loading>grey 类型</a-button>
      <a-button type="grey-line">grey 类型</a-button>
      <a-button type="grey-line" disabled>grey 类型</a-button>
      <a-button type="grey-line" loading>grey 类型</a-button>
    </a-space>

    <a-space class="flex mt-5">
      <a-button type="dark" class="big">dark 类型 big</a-button>
      <a-button type="dark" class="big shadow">dark 类型 shadow big</a-button>
    </a-space>
    <a-space class="flex mt-5">
      <a-button type="dark">dark 类型</a-button>
      <a-button type="dark" disabled>dark 类型</a-button>
      <a-button type="dark" loading>dark 类型</a-button>
      <a-button type="dark-line">dark 类型</a-button>
      <a-button type="dark-line" disabled>dark 类型</a-button>
      <a-button type="dark-line" loading>dark 类型</a-button>
    </a-space>

    
    <a-space class="flex mt-5">
      <a-button type="brown">brown 类型</a-button>
      <a-button type="brown" shape="round" size="small">brown 类型</a-button>
      <a-button type="brown" disabled>brown 类型</a-button>
      <a-button type="brown" loading>brown 类型</a-button>
    </a-space>

    <a-space class="flex mt-5">
      <a-button type="danger">danger 类型</a-button>
      <a-button type="danger" shape="round" size="small">danger 类型</a-button>
      <a-button type="danger" disabled>danger 类型</a-button>
      <a-button type="danger" loading>danger 类型</a-button>
    </a-space>
    <p>-------------------------------------------------------------------------------------</p>

    <h1 class="mt-5 mb-2">字体库</h1>
    <p>iconfont</p>
    <a-space>
      <i class="iconfont text-5xl">&#xe78c;</i>
      <i class="iconfont text-5xl">&#xe741;</i>
      <i class="iconfont text-5xl">&#xe744;</i>
      <i class="iconfont text-9xl">&#xe74b;</i>
    </a-space>
    <h1 class="mt-5 mb-2">上传组件</h1>
    
      <p>type：image / file / video</p>
      <p>{{ vcoUploadStr }}</p>
      <vco-upload type="image"></vco-upload>
      <vco-upload type="image" :limit="2" :isMultiple="true"></vco-upload>
      <vco-upload type="file"></vco-upload>
      <vco-upload type="video"></vco-upload>
      <p>-------------------------------------------------------------------------------------</p>
      <p>document:提交的数据</p>
      <p>documentList:展示的数据</p>
      <p>{{ vcoUploadModalStr }}</p>
      <vco-upload-modal :uploadType="1" :limit="1"></vco-upload-modal>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import tool from '@/utils/tool';
  import useAppStore from '@/store/modules/app'
  import LanguageSelect from '@/components/language-select/index.vue'

  const appStore = useAppStore()
  
  const value1 = ref();
  const value2 = ref();
  const value3 = ref();
  const value4 = ref();
  const value5 = ref();
  const vcoUploadStr = ref(`<vco-upload v-model:value="form.images"></vco-upload>`)
  const vcoUploadModalStr = ref('<vco-upload-modal v-model:list="documentList" v-model:value="document"></vco-upload-modal>')

  const username = ref('')
  const open = ref(false)
</script>

<style lang="less" scoped>
  .demo-content {
    width: 900px;
    margin: 20px auto;
    padding: 30px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .2);
  }

  h1 {
    font-weight: bold;
    font-size: 16px;
  }
</style>