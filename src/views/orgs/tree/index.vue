<template>
  <vco-page-panel :title="data?.name" :isBack="true"></vco-page-panel>
  <div class="orges-tree">
    <div class="orges-tree-left">
      <div style="background-color: #faf9f9">
        <Detail :showEdit="true" @getDetail="getDetail"></Detail>
      </div>
    </div>
    <div class="orges-tree-right">
      <div class="ops">
        <a-button type="cyan" shape="round" @click="updateTree">{{ t('更新组织') }}</a-button>
        <a-button type="primary" shape="round">{{ t('下载组织') }}</a-button>
      </div>

      <div style="height: 800px" v-if="data.name">
        <!-- https://sangtian152.github.io/vue3-tree-org/demo/#%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95 -->
        <vue3-tree-org :data="data" :center="true" :horizontal="false" :collapsable="true" :node-draggable="false" :disabled="true" :default-expand-level="1" :define-menus="[]">
          <!-- 自定义节点内容 -->
          <template v-slot="{ node }">
            <div class="tree-org-node-info">
              <div class="ops">
                <div @click="showForm(node?.$$data, 'add')">
                  <PlusCircleOutlined />
                </div>
                <FormOutlined v-if="node.$$data.p_uuid" @click="showForm(node?.$$data, 'edit')" />
                <a-popconfirm :title="'Are you sure delete this task?'" ok-text="Yes" cancel-text="No" @confirm="remove(node.$$data)" v-if="node.$$data.p_uuid">
                  <DeleteOutlined />
                </a-popconfirm>
              </div>
              <p>
                <i class="iconfont cer" v-if="node.$$data.type == 4">&#xe632;</i>  
                <i class="iconfont cer" v-else>&#xe679;</i> 
                <span class="value bold"> {{ node.$$data.name }}</span>
              </p>
              <p>
                <span class="label">nzbz</span>: <span class="value">{{ node.$$data.nzbz }}</span>
              </p>
              <p v-if="node.$$data.p_uuid">
                <span class="label">{{ t('所有权l') }}: </span>
                <span class="bold">{{ node.$$data.weight }}</span
                >%
              </p>
            </div>
          </template>
          <!-- 自定义展开按钮 -->
          <template v-slot:expand="{ node }">
            <div>{{ node.children.length }}</div>
          </template>
        </vue3-tree-org>
      </div>
    </div>
  </div>
  <FormModal ref="FormModalRef" @change="loadData"></FormModal>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Detail from '../components/detail.vue';
import FormModal from './form-modal.vue';
import { useRoute } from 'vue-router';
import 'vue3-tree-org/lib/vue3-tree-org.css';
import { stakeOrgList, stakeOrgDel } from '@/api/orgs';
import { PlusCircleOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const route = useRoute();

const { t } = useI18n();

const data = ref({
  p_uuid: '',
  s_uuid: '',
  uuid: '',
  type: '',
  name: '',
  nzbz: '',
  children: []
});

let uuids = [];
const findUuids = (tree, pUuid) => {
  const search = (node) => {
    if (node.uuid === pUuid) {
      uuids.push(node.uuid);
      findUuids(tree, node.p_uuid);
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => search(child));
    }
  };

  tree.forEach((rootNode) => {
    search(rootNode);
  });
  return uuids;
};

const FormModalRef = ref();
const showForm = (val, type) => {
  uuids = [];
  // 当前上级
  if (val.p_uuid) {
    findUuids([data.value], val.p_uuid);
  }
  // 当前下级
  if (val.children && val.children.length) {
    uuids.concat(val.children.map((item) => item.uuid));
  }
  FormModalRef.value.init(val, type, findUuids([data.value], uuids));
};

const remove = (val) => {
  stakeOrgDel({ uuid: val.uuid, p_uuid: val.p_uuid }).then((res) => {
    loadData();
  });
};

const loadData = () => {
  stakeOrgList({ uuid: route.query.uuid }).then((res) => {
    data.value['children'] = res;
  });
};

const updateTree = () => {
  loadData();
};

onMounted(() => {
  loadData();
});

const getDetail = (val) => {
  data.value.type = val?.type;
  data.value.name = val?.name;
  data.value.nzbz = val?.nzbz;
  data.value.uuid = val?.uuid;
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.zm-tree-contextmenu {
  display: none;
}
.orges-tree {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: flex-start;

  .orges-tree-left {
    border-radius: 12px;
  }
  .orges-tree-right {
    flex: 1;
    background-color: #faf9f9;
    border-radius: 12px;
    padding: 30px;
    .ops {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .zm-tree-org {
      margin-top: 10px;
    }
    .tree-org-node-info {
      text-align: left;
      font-size: 14px;
      padding: 10px;
      .label {
        color: @color_cool-grey;
      }
      .value {
        color: @color_black;
      }

      .bold {
        font-weight: 500;
      }
      .cer {
        color: @colorPrimary;
      }
      .iconfont {
        margin-right: 4px;
      }
      .ops {
        margin-bottom: 5px;
        span:hover {
          color: @colorPrimary;
        }
      }
    }
  }
}
</style>
