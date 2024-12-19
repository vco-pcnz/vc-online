<template>
  <div class="mt-6">
    <div class="block-item sec">
      <div class="log-content">
        <div v-for="(item, index) in demoData" :key="index" class="log-item">
          <div class="icon">
            <i v-if="item.type === 1" class="iconfont">&#xe889;</i>
            <i v-if="item.type === 2" class="iconfont">&#xe8c5;</i>
            <i v-if="item.type === 3" class="iconfont">&#xe8cf;</i>
            <i v-if="item.type === 4" class="iconfont">&#xe8c1;</i>
          </div>
          <div class="info">
            <p>{{ item.time }}</p>
            <div>{{ item.info }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const demoData = [
    {
      type: 1,
      time: '2024-11-21 12:20:23',
      info: '张小美LM新增了xxxx'
    },
    {
      type: 2,
      time: '2024-11-18 12:20:23',
      info: '张小美LM确认了借款人信息'
    },
    {
      type: 3,
      time: '2024-11-18 12:20:23',
      info: '张小美LM修改了xxx'
    },
    {
      type: 4,
      time: '2024-11-18 12:20:23',
      info: '张小美LM删除了xxx删除了删除了删除了删除了删除了删除了删除了删除了删除了删除了'
    },
    {
      type: 1,
      time: '2024-11-21 12:20:23',
      info: '张小美LM新增了xxxx'
    },
    {
      type: 2,
      time: '2024-11-18 12:20:23',
      info: '张小美LM确认了借款人信息'
    },
    {
      type: 3,
      time: '2024-11-18 12:20:23',
      info: '张小美LM修改了xxx'
    },
    {
      type: 4,
      time: '2024-11-18 12:20:23',
      info: '张小美LM删除了xxx'
    }
  ]
</script>

<style lang="less" scoped>
  .log-content {
    width: 100%;
    height: 250px;
    overflow-y: scroll;
    overflow-x: hidden;
    .log-item {
      display: flex;
      position: relative;
      padding-bottom: 20px;
      &::after {
        content: '';
        display: block;
        width: 2px;
        height: 100%;
        background-color: #0bda8e;
        position: absolute;
        left: 14px;
        z-index: 1;
      }
      &:last-child {
        padding-bottom: 0;
        &::after {
          display: none;
        }
      }
      > .icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #0bda8e;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
      }
      > .info {
        flex: 1;
        padding-left: 15px;
        > p {
          color: #666;
          font-size: 13px;
        }
        > div {
          font-size: 13px;
          margin-top: 2px;
        }
      }
    }
  }
</style>