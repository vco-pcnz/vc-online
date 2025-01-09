import { projectDetailApi, projectApplyCancelCheck } from "@/api/process/index"
import router from "@/router"

// 展示操作信息
export const showOprea = (status) => {
  return Boolean(Number(status) > 0 && Number(status) < 1000)
}

// 待提交状态
export const notSubStatus = (status) => {
  return Boolean(Number(status) < 400)
}

// 待审核状态
export const notCheckStatus = (status) => {
  return Boolean(Number(status) >= 400 && Number(status) < 1000)
}

// 可以取消审核
export const canCancelCheck = (status) => {
  return Boolean(Number(status) >= 400 && Number(status) < 500)
}

// 进入表单\审核页面
export const enterPage = (status, uuid) => {
  const num = Number(status)
  let step = ''
  if (num === 100) {
    step = 'two'
  } else if (num === 200) {
    step = 'three'
  } else if (num === 300) {
    step = 'four'
  } else if (num === 400) {
    step = 'five'
  }
  if (step) {
    router.push({
      path: `/process/${step}`,
      query: {
        uuid
      }
    })
  }
}

// 取消项目
export const cancelProjectHandle = async (uuid) => {
  const data = await projectDetailApi({ uuid })
  return data
}

// 取消审核
export const cancelCheckHandle = async (uuid) => {
  const data = await projectApplyCancelCheck({ uuid })
  return data
}