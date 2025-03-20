<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop>
    <a-modal :width="830" :open="visible" :title="t('详情')" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-row :gutter="24" class="pl-10 pr-10">
          <template v-if="Boolean(process)">
            <a-col v-if="process.cancel_reason || process.decline_reason" :span="24" class="mt-5">
              <a-alert :message="process.cancel_reason ? t('退回原因') : t('拒绝原因')" :description="process.cancel_reason || process.decline_reason" type="error" class="cancel-reason" />
            </a-col>
          </template>

          <a-col :span="8" class="item-txt">
            <p>{{ t('名称') }}</p>
            <p>{{ detailData?.name || '--' }}</p>
          </a-col>
          <a-col :span="8" class="item-txt">
            <p>{{ t('类型f') }}</p>
            <p>
              <span class="cer" v-if="detailData.cate == 1">{{ t('借款人') }}</span>
              <span class="cer" v-if="detailData.cate == 2">{{ t('担保人') }}</span>
              <span class="cer" v-if="detailData.cate == 3">{{ t('投资人') }}</span>
            </p>
          </a-col>
          <a-col :span="8" class="item-txt">
            <p>{{ t('工作') }}</p>
            <p>
              <span class="value" v-if="!!detailData?.job">{{ detailData?.job.join('/') }}</span>
            </p>
          </a-col>

          <template v-if="detailData?.type == 20">
            <a-col :span="8" class="item-txt">
              <p>{{ t('身份证号码') }}</p>
              <p>{{ detailData.idcard || '--' }}</p>
            </a-col>
            <a-col :span="8" class="item-txt">
              <p>{{ t('手机号') }}</p>
              <p>
                <template v-if="detailData.pre && detailData.mobile"> +{{ detailData.pre + ' ' + detailData.mobile }} </template>
                <template v-else-if="detailData.mobile">
                  {{ detailData.mobile }}
                </template>
                <template v-else> -- </template>
              </p>
            </a-col>
            <a-col :span="8" class="item-txt">
              <p>{{ t('邮箱') }}</p>
              <p>{{ detailData.email || '--' }}</p>
            </a-col>
          </template>
          <template v-else>
            <a-col :span="8" class="item-txt">
              <p>{{ t('新西兰商业号码') }}</p>
              <p>{{ detailData.nzbn || '--' }}</p>
            </a-col>
            <a-col :span="8" class="item-txt">
              <p>{{ t('联系人f') }}</p>
              <p>{{ detailData.contactName || '--' }}</p>
            </a-col>
            <a-col :span="8" class="item-txt">
              <p>{{ t('手机号') }}</p>
              <p>
                <template v-if="detailData.pre && detailData.mobile"> +{{ detailData.pre + ' ' + detailData.mobile }} </template>
                <template v-else-if="detailData.mobile">
                  {{ detailData.mobile }}
                </template>
                <template v-else> -- </template>
              </p>
            </a-col>
            <a-col :span="8" class="item-txt">
              <p>{{ t('邮箱') }}</p>
              <p>{{ detailData.email || '--' }}</p>
            </a-col>
            <a-col :span="8" class="item-txt">
              <p>{{ t('邮编') }}</p>
              <p>{{ detailData.postal || '--' }}</p>
            </a-col>

            <a-col :span="24" class="item-txt" v-if="Boolean(detailData?.addr)">
              <p>{{ t('地址1') }}</p>
              <p>{{ detailData.addr || '--' }}</p>
            </a-col>

            <a-col :span="24" class="item-txt" v-if="Boolean(detailData?.address)">
              <p>{{ t('地址2') }}</p>
              <p>{{ detailData.address || '--' }}</p>
            </a-col>

            <a-col :span="24" class="item-txt" v-if="Boolean(detailData?.city)">
              <p>{{ t('地址') }}</p>
              <p>{{ detailData.city || '--' }}</p>
            </a-col>

            <a-col :span="24" class="item-txt">
              <p class="mb-3">{{ t('项目文件') }}</p>
              <a-alert type="warning">
                <template #description>
                  <div style="max-height: 300px; overflow-y: auto; padding-right: 10px">
                    <div class="documents" v-for="(item, index) in detailData.document" :key="index">
                      <vco-file-item :file="item" :showValidity="true" :time="detailData.expire_time[index]"></vco-file-item>
                    </div>
                  </div>
                  <p v-if="!detailData.document.length">--</p>
                </template>
              </a-alert>
            </a-col>
          </template>
        </a-row>

        <div class="mt-10 mb-5">
          <div class="flex justify-end gap-5">
            <a-button type="grey" class="big shadow bold uppercase mb-5 mt-5" @click="updateVisible(false)">{{ t('关闭') }}</a-button>

            <template v-if="Boolean(process && process.has_permission)">
              <vco-form-dialog :title="t('拒绝原因')" :formParams="{ uuid: uuid, id: process.id }" url="project/wash/wdecline" @update="update">
                <a-button type="brown" class="big shadow bold uppercase mb-5 mt-5">{{ t('拒绝请求') }}</a-button>
              </vco-form-dialog>

              <vco-popconfirm :tip="t('您确定要接受该请求吗？')" @update="update()" :formParams="{ uuid: uuid, id: process.id }" url="project/wash/wsaveStep" :btn_text="t('接受请求')"> </vco-popconfirm>
            </template>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { selectDateFormat, expireTimeDefault } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import { washAdd } from '@/api/project/wash';

const { t } = useI18n();
const emits = defineEmits(['update:visible', 'update']);

const props = defineProps({
  uuid: {
    type: String,
    default: ''
  },
  detailData: {
    type: Object,
    default: () => {
      return {
        avatar: '',
        cid: [2, 3],
        is_pid: 0,
        uuid: 'e66120bc-42f6-4e3d-908a-48db72510d32',
        user_uuid: '',
        type: 4,
        name: '33 DENIM LIMITED',
        contactName: '',
        idcard: '',
        nzbn: '9429052387562',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        email_ok: 0,
        pre: '',
        mobile: '',
        mobile_ok: 0,
        province_code: 3354,
        city_code: '',
        district_code: '',
        province_code_name: 'Auckland',
        city_code_name: '',
        district_code_name: '',
        addr: '100 Kervil Avenue, Te Atatu Peninsula',
        address: '',
        suburb: '',
        postal: '0610',
        city: '100 Kervil Avenue, Te Atatu Peninsula, Auckland, New Zealand',
        job: '',
        is_expire: 0,
        expire_time: null,
        document: '',
        note: null,
        ptype: 0,
        open_count: 0,
        close_count: 0,
        apply_count: 1
      };
    }
  },
  process: {
    type: Object
  },
  edit: {
    type: Boolean,
    default: false
  }
});

const update = () => {
  emits('update');
  updateVisible(false);
};

const visible = ref(false);
const updateVisible = (value) => {
  visible.value = value;
  // emits('update:visible', value);
};

const init = () => {
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.item-txt {
  margin-top: 25px;
  > p {
    font-size: 13px;
    &:first-child {
      color: #999;
    }
    &:last-child {
      font-size: 14px;
      margin-top: 5px;
      word-break: break-all;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 16px !important;
  }
}
.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

:deep(.ant-alert-warning) {
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
}
</style>
