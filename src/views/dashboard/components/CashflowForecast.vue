<template>
  <div>
    <div class="flex title">
      <span class="fs_2xl">Cashflow forecast</span>

      <a-button type="brown" size="small" :class="['picker-btn', { open: isOpen }]" shape="round" @click="isOpen = true">
        {{ tool.showDate(searchForm.date) }} <DownOutlined class="DropdownIcon" />
        <a-date-picker
          class="datePicker"
          inputReadOnly
          :open="isOpen"
          :disabledDate="disabledDateFormat"
          v-model:value="searchForm.date"
          :showToday="false"
          @change="isOpen = false"
          @openChange="(val) => (isOpen = val)"
        />
      </a-button>

      <a-dropdown class="Filter" trigger="click" v-model:open="managers_visible">
        <a-button type="brown" size="small" :class="['picker-btn', { open: managers_visible }]" shape="round" @click="managers_visible = true">
          all managers <DownOutlined class="DropdownIcon" />
        </a-button>
        <template #overlay>
          <div class="Overlay">
            <a-checkbox v-model:checked="managers_all" :disabled="managers_all" class="Filter-Check_all Filter-Check">All managers</a-checkbox>
            <a-checkbox-group v-model:value="managers_select" @change="() => (managers_all = !managers_select.length)">
              <ul class="Filter-List">
                <li class="Filter-Item" v-for="item in managers" :key="item.uuid">
                  <a-checkbox :value="item.uuid" class="Filter-Check">{{ item.name }}</a-checkbox>
                </li>
              </ul></a-checkbox-group
            >
          </div>
        </template>
      </a-dropdown>

      <a-dropdown class="Filter" trigger="click" v-model:open="requests_visible">
        <a-button type="brown" size="small" :class="['picker-btn', { open: requests_visible }]" shape="round" @click="requests_visible = true">
          all requests excluded <DownOutlined class="DropdownIcon" />
        </a-button>
        <template #overlay>
          <div class="Overlay">
            <a-checkbox v-model:checked="requests_all" :disabled="requests_all" class="Filter-Check_all Filter-Check">
              All requests excluded
            </a-checkbox>
            <a-checkbox-group v-model:value="requests_select" @change="() => (requests_all = !requests_select.length)">
              <ul class="Filter-List">
                <li class="Filter-Item" v-for="item in requests" :key="item.uuid">
                  <a-checkbox :value="item.uuid" v-model:checked="requests_all" class="Filter-Check">{{ item.name }}</a-checkbox>
                </li>
              </ul>
            </a-checkbox-group>
          </div>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';

const { t } = useI18n();
const dateFormat = 'YYYY/MM/DD';

const isOpen = ref(false);
const managers_visible = ref(false);
const requests_visible = ref(false);
const managers_all = ref(true);
const requests_all = ref(true);
const managers_select = ref([]);
const requests_select = ref([]);

const managers = ref(
  ref([
    {
      name: 'Danny Chen',
      uuid: '1'
    },
    {
      name: 'Edward Leuschke',
      uuid: '2'
    },
    {
      name: 'Henry Chen',
      uuid: '3'
    },
    {
      name: 'Jessica Li',
      uuid: '4'
    }
  ])
);

const requests = ref([
  {
    name: '101WS Development Limited',
    uuid: '1'
  },
  {
    name: '1664 GNR Development Limited',
    uuid: '2'
  },
  {
    name: '1664 GNR Development Limited',
    uuid: '3'
  },
  {
    name: '1664 GNR Development Limited',
    uuid: '4'
  },
  {
    name: '1664 GNR Development Limited',
    uuid: '5'
  },
  {
    name: 'MDP Property Investment Limited (Wyndham Mews)',
    uuid: '6'
  }
]);

const searchForm = ref({
  date: dayjs()
});

const disabledDateFormat = (current) => {
  const endDate = new Date();
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const props = defineProps([]);

onMounted(() => {});

watch(
  () => managers_all.value,
  (val) => {
    if (val) managers_select.value = [];
  }
);

watch(
  () => requests_all.value,
  (val) => {
    if (val) requests_select.value = [];
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.title {
  border-bottom: 1px solid #e2e5e2;
  padding-bottom: 12px;
  padding-top: 12px;
  line-height: 1.2;
  align-items: center;
  gap: 10px;

  .fs_2xl {
    font-weight: 700;
  }
  .picker-btn {
    font-size: 12px;
    .DropdownIcon {
      font-size: 10px;
      position: relative;
      top: -2px;
      transition: -webkit-transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1), -webkit-transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    &.open {
      .DropdownIcon {
        transform: rotate(180deg);
      }
    }
  }
  .datePicker {
    visibility: hidden;
    height: 0;
    padding: 0;
    width: 0;
    position: absolute;
    left: 0;
    bottom: 0;
  }
}

.Overlay {
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  .ant-checkbox-group {
    padding-left: 0;
  }
  :deep(.ant-checkbox-wrapper) {
    color: #181818;
    .ant-checkbox {
      .ant-checkbox-inner {
        border-color: #181818;
      }
      &:hover {
        .ant-checkbox-inner {
          border-color: #d8b480 !important;
        }
      }
      &.ant-checkbox-checked {
        .ant-checkbox-inner {
          background-color: #d8b480;
          border-color: #d8b480;
        }
        &:after {
          border-color: #d8b480;
        }
      }
      &.ant-checkbox-disabled {
        .ant-checkbox-inner {
          background: rgba(0, 0, 0, 0.04);
          border-color: #d9d9d9;
        }
      }
    }
  }
  .Filter {
    &-Check_all {
      font-weight: 600;
      margin-bottom: 8px;
      margin-top: 16px;
      border-bottom: 1px solid #e2e5e2;
    }
    &-Check {
      display: block;
      align-items: center;
      min-height: 38px;
      padding-left: 24px;
      padding-right: 16px;
      width: 100%;
      box-sizing: border-box;
      display: flex;
    }
    &-List {
      max-height: 380px;
      overflow-y: auto;
      padding-bottom: 8px;
      padding-top: 8px;
      .Filter-Item {
        line-height: 1.5;
        transition: background-color 0.1s cubic-bezier(0.215, 0.61, 0.355, 1);
      }
    }
  }
}
</style>
