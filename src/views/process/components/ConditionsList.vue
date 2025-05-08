<template>
  <div :class="{ 'about-main-content': about, 'mt-6': !btnAdd }">
    <span @click="openAddEdit(false)"><slot name="add-btn"></slot></span>

    <!-- 人员选择 -->
    <vco-choose-user ref="vcoChooseUserRef" :isMultiple="true" :hide-search="true" :url="userApiUrl" :params="{ uuid: currentId }" @done="userChoiced">
      <div></div>
    </vco-choose-user>

    <a-modal :open="visible" :title="t('添加新状况')" :width="460" :footer="null" :keyboard="false" :maskClosable="false" @cancel="visible = false">
      <div class="sys-form-content mt-5">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-form-item :label="t('日期')" name="date">
            <a-date-picker v-model:value="formState.date" :format="selectDateFormat()" :disabledDate="disabledDateFormat" placeholder="" />
          </a-form-item>
          <a-form-item :label="t('描述')" name="note">
            <a-textarea v-model:value="formState.note" />
          </a-form-item>
          <a-form-item :label="t('处理人')">
            <div class="user-content">
              <div class="content">
                <template v-if="handleUsers.length">
                  <div v-for="(item, index) in handleUsers" :key="index" class="user-item">
                    <vco-user-item :data="item" :main="true"></vco-user-item>
                    <i class="iconfont" @click="removeuserItem(index)">&#xe77d;</i>
                  </div>
                </template>
                <p v-else>{{ t('请选择') }}</p>
              </div>
              <a-button type="link" @click="openUserSelect">{{ t('选择') }}</a-button>
            </div>
          </a-form-item>

          <div class="flex justify-between">
            <vco-user-item :data="{ name: t('显示借款人') }"></vco-user-item>
            <a-switch v-model:checked="formState.is_show" :checkedValue="1" :unCheckedValue="0" />
          </div>
        </a-form>

        <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="subLoading" @click="submitHandle">{{ t('保存') }}</a-button>
      </div>
    </a-modal>

    <div v-if="!btnAdd" class="block-item sec" :class="{ about: about }">
      <vco-process-title v-if="!about" :title="t('状况')">
        <a-button v-if="!isDetails" type="primary" shape="round" size="small" class="uppercase" @click="openAddEdit(false)">{{ t('添加') }}</a-button>
      </vco-process-title>

      <a-spin :spinning="pageLoading" size="large">
        <div class="tab-content" :class="{ 'no-data': !listData.length }">
          <template v-if="listData.length">
            <div v-for="(item, index) in listData" :key="index" class="item" :class="{ pass: item.pass, done: item.is_ok, about: about }">
              <div class="title">
                <p>{{ tool.showDate(item.date) }}</p>
                <div v-if="!item.is_ok && item.do && !isClose" class="flex">
                  <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="delHandle(item)">
                    <a-button :loading="item.delLoading" type="link" class="danger">
                      <i v-if="!item.delLoading" class="iconfont">&#xe8c1;</i>
                    </a-button>
                  </a-popconfirm>
                  <a-button type="link" @click="openAddEdit(item)"><i class="iconfont">&#xe8cf;</i></a-button>

                  <a-popconfirm :title="t('确定已完成吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="checkHandle(item)">
                    <a-button type="link" :loading="item.checkLoading" class="success">
                      <i v-if="!item.checkLoading" class="iconfont">&#xe647;</i>
                    </a-button>
                  </a-popconfirm>
                </div>
              </div>
              <div class="info">{{ item.note }}</div>
              <div class="user-info">
                <vco-user-item v-if="item.is_show" :data="{ name: t('显示借款人') }" :size="20"></vco-user-item>
                <p v-else></p>
                <vco-user-item :data="{ name: item.create_user_name, avatar: item.create_user_avatar }" :size="20"></vco-user-item>
              </div>
            </div>
          </template>
          <template v-if="!pageLoading && !listData.length">
            <div class="no-data-content tab-content no-data">{{ t('暂无数据') }}</div>
          </template>
        </div>
      </a-spin>

      <a-button v-if="about && hasPermission('projects:about:add:conditions') && !isClose" type="brown" shape="round" size="small" class="mt-5" @click="openAddEdit(false)">{{ t('添加') }}</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import {
  auditConditionList,
  projectDetailConditionList,
  projectAuditEditCondition,
  projectDetailEditCondition,
  projectAuditStatusCondition,
  projectDetailStatusCondition,
  projectAuditDeleteCondition,
  projectDetailDeleteCondition
} from '@/api/process';
import tool, { removeDuplicates, selectDateFormat } from '@/utils/tool';
import emitter from '@/event';
import { message } from 'ant-design-vue/es';
import { hasPermission } from '@/directives/permission';

const props = defineProps({
  endDate: {
    type: String,
    default: ''
  },
  currentId: {
    type: [Number, String],
    default: ''
  },
  isDetails: {
    type: Boolean,
    default: false
  },
  isClose: {
    type: Boolean,
    default: false
  },
  about: {
    type: Boolean,
    default: false
  },
  btnAdd: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();

const listData = ref([]);
const handleUsers = ref([]);
const vcoChooseUserRef = ref();

const pageLoading = ref(false);
const getListData = () => {
  pageLoading.value = true;

  const ajaxFn = props.isDetails ? projectDetailConditionList : auditConditionList;
  ajaxFn({
    uuid: props.currentId
  })
    .then((res) => {
      const data = res || [];
      data.forEach((item) => {
        item.pass = dayjs(item.date).format('YYYY-MM-DD').valueOf() < dayjs().format('YYYY-MM-DD').valueOf();
        item.delLoading = false;
        item.checkLoading = false;
      });
      listData.value = res;
      pageLoading.value = false;
    })
    .catch(() => {
      pageLoading.value = false;
    });
};

const visible = ref(false);

const formRef = ref();
const formState = reactive({
  id: 0,
  date: '',
  note: '',
  is_show: 0
});

const formRules = {
  date: [{ required: true, message: t('请选择') + t('日期'), trigger: 'change' }],
  note: [{ required: true, message: t('请输入') + t('描述'), trigger: 'blur' }]
};

const disabledDateFormat = (current) => {
  const endDate = props.endDate || dayjs().format('YYYY-MM-DD');

  if (current && current < new Date().setHours(0, 0, 0, 0)) {
    return true;
  }

  // if (current && current.isAfter(endDate, 'day')) {
  //   return true;
  // }

  return false;
};

const openAddEdit = (data) => {
  if (data) {
    formState.id = data.id;
    formState.date = dayjs(data.date);
    formState.note = data.note;
    formState.is_show = data.is_show;

    const userData = data.do_user || [];
    userData.forEach((item) => {
      item.name = item.user_name;
    });

    handleUsers.value = userData;
  }
  visible.value = true;
};

const subLoading = ref(false);
const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const { id, date, note, is_show } = formState;
      let do_user = [];
      if (handleUsers.value.length) {
        do_user = handleUsers.value.map((item) => item.uuid);
      }
      const params = {
        id,
        date: date.format('YYYY-MM-DD'),
        note,
        is_show,
        uuid: props.currentId,
        do_user
      };

      const ajaxFn = props.isDetails ? projectDetailEditCondition : projectAuditEditCondition;

      subLoading.value = true;

      ajaxFn(params)
        .then(() => {
          message.success(t('提交成功'));
          subLoading.value = false;
          visible.value = false;
          getListData();
        })
        .catch(() => {
          subLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const checkHandle = async (data) => {
  const params = {
    id: data.id,
    uuid: props.currentId,
    is_ok: 1
  };

  const ajaxFn = props.isDetails ? projectDetailStatusCondition : projectAuditStatusCondition;

  data.checkLoading = true;
  await ajaxFn(params)
    .then(() => {
      getListData();
      return true;
    })
    .catch(() => {
      data.checkLoading = false;
      return false;
    });
};

const delHandle = async (data) => {
  const params = {
    id: data.id,
    uuid: props.currentId
  };

  const ajaxFn = props.isDetails ? projectDetailDeleteCondition : projectAuditDeleteCondition;
  data.delLoading = true;
  await ajaxFn(params)
    .then(() => {
      getListData();
      return true;
    })
    .catch(() => {
      data.delLoading = false;
      return false;
    });
};

const userApiUrl = computed(() => {
  const apiUrl = props.isDetails ? 'projectDetail/userCondition' : 'project/audit/userCondition';
  return `${apiUrl}`;
});

const userChoiced = (data) => {
  data.forEach((item) => {
    item.name = item.user_name;
  });

  const dataArr = [...handleUsers.value, ...data];
  handleUsers.value = removeDuplicates(dataArr, 'uuid');
};

const openUserSelect = () => {
  vcoChooseUserRef.value.init();
};

const removeuserItem = (index) => {
  handleUsers.value.splice(index, 1);
};

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      formRef.value.clearValidate();
      formRef.value.resetFields();
      formState.id = 0;
      formState.date = '';
      formState.note = '';
      formState.is_show = 0;

      handleUsers.value = [];
    }
  }
);

onMounted(() => {
  getListData();
  emitter.on('refreshConditionsList', getListData);
});

onUnmounted(() => {
  emitter.off('refreshConditionsList', getListData);
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.tab-content {
  width: 100%;
  margin-top: 10px;
  > .item {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 10px 15px;
    border-radius: 8px;
    margin-top: 15px;
    &.about {
      border-radius: 0;
      padding: 0;
      padding-bottom: 15px;
      border: none;
      background-color: transparent;
      border-bottom: 1px solid #ddd;
    }
    .info {
      word-break: break-all;
    }
    &.pass {
      .info,
      > .title > p {
        color: @color_red-error;
      }
    }
    &.done {
      background-color: #f0f0f0;
      .info,
      > .title > p {
        color: #282828 !important;
      }
      .info {
        text-decoration: line-through;
      }
      * {
        opacity: 0.8;
      }
      &.about {
        background-color: transparent;
      }
    }
    &:first-child {
      margin-top: 0;
    }
    > .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      > p {
        font-weight: 500;
        font-size: 16px;
      }
    }
    :deep(.ant-btn-link) {
      width: 32px !important;
      height: 32px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .info {
      font-size: 14px;
      margin-top: 5px;
    }
    .user-info {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      :deep(.vco-user-item) {
        p {
          font-size: 11px !important;
        }
      }
    }
  }
  &.no-data {
    overflow: hidden;
    height: 100px;
  }
  .no-data-content {
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.user-content {
  width: 100%;
  min-height: 50px;
  border-radius: 10px;
  border: 1px solid #272727;
  background-color: #f7f9f8;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  > .content {
    flex: 1;
    padding-right: 10px;
    border-right: 1px solid #999;
    margin-right: 10px;
    > p {
      color: #999;
    }
    .user-item {
      padding: 8px 10px;
      background-color: #f7f0e6;
      border-radius: 8px;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:first-child {
        margin-top: 0;
      }
      .iconfont {
        font-size: 13px;
        cursor: pointer;
        color: @colorPrimary;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}

.about-main-content {
  margin-top: 0 !important;
}

.block-item.about {
  padding: 0;
  background-color: transparent;
  box-shadow: none;
  border-radius: 0;
  border: none;
}
</style>
