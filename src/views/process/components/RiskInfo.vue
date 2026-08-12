<template>
  <div>
    <div v-if="isOpen" class="sys-form-content risk-open-content">
      <div class="title-content">
        <p>Risk</p>
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
          <div v-for="item in savedRiskItems" :key="item._key" class="risk-item" :class="[item.level, { expired: isRiskExpired(item) }]">
            <div class="risk-item-header">
              <span class="risk-level">{{ riskLevelLabel(item.level) }}</span>
              <a-popconfirm
                v-if="canEditRisk && !isRiskExpired(item)"
                :title="t('确定要将该风险标记为过期吗？')"
                @confirm="expireRisk(item)"
              >
                <a-button type="link" size="small" :loading="expiringRiskKey === item._key">{{ t('标记过期') }}</a-button>
              </a-popconfirm>
            </div>
            <p class="risk-content">{{ item.content }}</p>
            <div class="risk-time">
              <span>{{ t('创建时间') }}: {{ showDateTime(item.created_at) }}</span>
              <span v-if="isRiskExpired(item)">{{ t('过期时间') }}: {{ showDateTime(item.expires_at) }}</span>
            </div>
          </div>
        </div>
        <p v-else-if="!showSave">{{ t('暂无风险信息') }}</p>
      </div>
    </div>
    <div v-else class="block-item sec">
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
            <div v-for="item in savedRiskItems" :key="item._key" class="risk-item" :class="[item.level, { expired: isRiskExpired(item) }]">
              <div class="risk-item-header">
                <span class="risk-level">{{ riskLevelLabel(item.level) }}</span>
                <a-popconfirm
                  v-if="canEditRisk && !isRiskExpired(item)"
                  :title="t('确定要将该风险标记为过期吗？')"
                  @confirm="expireRisk(item)"
                >
                  <a-button type="link" size="small" :loading="expiringRiskKey === item._key">{{ t('标记过期') }}</a-button>
                </a-popconfirm>
              </div>
              <p class="risk-content">{{ item.content }}</p>
              <div class="risk-time">
                <span>{{ t('创建时间') }}: {{ showDateTime(item.created_at) }}</span>
                <span v-if="isRiskExpired(item)">{{ t('过期时间') }}: {{ showDateTime(item.expires_at) }}</span>
              </div>
            </div>
          </div>
          <p v-else-if="!showSave">{{ t('暂无风险信息') }}</p>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { projectAuditSaveRisk } from '@/api/process';
import { saveRiskInfo } from '@/api/project/project';
import { message } from 'ant-design-vue/es';
import { hasPermission } from "@/directives/permission"

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

const { t } = useI18n();
const riskItems = ref([]);
const hasPendingRisk = computed(() => riskItems.value.some((item) => item._isNew));
const pendingRiskItems = computed(() => riskItems.value.filter((item) => item._isNew));
const savedRiskItems = computed(() => riskItems.value.filter((item) => !item._isNew));
const uuid = computed(() => props.data?.base?.uuid || '');
const canEditRisk = computed(() => props.isOpen ? hasPermission('projects:details:risk') : !props.isDetails);
const saveLoading = ref(false);
const showSave = ref(false);
const expiringRiskKey = ref('');
let riskKeySeed = 0;

const riskLevelOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];

const createRiskKey = () => `risk-${Date.now()}-${riskKeySeed++}`;

const normalizeRiskItem = (item) => {
  if (typeof item === 'string') {
    return {
      _key: createRiskKey(),
      content: item.trim(),
      level: 'medium',
      created_at: '',
      expires_at: '',
      expired: 0,
      _isNew: false
    };
  }

  const level = ['high', 'medium', 'low'].includes(item?.level) ? item.level : 'medium';
  const riskId = item?.risk_id ?? item?.id;
  return {
    ...(riskId != null ? { risk_id: riskId } : {}),
    _key: createRiskKey(),
    content: String(item?.content || '').trim(),
    level,
    created_at: item?.created_at || '',
    expires_at: item?.expired_at || item?.expires_at || '',
    expired: Number(item?.is_expired ?? item?.expired) === 1 ? 1 : 0,
    _isNew: false
  };
};

const parseRiskItems = (risk) => {
  if (Array.isArray(risk)) {
    return risk.map(normalizeRiskItem).filter((item) => item.content);
  }

  if (typeof risk === 'string' && risk.trim()) {
    try {
      const parsed = JSON.parse(risk);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeRiskItem).filter((item) => item.content);
      }
    } catch (_) {
      // 兼容旧版换行分隔的风险信息
    }
  }

  return String(risk || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeRiskItem);
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
    expires_at: '',
    expired: 0,
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

const isRiskExpired = (item) => {
  if (Number(item.expired) === 1) return true;
  return Boolean(item.expires_at && dayjs(item.expires_at).isBefore(dayjs()));
};

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
    level: pendingRisk.level,
    is_expired: 0
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
          expires_at: responseData?.expired_at || responseData?.expires_at || '',
          is_expired: 0
        })
      ];
      message.success(t('保存成功'));
      showSave.value = false;
    })
    .finally(() => {
      saveLoading.value = false;
    });
};

const expireRisk = (item) => {
  expiringRiskKey.value = item._key;

  submitRisk({
    uuid: uuid.value,
    risk_id: item.risk_id,
    is_expired: 1
  })
    .then((res) => {
      item.expired = 1;
      item.expires_at = res?.expired_at || res?.expires_at || dayjs().format('YYYY-MM-DD HH:mm:ss');
      message.success(t('保存成功'));
    })
    .finally(() => {
      expiringRiskKey.value = '';
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

  &.expired {
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
