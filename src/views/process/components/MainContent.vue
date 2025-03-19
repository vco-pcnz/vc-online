<template>
  <div>
    <a-spin :spinning="tempLoading" size="large">
      <div class="main-info-container">
        <div v-if="!tempLoading && !queryError">
          <process-header
            :main-step-data="mainStepData"
            :step-data="stepData"
            :current="current"
            :current-step="currentStep"
            :status="currentStatus"
            :status-info="currentStatusInfo"
          >
            <template #left>
              <a-button v-if="current === 1 && !orderSn && pageDone" type="grey" @click="goBack">{{ t('取消请求') }}</a-button>
              <div v-if="orderSn && pageDone" class="Panel">
                <h2 class="Panel-Title">
                  <i class="iconfont back" @click="navigationTo(`/requests/loan`)">&#xe794;</i>
                  <a-tag class="Tag">{{ orderSn }}</a-tag>
                </h2>
              </div>
            </template>
            <template #right>
              <template v-if="orderSn && !currentStep.examine">
                <a-popconfirm
                  :title="t('确定取消项目吗？')"
                  :ok-text="t('确定')"
                  :cancel-text="t('取消')"
                  @confirm="() => cancelHandle()"
                >
                  <a-button
                    type="grey" shape="round" class="uppercase"
                  >{{ t('取消项目') }}</a-button>
                </a-popconfirm>
              </template>

              <div v-if="orderSn && currentStep.examine" class="flex nav-content">
                <a-button class="active" shape="round">{{ t('项目详情1') }}</a-button>
                <a-button
                  v-if="showHeaderTab" shape="round"
                  @click="goHandle('schedule')"
                >{{ t('明细表') }}</a-button>
                <a-button
                  shape="round"
                  @click="goHandle('documents')"
                >{{ t('项目文件') }}</a-button>
              </div>
            </template>
          </process-header>

          <component
            v-if="tempModule"
            :is="tempModule"
            :current-id="currentId"
            :current-step="currentStep"
            :step-data="stepData"
            :previous-page="previousPage"
            :previous-step="previousStep"
            :next-page="nextPage"
            :next-step="nextStep"
            :can-next="canNext"
            @dataDone="dataDone"
          ></component>
        </div>
        <a-empty v-if="!tempLoading && queryError" :image="simpleImage" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue"
  import { useDynamicModule } from "@/hooks/useDynamicModule";
  import ProcessHeader from "./ProcessHeader.vue";
  import { useI18n } from "vue-i18n";
  import { goBack, navigationTo } from "@/utils/tool"
  import { applyCancelProject } from "@/api/process";
  import emitter from '@/event';

  defineProps({
    current: {
      type: Number,
      default: 1
    }
  })

  const { t } = useI18n();
  const {
    tempLoading,
    tempModule,
    currentId,
    queryError,
    simpleImage,
    mainStepData,
    currentStatus,
    currentStatusInfo,
    currentStep,
    previousStep,
    previousPage,
    nextPage,
    nextStep,
    stepData,
    canNext
  } = useDynamicModule();

  const pageDone = ref(false)
  const orderSn = ref('')
  const dataDone = (res) => {
    pageDone.value = true
    orderSn.value = res
  }

  const showHeaderTab = ref(false)

  const goHandle = (page) => {
    const pathname = window.location.pathname
    const step = pathname.slice(pathname.lastIndexOf('/') + 1)
    const href = `/requests/${page}?uuid=${currentId.value}&step=${step}&sn=${orderSn.value}`

    navigationTo(href)
  }

  const cancelHandle = async () => {
    await applyCancelProject({
      uuid: currentId.value
    }).then(() => {
      // 触发列表数据刷新
      emitter.emit('refreshRequestsList')
      navigationTo('/requests/loan')
    })
  }

  onMounted(() => {
    emitter.on('showHeaderTab', () => {
      showHeaderTab.value = true
    });
  })
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';
  .Panel {
    display: flex;
    justify-content: stretch;
    align-items: center;
    gap: 20px;

    .Panel-Avatar {
      flex-shrink: 0;
    }

    .Panel-Title {
      font-size: @fs_2xl;
      font-weight: bold;
      width: 100%;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;

      .back {
        transform: rotate(180deg);
        cursor: pointer;
      }
    }

    .Tag {
      display: inline-flex;
      align-items: center;
      gap: 6.8px;
      height: 30px;
      padding: 10.2px 20.4px;
      border-radius: 37.4px;

      font-weight: 500;
      font-size: 14px;
      line-height: 2;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
      padding: 15px 30px;
      background-color: @clr_charcoal;
      color: @clr_white;

      border-radius: 0 16px 16px 0;
      overflow: hidden;
    }
  }

  .nav-content {
    gap: 10px;
    .ant-btn {
      color: @clr_charcoal;
      border-color: @clr_charcoal;
      &.active,
      &:hover {
        color: @clr_yellow;
        border-color: @clr_yellow;
      }
    }
  }
</style>
