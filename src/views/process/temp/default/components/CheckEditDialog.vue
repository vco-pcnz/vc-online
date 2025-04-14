<template>
  <a-modal
    :open="visible"
    :title="title"
    :width="840"
    :footer="null"
    :keyboard="false"
    @update:open="updateVisible"
  >
    <component
      v-if="currentComponent"
      :is="currentComponent"
      :info-data="infoData"
      :current-step="currentStep"
      :code="code"
      :check="true"
      @checkDone="doneHandle"
    ></component>
  </a-modal>
</template>

<script setup>
  import { watch, shallowRef, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import OneForm from "../tpl-one.vue";
  import TwoForm from "../tpl-two.vue";
  import ThreeForm from "../tpl-three.vue";
  import FourForm from "../tpl-four.vue";

  const emits = defineEmits(['done', 'update:visible']);

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    infoData: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    },
    code: {
      type: String,
      default: ''
    },
    currentStep: {
      type: Object
    }
  })

  const { t } = useI18n();

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const title = computed(() => {
    let txt = ''
    if (props.type === 'one') {
      txt = t('借款人信息')
    } else if (props.type === 'two') {
      txt = t('项目信息')
    } else if (props.type === 'three') {
      txt = t('证件资料')
    } else if (props.type === 'four') {
      txt = t('借款信息')
    }
    return txt
  })

  const doneHandle = () => {
    updateVisible()
    emits('done')
  }

  const componentData = {
    'one': OneForm,
    'two': TwoForm,
    'three': ThreeForm,
    'four': FourForm
  }

  const currentComponent = shallowRef(null)

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.type && componentData[props.type]) {
          currentComponent.value = componentData[props.type]
        }
      } else {
        currentComponent.value = null
      }
    }
  );
</script>
