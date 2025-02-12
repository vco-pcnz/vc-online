import { computed, onMounted, ref } from "vue"
import { cloneDeep } from "lodash"
import tool from "@/utils/tool"

export function useTableList(ajaxFn, params = {}, immediate = true) {
  const tableRef = ref()
  const currentParams = ref() // 当前搜索项
  const pageNum = ref(1)
  const pageSize = ref(10)
  const pageTotal = ref(0)
  const tableLoading = ref(true)
  const paramsRef = ref()
  const tableData = ref([])
  const tableOtherData = ref(null)
  const otherInfo = ref(null)

  if (params && params.size) {
    pageSize.value = params.size
  }

  // 数据请求
  const getTableData = async (arg) => {
    tableLoading.value = true
    if (arg) {
      pageNum.value = 1
      if (tool.getObjType(arg) === "object") {
        // 保留上一次搜索参数，分页用
        paramsRef.value = arg
      }
    }

    const argObj = {
      limit: pageSize.value,
      ...params,
      ...paramsRef.value,
      ...arg,
      page: pageNum.value
    }

    await ajaxFn(argObj)
      .then((res) => {
        tableData.value = res.data || []
        pageTotal.value = res.count || 0
        otherInfo.value = res.otherInfo || null

        currentParams.value = argObj
        tableLoading.value = false
      })
      .catch(() => {
        tableLoading.value = false
      })
  }

  // 分页参数
  const pageObj = computed({
    get() {
      return {
        total: pageTotal.value || 0,
        currentPage: pageNum.value,
        pageSize: pageSize.value
      }
    },
    set() {}
  })

  // 分页改变
  const pageChange = (page, size) => {
    pageNum.value = page
    pageSize.value = size
    getTableData()
  }

  // 重置搜索
  const searchReset = () => {
    getTableData({})
  }

  // 默认请求数据
  onMounted(() => {
    if (immediate) {
      getTableData(true)
    }
  })

  return {
    tableRef,
    currentParams,
    tableLoading,
    pageObj,
    tableData,
    tableOtherData,
    otherInfo,
    pageChange,
    searchReset,
    getTableData
  }
}
