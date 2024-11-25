import { createIframeComponent } from "./iframe-component";
import Layout from "@/layout/index.vue"

const modules = import.meta.glob('/src/views/**/index.vue');

function formatTreeData(data, formatter, childrenField = "children", resultChildrenField = "children", parent) {
  const result = [];
  data == null ? void 0 : data.forEach((d, i) => {
    var _a;
    const item = formatter(d, i, parent);
    if (item) {
      if ((_a = d[childrenField]) == null ? void 0 : _a.length) {
        item[resultChildrenField] = formatTreeData(
          d[childrenField],
          formatter,
          childrenField,
          resultChildrenField,
          item
        );
      }
      result.push(item);
    }
  });
  return result;
}

function isExternalLink(url) {
  return !!(url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")));
}

function toTreeData(option) {
  const data = option.data;
  const idField = option.idField || "id";
  const parentIdField = option.parentIdField || "parentId";
  const childrenField = option.childrenField || "children";
  const parentIdIsNull = option.parentId == null;
  const parentId = parentIdIsNull ? [] : option.parentId;
  const addParentIds = option.addParentIds;
  const parentIdsField = option.parentIdsField || "parentIds";
  const parentIds = option.parentIds;
  if (data == null) {
    return [];
  }
  if (parentIdIsNull) {
    data.forEach((d) => {
      let flag = true;
      for (let i = 0; i < data.length; i++) {
        if (d[parentIdField] == data[i][idField]) {
          flag = false;
          break;
        }
      }
      if (flag) {
        parentId.push(d[parentIdField]);
      }
    });
  }
  const result = [];
  data.forEach((d) => {
    if (d[idField] == d[parentIdField]) {
      throw new Error(
        [
          "data error: {",
          idField + ": ",
          JSON.stringify(d[idField]),
          parentIdField + ": ",
          JSON.stringify(d[parentIdField]),
          "}"
        ].join("")
      );
    }
    if (Array.isArray(parentId) ? parentId.includes(d[parentIdField]) : d[parentIdField] == parentId) {
      const r = { ...d };
      const children = toTreeData({
        data,
        idField,
        parentIdField,
        childrenField,
        parentId: d[idField],
        addParentIds,
        parentIdsField,
        parentIds: (parentIds ?? []).concat([d[idField]])
      });
      if (children.length > 0) {
        r[childrenField] = children;
      }
      if (addParentIds) {
        r[parentIdsField] = parentIds ?? [];
      }
      result.push(r);
    }
  });
  return result;
}

function eachTreeData(data, callback, childrenField = "children", parent) {
  if (data) {
    data.forEach((d, i) => {
      var _a;
      if (callback && callback(d, i, parent) !== false && ((_a = d[childrenField]) == null ? void 0 : _a.length)) {
        eachTreeData(d[childrenField], callback, childrenField, d);
      }
    });
  }
}


function pathIsAdd(path, data) {
  let isAdd = false;
  eachTreeData(data, (item) => {
    if (path === item.path) {
      isAdd = true;
      return false;
    }
  });
  return isAdd;
}


function camelCase(str) {
  const val = str.replace(/[-|/](\w)/g, (_, c) => c ? c.toUpperCase() : "");
  return val.charAt(0).toUpperCase() + val.slice(1);
}


function formatMenus(data, childField = "children") {
  let homePath;
  let homeTitle;
  const menus = formatTreeData(
    data,
    (item) => {
      var _a, _b;
      const meta = typeof item.meta === "string" ? JSON.parse(item.meta || "{}") : item.meta;
      const path = (meta == null ? void 0 : meta.fullPath) || item.fullPath || item.path;
      const component = ((_a = item.component) == null ? void 0 : _a.startsWith("/")) ? item.component.substring(1) : item.component;
      const menu = {
        path,
        component,
        name: (meta == null ? void 0 : meta.name) || item.name,
        redirect: item.redirect,
        meta: {
          title: item.title,
          icon: item.icon,
          color: item.color,
          hide: item.hide,
          active: item.active,
          breadcrumb: item.breadcrumb,
          hideFooter: item.hideFooter,
          hideSidebar: item.hideSidebar,
          tabUnique: item.tabUnique,
          closable: item.closable,
          keepAlive: item.keepAlive,
          routePath: item.path,
          ...meta
        }
      };
      // const children = (_b = item[childField]) == null ? void 0 : _b.filter(
      //   (d) => {
      //     var _a2;
      //     return !(((_a2 = d.meta) == null ? void 0 : _a2.hide) ?? d.hide);
      //   }
      // );

      // 不过滤 hide
      const children = (_b = item[childField]) == null ? void 0 : _b.filter(
        (d) => {
          var _a2;
          // 只过滤掉 hide 为 true 的情况，其余保留
          return ((_a2 = d.meta) == null ? void 0 : _a2.hide) !== true && d.hide !== true;
        }
      );

      if (!(children == null ? void 0 : children.length)) {
        if (!homePath && path && !isExternalLink(path)) {
          homePath = path;
          homeTitle = menu.meta.title;
        }
      } else {
        const childPath = children[0].path || children[0].fullPath;
        if (childPath) {
          if (!menu.redirect && !menu.component) { // 父级没有组件才设置重定向路由
            menu.redirect = childPath;
          }
          if (!menu.path) {
            menu.path = childPath.substring(0, childPath.lastIndexOf("/"));
          }
        }
      }
      if (!path) {
        console.error("菜单 path 不能为空且要唯一: ", item);
        return;
      }
      return menu;
    },
    childField
  );
  return { menus, homePath, homeTitle };
}


function menuToRoutes(menus, getComponent, added, redirectPath, redirectComponent, redirectPathMatch, parentPath) {
  if (!(menus == null ? void 0 : menus.length)) {
    return;
  }
  const routes = [];
  const addedRoutes = added ? [...added] : [];
  menus.forEach((item) => {
    const route = menuToRoute(
      item,
      getComponent,
      addedRoutes,
      redirectPath,
      redirectComponent,
      redirectPathMatch
    );
    if (route) {
      routes.push(route);
    }
  });
  if (routes.length && redirectPath && redirectComponent) {
    const pathMatch = redirectPathMatch ?? "/:path(.*)";
    const temp = {
      path: (parentPath ?? "") + redirectPath + pathMatch,
      meta: { hideFooter: true }
    };
    const route = menuToRoute(temp, () => redirectComponent, []);
    if (route) {
      routes.push(route);
    }
  }
  return routes;
}
function menuToRoute(menu, getComponent, added, redirectPath, redirectComponent, redirectPathMatch) {
  const meta = { ...menu.meta };
  const p = meta.routePath || menu.path;
  const path = (p == null ? void 0 : p.includes("?")) ? p.substring(0, p.indexOf("?")) : p;
  if (path && !isExternalLink(path) && !pathIsAdd(path, added)) {
    const name = menu.name || camelCase(path);
    let component;
    if (menu.component && isExternalLink(menu.component)) {
      component = createIframeComponent(name, menu.component);
      meta.iframe = menu.component;
      meta.hideFooter = true;
    } else {
      component = getComponent(menu.component, menu, name);
    }
    added.push({ path });
    return {
      name,
      path,
      meta,
      component,
      redirect: menu.redirect,
      children: menuToRoutes(
        menu.children,
        getComponent,
        added,
        redirectPath,
        redirectComponent,
        redirectPathMatch,
        path
      )
    };
  }
}


/**
 * 动态路由
 * @param menus 菜单数据
 * @param homePath 主页地址
 */
function getMenuRoutes(menus, homePath) {
  const routes = [];

  // 路由铺平处理
  eachTreeData(menuToRoutes(menus, getComponent), (route) => {
    routes.push(Object.assign({}, route, { children: void 0 }));
  });
  return {
    path: '/',
    component: Layout,
    redirect: homePath,
    children: routes
  };
}

/**
 * 解析路由组件
 * @param component 组件名称
 */
function getComponent(component) {
  if (component) {
    const module = modules[`/src/views/${component}.vue`];
    if (!module) {
      return modules[`/src/views/${component}/index.vue`];
    }
    return module;
  }
}


export {
  formatMenus,
  menuToRoute,
  menuToRoutes,
  toTreeData,
  getMenuRoutes
};
