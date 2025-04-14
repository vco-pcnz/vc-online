import { ref, shallowRef, onMounted } from "vue";
import i18n from "@/i18n";
import { useRoute, useRouter } from "vue-router";
import { Empty } from 'ant-design-vue';
import { projectApproveStep, productGetCode } from "@/api/process"
import { processRoutes } from "@/constant"
import { navigationTo } from "@/utils/tool"
import { useProductStore } from "@/store"

export function useDynamicModule() {
  const route = useRoute();
  const router = useRouter();

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  // 定义响应式数据
  const tempLoading = ref(false);
  const tempFile = ref('default');

  const tempModule = shallowRef(null);
  const currentPageIndex = ref(1);
  const currentId = ref(null);
  const currentStatus = ref(0)
  const currentStatusInfo = ref({})
  const mainStepData = ref([])
  const stepData = ref([])
  const previousStep = ref(null)
  const currentStep = ref(null)
  const nextStep = ref(null)
  const queryError = ref(false)
  const previousPage = ref('')
  const nextPage = ref('')
  const canNext = ref(false)
  const currentRequest = ref('')
  const currentRequestName = ref('')

  // 初始化方法
  const pageInit = async () => {
    tempLoading.value = true;

    const params = currentId.value ? { uuid: currentId.value } : {}
    await projectApproveStep(params).then(res => {
      if (!res.step || !res.step.lenght) {
        currentStatus.value = res.status
        currentStatusInfo.value = res.step.find(item => Number(item.stateCode) === Number(res.status))

        if (!currentStatusInfo.value) {
          queryError.value = true
        }
        mainStepData.value = res.main_step
        stepData.value = res.step
        previousStep.value = res.step[currentPageIndex.value - 1] || null
        currentStep.value = res.step[currentPageIndex.value]
        nextStep.value = res.step[currentPageIndex.value + 1] || null
        canNext.value = nextStep.value && !nextStep.value.examine

        if (currentStep.value.name) {
          const name = i18n.global.t(currentStep.value.name)
          document.title = `${name} - VC Online`
        }
      } else {
        queryError.value = true
      }
    }).catch(() => {
      queryError.value = true
    })

    if (!queryError.value) {
      const currentStepStatus = currentStep.value.stateCode
      if (currentStatusInfo.value.examine) {
        if (currentStatus.value !== currentStepStatus) {
          if (currentId.value) {
            navigationTo(`/requests/details?uuid=${currentId.value}`)
          } else {
            navigationTo('/')
          }
        }
      } else {
        if (currentStepStatus > currentStatus.value) {
          if (currentId.value) {
            navigationTo(`/requests/details?uuid=${currentId.value}`)
          } else {
            navigationTo('/')
          }
        }
      }

      if (currentStep.value) {
        import(`@/views/process/temp/${tempFile.value}/${currentStep.value.code}.vue`)
          .then((res) => {
            if (res) {
              tempModule.value = res.default;
            } else {
              console.log('temp is undefined')

              router.push("/404");
            }
            tempLoading.value = false;
          })
          .catch((err) => {
            console.log(err)

            router.push("/404");
            tempLoading.value = false;
          });
      } else {
        console.log('currentStep is undefined')

        router.push("/404");
        tempLoading.value = false;
      }
    } else {
      tempLoading.value = false;
    }
  };

  // 挂载时的逻辑
  onMounted(async () => {
    let pass = true
    const { p, uuid } = route.query;
    const path = route.path

    const productStore = useProductStore()
    const pData = productStore.openProductData
    const productData = productStore.productData

    tempLoading.value = true
    if (uuid) {
      const temp = await productGetCode({uuid})
      if (!temp) {
        tempLoading.value = false
        queryError.value = true
        pass = false
      } else {
        tempFile.value = temp
      }
      currentId.value = uuid;
    } else {
      
      if (path !== processRoutes[0]) {
        tempLoading.value = false
        pass = false
      } else {
        const len = pData.length

        if (len) {
          if (len > 1 && !p) {
            tempLoading.value = false
            pass = false
          } else {
            if (p) {
              const obj = pData.find(item => item.mark === p)
              if (obj) {
                tempFile.value = obj.code
              } else {
                tempLoading.value = false
                pass = false
              }
            } else {
              tempFile.value = pData[0].code
            }
          }
        } else {
          tempLoading.value = false
          pass = false
        }
      }
    }

    if (tempFile.value) {
      const obj = productData.find(item => item.code === tempFile.value)
      if (obj) {
        currentRequest.value = obj.code
        currentRequestName.value = obj.name
      }
    }

    currentPageIndex.value = processRoutes.findIndex(item => item === path)

    if (currentPageIndex.value) {
      previousPage.value = processRoutes[currentPageIndex.value - 1]
    }
    nextPage.value = processRoutes[currentPageIndex.value + 1]

    if (pass) {
      pageInit();
    } else {
      queryError.value = true
    }
  });

  return {
    tempLoading,
    tempModule,
    currentId,
    queryError,
    simpleImage,
    currentStatus,
    currentStatusInfo,
    mainStepData,
    stepData,
    previousPage,
    nextPage,
    previousStep,
    currentStep,
    nextStep,
    canNext,
    tempFile,
    currentRequest,
    currentRequestName
  };
}
