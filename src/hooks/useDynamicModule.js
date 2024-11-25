import { ref, shallowRef, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Empty } from 'ant-design-vue';
import { templateStep } from "@/api/process"

export function useDynamicModule(defaultName = "one", defaultFile = "default") {
  const route = useRoute();
  const router = useRouter();

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  // 定义响应式数据
  const tempLoading = ref(false);
  const tempFile = ref(defaultFile);
  const tempName = ref(defaultName);
  const tempModule = shallowRef(null);
  const currentId = ref(null);
  const queryError = ref(false)
  const processStepData = ref([])

  // 初始化方法
  const pageInit = async () => {
    tempLoading.value = true;

    await templateStep({
      type: tempFile.value
    }).then(res => {
      processStepData.value = res
    }).catch(() => {
      tempLoading.value = false;
    })

    if (processStepData.value.length) {
      import(`@/views/process/temp/${tempFile.value}/${tempName.value}.vue`)
        .then((res) => {
          if (res) {
            tempModule.value = res.default;
          } else {
            router.push("/404");
          }
          tempLoading.value = false;
        })
        .catch(() => {
          router.push("/404");
          tempLoading.value = false;
        });
    } else {
      router.push("/404");
      tempLoading.value = false;
    }
  };

  // 挂载时的逻辑
  onMounted(() => {
    let pass = true
    const { type, id } = route.query;

    if (type) {
      tempFile.value = type;
    }

    if (id) {
      currentId.value = id;
    } else {
      if (defaultName !== 'one') {
        pass = false
      }
    }

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
    processStepData
  };
}