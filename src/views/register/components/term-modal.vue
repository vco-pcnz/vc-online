<template>
  <a-modal
    :width="720"
    :open="open"
    :title="`VC ONLINE - ` + t('使用条款')"
    :closable="false"
    @ok="save"
  >
    <div class="text-sm modal-content" v-html="termData"></div>
    <template #footer>
      <div class="modal-footer">
        <a-button @click="handleOk" class="submit-btn" size="large" style="width: 40%">
          OK
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getRegisterTerm } from "@/api/auth";

const { t } = useI18n();

const termData = ref(null);

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(["update:open"]);

const save = () => {
  emit("update:open", false);
};

const handleOk = () => {
  emit("update:open", false);
};

onMounted(() => {
  getRegisterTerm().then((res) => {
    termData.value = res;
  });
});
</script>

<style scoped lang="less">
@import "@/styles/variables.less";
.submit-btn {
  background-color: @clr_charcoal;
  color: @clr_white;
  border: none;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.modal-content {
  height: 70vh;
  overflow-y: auto;
}
</style>
