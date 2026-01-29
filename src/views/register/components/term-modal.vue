<template>
  <a-modal
    :width="750"
    :open="open"
    :title="`LENDR ONLINE - ` + t('使用条款')"
    :closable="false"
    @ok="save"
  >
    <div class="modal-content rich-text-content" v-html="termData"></div>
    <template #footer>
      <div class="modal-footer">
        <a-button
          @click="handleOk"
          class="submit-btn"
          size="large"
          style="width: 40%"
        >
          OK
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getRegisterTerm } from "@/api/auth";

const { t } = useI18n();

const termData = ref(null);

const props = defineProps(["open", "type"]);

const emit = defineEmits(["update:open"]);

const save = () => {
  emit("update:open", false);
};

const handleOk = () => {
  emit("update:open", false);
};

watch(
  () => props.open,
  (val) => {
    if (val) {
      getRegisterTerm({ type: props.type }).then((res) => {
        termData.value = res;
      });
    }
  }
);
</script>

<style scoped lang="less">
@import "@/styles/variables.less";
.submit-btn {
  background-color: @clr_charcoal;
  color: @clr_white;
  border: none;
  font-weight: 500;
}

.submit-btn:hover {
  color: @clr_white;
}

.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.modal-content {
  height: 70vh;
  padding-right: 20px;
  overflow-y: auto;
}
</style>
