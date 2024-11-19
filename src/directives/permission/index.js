import { useUserStore } from "@/store";

/* 判断数组是否有某些值 */
function arrayHas(array, value){
  if (!value) {
    return true;
  }
  if (!array) {
    return false;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (array.indexOf(value[i]) === -1) {
        return false;
      }
    }
    return true;
  }
  return array.indexOf(value) !== -1;
}

/**
 * 是否有某些权限
 * @param value 权限字符或字符数组
 */
export function hasPermission(value) {
  const userStore = useUserStore();
  return arrayHas(userStore?.authorities, value);
}

const permission = (el, binding) => {
  if (!hasPermission(binding.value)) {
    el.parentNode?.removeChild(el);
  }
}

export default {
  mounted(el, binding) {
    permission(el, binding)
  }
};
