<template>
  <div>
    <div v-if="isOpen" class="sys-form-content risk-open-content">
      <div v-if="projectRiskNotes" class="project-risk-notes">
        <p>{{ projectRiskNotes }}</p>
      </div>
      <div class="title-content">
        <p>{{ t('风险项目') }}</p>
        <div class="risk-title-actions">
          <a-button
            v-if="canEditRisk && showSave"
            type="dark"
            size="small"
            shape="round"
            class="uppercase"
            :loading="saveLoading"
            @click="saveHandle"
          >{{ t('保存') }}</a-button>
          <a-button
            v-else-if="canEditRisk"
            type="primary"
            size="small"
            shape="round"
            class="uppercase"
            @click="startAddRisk"
          >{{ t('添加') }}</a-button>
        </div>
      </div>
      <div v-if="canEditRisk && showSave" class="risk-edit-list">
        <div v-for="item in pendingRiskItems" :key="item._key" class="risk-edit-item">
          <a-select v-model:value="item.level" class="level-select" :options="riskLevelOptions" />
          <a-textarea
            v-model:value="item.content"
            :placeholder="t('风险信息')"
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </div>
      </div>
      <div>
        <div v-if="savedRiskItems.length" class="risk-list">
          <div v-for="item in savedRiskItems" :key="item._key" class="risk-item" :class="[item.level, { archived: isRiskArchived(item) }]">
            <div class="risk-item-header">
              <span class="risk-level">{{ riskLevelLabel(item.level) }}</span>
              <div v-if="canEditRisk" class="risk-actions">
                <a-button v-if="!isRiskArchived(item)" class="risk-action-button edit" type="text" shape="circle" size="small" :title="t('编辑')" @click="startEditRisk(item)">
                  <template #icon><EditOutlined /></template>
                </a-button>
                <a-popconfirm
                  v-if="!isRiskArchived(item)"
                  :title="t('确定要归档该风险吗？')"
                  @confirm="archiveRiskItem(item)"
                >
                  <a-button class="risk-action-button archive" type="text" shape="circle" size="small" :title="t('归档')" :loading="statusRiskKey === item._key">
                    <template #icon><InboxOutlined /></template>
                  </a-button>
                </a-popconfirm>
                <a-popconfirm
                  v-else
                  :title="t('确定要重新激活该风险吗？')"
                  @confirm="activateRiskItem(item)"
                >
                  <a-button class="risk-action-button activate" type="text" shape="circle" size="small" :title="t('激活')" :loading="statusRiskKey === item._key">
                    <template #icon><CheckCircleOutlined /></template>
                  </a-button>
                </a-popconfirm>
                <a-popconfirm :title="t('确定要删除该风险吗？')" @confirm="deleteRiskItem(item)">
                  <a-button class="risk-action-button delete" type="text" danger shape="circle" size="small" :title="t('删除')" :loading="deleteRiskKey === item._key">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
            <p class="risk-content">{{ item.content }}</p>
            <div class="risk-time">
              <span>{{ t('创建时间') }}: {{ showDateTime(item.created_at) }}</span>
              <span v-if="isRiskArchived(item)">{{ t('归档时间') }}: {{ showDateTime(item.archived_at) }}</span>
            </div>
          </div>
        </div>
        <p v-else-if="!showSave">{{ t('暂无风险信息') }}</p>
      </div>
    </div>
    <div v-else class="block-item sec mb-5">
      <div class="title-content">
        <vco-process-title :title="t('风险信息')"></vco-process-title>
        <template v-if="canEditRisk && showSave">
          <a-button
            type="dark"
            size="small"
            shape="round"
            class="uppercase"
            :loading="saveLoading"
            @click="saveHandle"
          >{{ t('保存') }}</a-button>
        </template>
        <a-button
          v-else-if="canEditRisk"
          type="primary"
          size="small"
          shape="round"
          class="uppercase"
          @click="startAddRisk"
        >{{ t('添加') }}</a-button>
      </div>
      <div class="sys-form-content">
        <div v-if="showSave && canEditRisk" class="risk-edit-list">
          <div v-for="item in pendingRiskItems" :key="item._key" class="risk-edit-item">
            <a-select v-model:value="item.level" class="level-select" :options="riskLevelOptions" />
            <a-textarea
              v-model:value="item.content"
              :placeholder="t('风险信息')"
              :auto-size="{ minRows: 3, maxRows: 6 }"
            />
          </div>
        </div>
        <div>
          <div v-if="savedRiskItems.length" class="risk-list">
            <div v-for="item in savedRiskItems" :key="item._key" class="risk-item" :class="[item.level, { archived: isRiskArchived(item) }]">
              <div class="risk-item-header">
                <span class="risk-level">{{ riskLevelLabel(item.level) }}</span>
                <div v-if="canEditRisk" class="risk-actions">
                  <a-button v-if="!isRiskArchived(item)" class="risk-action-button edit" type="text" shape="circle" size="small" :title="t('编辑')" @click="startEditRisk(item)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                  <a-popconfirm
                    v-if="!isRiskArchived(item)"
                    :title="t('确定要归档该风险吗？')"
                    @confirm="archiveRiskItem(item)"
                  >
                    <a-button class="risk-action-button archive" type="text" shape="circle" size="small" :title="t('归档')" :loading="statusRiskKey === item._key">
                      <template #icon><InboxOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                  <a-popconfirm
                    v-else
                    :title="t('确定要重新激活该风险吗？')"
                    @confirm="activateRiskItem(item)"
                  >
                    <a-button class="risk-action-button activate" type="text" shape="circle" size="small" :title="t('激活')" :loading="statusRiskKey === item._key">
                      <template #icon><CheckCircleOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                  <a-popconfirm :title="t('确定要删除该风险吗？')" @confirm="deleteRiskItem(item)">
                    <a-button class="risk-action-button delete" type="text" danger shape="circle" size="small" :title="t('删除')" :loading="deleteRiskKey === item._key">
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                </div>
              </div>
              <p class="risk-content">{{ item.content }}</p>
              <div class="risk-time">
                <span>{{ t('创建时间') }}: {{ showDateTime(item.created_at) }}</span>
                <span v-if="isRiskArchived(item)">{{ t('归档时间') }}: {{ showDateTime(item.archived_at) }}</span>
              </div>
            </div>
          </div>
          <p v-else-if="!showSave">{{ t('暂无风险信息') }}</p>
        </div>
      </div>
    </div>
    <a-modal
      v-model:open="editRiskVisible"
      :title="t('编辑风险')"
      :confirm-loading="editRiskLoading"
      @ok="saveEditedRisk"
    >
      <div class="risk-edit-modal">
        <a-select v-model:value="editRiskForm.level" :options="riskLevelOptions" />
        <a-textarea
          v-model:value="editRiskForm.content"
          :placeholder="t('风险信息')"
          :auto-size="{ minRows: 5, maxRows: 12 }"
        />
      </div>
    </a-modal>
    <a-modal
      v-model:open="projectRiskVisible"
      :title="t('风险等级')"
      :confirm-loading="projectRiskLoading"
      @ok="saveProjectRisk"
    >
      <div class="project-risk-form">
        <div>
          <p class="project-risk-label">{{ t('风险等级') }}</p>
          <a-select v-model:value="projectRiskForm.risk_star" :options="projectRiskOptions" />
        </div>
        <div>
          <p class="project-risk-label">{{ t('备注') }}</p>
          <a-textarea v-model:value="projectRiskForm.risk_notes" :auto-size="{ minRows: 4, maxRows: 8 }" />
        </div>
      </div>
    </a-modal>
  </div>
  
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, InboxOutlined } from '@ant-design/icons-vue';
import {
  projectAuditSaveRisk,
  projectAuditArchiveRisk,
  projectAuditActivateRisk,
  projectAuditEditRisk,
  projectAuditDeleteRisk
} from '@/api/process';
import {
  saveRiskInfo,
  archiveRisk as archiveProjectRisk,
  activateRisk as activateProjectRisk,
  editRisk as editProjectRisk,
  deleteRisk as deleteProjectRisk,
  saveRiskLevel
} from '@/api/project/project';
import { message } from 'ant-design-vue/es';
import { hasPermission } from '@/directives/permission';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  isDetails: {
    type: Boolean,
    default: false,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['riskChange']);

const { t } = useI18n();
const riskItems = ref([]);
const hasPendingRisk = computed(() => riskItems.value.some((item) => item._isNew));
const pendingRiskItems = computed(() => riskItems.value.filter((item) => item._isNew));
const riskLevelOrder = { high: 1, medium: 2, low: 3 };
const sortRisks = (items) => [...items].sort((a, b) => {
  const archivedDiff = Number(isRiskArchived(a)) - Number(isRiskArchived(b));
  if (archivedDiff) return archivedDiff;
  const levelDiff = (riskLevelOrder[a.level] || 4) - (riskLevelOrder[b.level] || 4);
  if (levelDiff) return levelDiff;
  return String(b.created_at || '').localeCompare(String(a.created_at || ''));
});
const savedRiskItems = computed(() => sortRisks(riskItems.value.filter((item) => !item._isNew)));
const uuid = computed(() => props.data?.base?.uuid || '');
const projectRiskNotes = computed(() => String(props.data?.base?.risk_notes || '').trim());
const canEditRisk = computed(() => props.isOpen ? hasPermission('projects:details:risk') : !props.isDetails);
const saveLoading = ref(false);
const showSave = ref(false);
const statusRiskKey = ref('');
const deleteRiskKey = ref('');
const editRiskVisible = ref(false);
const editRiskLoading = ref(false);
const editRiskForm = ref({
  _key: '',
  risk_id: '',
  content: '',
  level: 'medium'
});
let riskKeySeed = 0;

const riskLevelOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];
const projectRiskOptions = [
  { label: '--', value: 0 },
  { label: 'Low', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'High', value: 3 },
  { label: 'Urgent', value: 4 }
];
const projectRiskVisible = ref(false);
const projectRiskLoading = ref(false);
const projectRiskForm = ref({
  risk_star: 0,
  risk_notes: ''
});

const createRiskKey = () => `risk-${Date.now()}-${riskKeySeed++}`;

const normalizeRiskItem = (item) => {
  const level = ['high', 'medium', 'low'].includes(item?.level) ? item.level : 'medium';
  const riskId = item?.risk_id ?? item?.id;
  return {
    ...(riskId != null ? { risk_id: riskId } : {}),
    _key: createRiskKey(),
    content: String(item?.content || '').trim(),
    level,
    created_at: item?.created_at || '',
    archived_at: item?.archived_at || '',
    archived: Number(item?.is_archived) === 1 ? 1 : 0,
    _isNew: false
  };
};

const parseRiskItems = (risk) => {
  return Array.isArray(risk)
    ? risk.map(normalizeRiskItem).filter((item) => item.content)
    : [];
};

const emitRiskChange = () => {
  emit('riskChange', savedRiskItems.value.map((item) => ({
    ...(item.risk_id != null ? { risk_id: item.risk_id } : {}),
    content: item.content,
    level: item.level,
    created_at: item.created_at,
    is_archived: item.archived,
    archived_at: item.archived_at
  })));
};

watch(
  () => props.data?.base?.risk,
  (risk) => {
    riskItems.value = parseRiskItems(risk);
  },
  { immediate: true }
);

const addRisk = () => {
  riskItems.value.push({
    _key: createRiskKey(),
    content: '',
    level: 'medium',
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    archived_at: '',
    archived: 0,
    _isNew: true
  });
};

const startAddRisk = () => {
  if (!hasPendingRisk.value) {
    addRisk();
  }
  showSave.value = true;
};

const showDateTime = (value) => value ? dayjs(value).format('DD MMM YYYY HH:mm') : '--';

const openProjectRisk = () => {
  projectRiskForm.value = {
    risk_star: Number(props.data?.base?.risk_star || 0),
    risk_notes: props.data?.base?.risk_notes || ''
  };
  projectRiskVisible.value = true;
};
defineExpose({ openProjectRisk });

const saveProjectRisk = () => {
  projectRiskLoading.value = true;
  saveRiskLevel({
    uuid: uuid.value,
    ...projectRiskForm.value
  })
    .then(() => {
      projectRiskVisible.value = false;
      message.success(t('保存成功'));
      emit('riskChange');
    })
    .finally(() => {
      projectRiskLoading.value = false;
    });
};

const isRiskArchived = (item) => Number(item.archived) === 1;

const riskLevelLabel = (level) => {
  return riskLevelOptions.find((item) => item.value === level)?.label || 'Medium';
};

const submitRisk = (data) => {
  const ajaxFn = props.isOpen ? saveRiskInfo : projectAuditSaveRisk;
  return ajaxFn(data);
};

const saveHandle = () => {
  const pendingRisk = pendingRiskItems.value.find((item) => String(item.content || '').trim());
  if (!pendingRisk) {
    riskItems.value = [...savedRiskItems.value];
    showSave.value = false;
    return;
  }

  saveLoading.value = true;
  submitRisk({
    uuid: uuid.value,
    content: String(pendingRisk.content).trim(),
    level: pendingRisk.level
  })
    .then((res) => {
      const responseData = res;
      const createdRiskId = responseData?.risk_id
        ?? responseData?.id
        ?? responseData?.data?.risk_id
        ?? responseData?.data?.id
        ?? (['string', 'number'].includes(typeof responseData?.data) ? responseData.data : null)
        ?? (['string', 'number'].includes(typeof responseData) ? responseData : null);
      riskItems.value = [
        ...savedRiskItems.value,
        normalizeRiskItem({
          ...(createdRiskId != null ? { risk_id: createdRiskId } : {}),
          content: pendingRisk.content,
          level: pendingRisk.level,
          created_at: responseData?.created_at || pendingRisk.created_at,
          archived_at: responseData?.archived_at || '',
          is_archived: 0
        })
      ];
      emitRiskChange();
      message.success(t('保存成功'));
      showSave.value = false;
    })
    .finally(() => {
      saveLoading.value = false;
    });
};

const submitRiskAction = (openApi, auditApi, item) => {
  const ajaxFn = props.isOpen ? openApi : auditApi;
  return ajaxFn({ uuid: uuid.value, risk_id: item.risk_id });
};

const archiveRiskItem = (item) => {
  statusRiskKey.value = item._key;
  submitRiskAction(archiveProjectRisk, projectAuditArchiveRisk, item)
    .then((res) => {
      item.archived = 1;
      item.archived_at = res?.archived_at || dayjs().format('YYYY-MM-DD HH:mm:ss');
      emitRiskChange();
      message.success(t('保存成功'));
    })
    .finally(() => {
      statusRiskKey.value = '';
    });
};

const activateRiskItem = (item) => {
  statusRiskKey.value = item._key;
  submitRiskAction(activateProjectRisk, projectAuditActivateRisk, item)
    .then(() => {
      item.archived = 0;
      item.archived_at = '';
      emitRiskChange();
      message.success(t('保存成功'));
    })
    .finally(() => {
      statusRiskKey.value = '';
    });
};

const startEditRisk = (item) => {
  editRiskForm.value = {
    _key: item._key,
    risk_id: item.risk_id,
    content: item.content,
    level: item.level
  };
  editRiskVisible.value = true;
};

const saveEditedRisk = () => {
  const content = String(editRiskForm.value.content || '').trim();
  if (!content) {
    message.warning(t('风险信息不能为空'));
    return;
  }

  editRiskLoading.value = true;
  const ajaxFn = props.isOpen ? editProjectRisk : projectAuditEditRisk;
  ajaxFn({
    uuid: uuid.value,
    risk_id: editRiskForm.value.risk_id,
    content,
    level: editRiskForm.value.level
  })
    .then((res) => {
      const item = riskItems.value.find((risk) => risk._key === editRiskForm.value._key);
      if (item) {
        item.content = res?.content || content;
        item.level = res?.level || editRiskForm.value.level;
      }
      emitRiskChange();
      editRiskVisible.value = false;
      message.success(t('保存成功'));
    })
    .finally(() => {
      editRiskLoading.value = false;
    });
};

const deleteRiskItem = (item) => {
  deleteRiskKey.value = item._key;
  submitRiskAction(deleteProjectRisk, projectAuditDeleteRisk, item)
    .then(() => {
      riskItems.value = riskItems.value.filter((risk) => risk._key !== item._key);
      emitRiskChange();
      message.success(t('删除成功'));
    })
    .finally(() => {
      deleteRiskKey.value = '';
    });
};
</script>

<style lang="less" scoped>
.block-item {
  padding: 22px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.title-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;

  :deep(.process-title) {
    border-bottom: none;
    padding-bottom: 0;
    min-height: auto;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
}

.risk-title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-risk-notes {
  margin-bottom: 12px;
  border-radius: 4px;
  padding: 9px 12px;
  background: rgba(191, 148, 37, 0.08);

  p {
    margin: 0;
    color: #555;
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.project-risk-form {
  display: flex;
  flex-direction: column;
  gap: 18px;

  :deep(.ant-select) {
    width: 180px;
  }
}

.project-risk-label {
  margin-bottom: 6px;
  color: #666;
  font-size: 13px;
}

.sys-form-content :deep(.ant-form-item) {
  margin-bottom: 0;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
}

.risk-item {
  padding: 12px 14px;
  border-left: 4px solid;
  border-radius: 6px;
  background: #f7f7f7;

  &.high {
    border-color: #d9363e;
    background: #fff1f0;

    .risk-level {
      color: #d9363e;
    }
  }

  &.medium {
    border-color: #fa8c16;
    background: #fff7e6;

    .risk-level {
      color: #d46b08;
    }
  }

  &.low {
    border-color: #52c41a;
    background: #f6ffed;

    .risk-level {
      color: #389e0d;
    }
  }

  &.archived {
    border-color: #bfbfbf;
    background: #f5f5f5;
    opacity: 0.7;

    .risk-level {
      color: #8c8c8c;
    }
  }
}

.risk-item-header,
.risk-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.risk-item-header {
  color: #8c8c8c;
  font-size: 12px;
}

.risk-actions {
  display: flex;
  align-items: center;
  gap: 2px;

  .risk-action-button {
    width: 28px;
    min-width: 28px;
    height: 28px;
    padding: 0;
    color: #8c8c8c;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &.edit {
      color: #bf9425;

      &:hover {
        color: #9f7818;
        background: rgba(191, 148, 37, 0.12);
      }
    }

    &.archive {
      color: #d46b08;

      &:hover {
        color: #fa8c16;
        background: rgba(250, 140, 22, 0.12);
      }
    }

    &.activate {
      color: #389e0d;

      &:hover {
        color: #52c41a;
        background: rgba(82, 196, 26, 0.1);
      }
    }

    &.delete {
      color: #cf1322;

      &:hover {
        color: #ff4d4f;
        background: rgba(255, 77, 79, 0.1);
      }
    }
  }
}

.risk-edit-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.ant-select) {
    width: 160px;
  }
}

.risk-level {
  font-weight: 700;
  text-transform: uppercase;
}

.risk-content {
  margin: 8px 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.risk-time {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  color: #8c8c8c;
  font-size: 12px;
}

.risk-edit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.risk-edit-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;

  .level-select {
    grid-column: 1;
    grid-row: 1;
    width: 100%;
  }

  :deep(.ant-input) {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    min-width: 0;
  }

}

.risk-open-content {
  .risk-list {
    max-height: 480px;
    padding-right: 6px;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .risk-edit-item {
    grid-template-columns: 1fr;

    .level-select,
    :deep(.ant-input) {
      grid-column: 1;
      grid-row: auto;
    }
  }
}

@media (max-width: 560px) {
  .risk-edit-item {
    grid-template-columns: 1fr;

    .level-select,
    :deep(.ant-input) {
      grid-column: 1;
      grid-row: auto;
    }
  }
}
</style>
