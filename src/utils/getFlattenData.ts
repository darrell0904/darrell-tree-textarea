import {
  forEach,
  filter,
  isArray,
  cloneDeep,
  toString,
  uniq,
  compact,
  concat,
} from 'lodash';

import { ROOT_ARR_PREFIX, EXIST_ARR_PREFIX, ADD_ARR_PREFIX, HANDLE_ADD_ARR_PREFIX, MAX_LEVEL, ERROR_INFO } from './CONST'

import { FlattenDataObj } from '../types'


/**
 * 返回随机 id
 * 用于新增 树数据时 使用
 */
const _id = () => {
  return `id_${Math.random().toString(12).substring(2)}`;
};

/**
 * 为 扁平数据新增 value/title 属性，返回新的对象
 * 用于 flattenChainedData
 * @param {Object} item : item
 * @param {String} title : 要加的 title 属性
 */
const createNewObj = (item, title): FlattenDataObj => {
  let obj: FlattenDataObj = {};
  const { value, ...rootRest } = item;

  obj.title = title;
  obj.value = value;

  obj = { ...obj, ...rootRest };

  return obj;
};

/**
 * 递归获得 扁平数组
 * @param {*} data : 要处理的数组
 * @param {*} title : 前几级 拼的 title
 * @param {*} level : 当前级数
 */
const getChildFlattenData = (data, title, level) => {
  // 超过最大级数
  if (level > MAX_LEVEL) return false;
  if (!data) return false;

  let arr = [];

  forEach(data, (item) => {
    const { children } = item;

    const rootObj = createNewObj(item, `${title}/${item.value}`);

    if (children) {
      rootObj.hasChildren = true;
      const childrenData = getChildFlattenData(children, `${title}/${item.value}`, level + 1);
      arr.push(rootObj);
      arr = concat(arr, childrenData);
    } else {
      arr.push(rootObj);
    }
  });

  return arr;
};

/**
 * 将后端的 树状结构 数据 扁平化
 * @param {Array} data : 后端 tree_node 数据
 * @param {Number} handleLevel : 要处理的级数
 */
export const flattenChainedData = (data: any) => {
  let arr = [];

  forEach(data, (item) => {
    const childrens = item.children;
    const rootObj = createNewObj(item, item.value);
    if (childrens) {
      rootObj.hasChildren = true;
    }

    arr.push(rootObj);

    if (childrens) {
      // 递归获得所有扁平的数据
      const dataNew = getChildFlattenData(childrens, item.value, 1);
      arr = concat(arr, dataNew);
    }
  });

  return arr;
};

/**
 * 将 扁平数据 转化为 textarea 中 value
 * @param {Array} flattenData : 扁平化数据
 * @param {String} titles : textarea 第一行的 title
 */
export const getTextAreaData = (flattenData, titles) => {
  const newData = filter(flattenData, (item) => {
    return !item.hasChildren && item.status !== 2;
  });

  const arr = [];

  arr.push(titles);

  forEach(newData, (item) => {
    arr.push(item.title);
  });

  return arr;
};

// /**
//  * 处理复制的树数据，id 都置为 0
//  * @param {Array} treeData : 扁平化数据
//  */
// export const handleTreeData = (treeData) => {
//   forEach(treeData, (item) => {
//     if (item.children) {
//       handleTreeData(item.children);
//     }
//     item.id = 0;
//     delete item.parent_id;
//   });
// };

// /**
//  * 通过 value 名 获取对应 item 的 id
//  * 必须要名字和 id 都相同
//  * @param {Array} flattenData : 扁平化数据
//  * @param {String} name : value 名字
//  * @param {number} parentId : 当前级数的 id
//  */
// const getIdByValueName = (flattenData, name, parentId, level) => {
//   if (!flattenData) return;

//   let id = 0;

//   forEach(flattenData, (item) => {
//     if (level === 1) {
//       if (item.value === name) {
//         id = item.id;
//       }
//     }
//     if (level > 1) {
//       if (item.value === name && (item.id === parentId || item.root_id === parentId)) {
//         id = item.id;
//       }
//     }
//   });

//   return id;
// };

// /**
//  * 通过 id 获取对应 item 的 name
//  * @param {Array} flattenData : 扁平化数据
//  * @param {Number} id : id
//  */
// const getValueById = (flattenData, id) => {
//   if (!flattenData) return;

//   let value = '';

//   forEach(flattenData, (item) => {
//     if (item.id === id) {
//       value = item.value;
//     }
//   });

//   return value;
// };

// /**
//  * 通过 id 获取对应 item 的 爸爸 的 id
//  * @param {Array} flattenData : 扁平化数据
//  * @param {Number} id : id
//  */
// const getParentIdById = (flattenData, id) => {
//   if (!flattenData) return;

//   let parentId = 0;

//   forEach(flattenData, (item) => {
//     if (item.id === id) {
//       parentId = item.parent_id;
//     }
//   });

//   return parentId;
// };

// /**
//  * 通过 id 获取对应 item
//  * @param {Array} flattenData : 扁平化数据
//  * @param {Number} id : id
//  */
// const getItemById = (flattenData, id) => {
//   if (!flattenData) return;

//   let curItem = {};

//   forEach(flattenData, (item) => {
//     if (item.id === id) {
//       curItem = item;
//     }
//   });

//   return curItem;
// };

// /**
//  * 删除 之前 组装 树状结构时 使用的 一些自定义属性
//  * 后端不需要
//  * @param {Object} item : 每一项的 item
//  */
// const clearParamsInTreeData = (item) => {
//   delete item.title;
//   delete item.hasChildren;
//   delete item.root_id;

//   if (item.new) {
//     delete item.new;
//     delete item.id;
//     delete item.parent_id;
//   }
// };

// /**
//  * 递归 将扁平数据转化为 树状 结构数据
//  * 用于 transDataFromText
//  * @param {Array} lists : 扁平数据
//  * @param {Number} parent_id : 爸爸的 id
//  */
// const getTreeDataBylists = (lists, parent_id) => {
//   //递归，菜单
//   const tree = [];

//   forEach(lists, (item) => {
//     const newParentId = toString(item.parent_id);
//     const newItemId = newParentId.indexOf('id_') > -1 ? item.parent_id : parseInt(item.parent_id, 10);

//     if (parent_id === newItemId) {
//       const childrenTree = getTreeDataBylists(lists, item.id);
//       if (isArray(childrenTree) && childrenTree.length > 0) {
//         item.children = childrenTree;
//       } else {
//         item.children = null;
//       }
//       // 删除不必要属性
//       clearParamsInTreeData(item);

//       tree.push(item);
//     }
//   });

//   return tree;
// };

// /**
//  * 获取 多级下拉 的标题，textarea 的第一行
//  * @param {String} texts : textarea 的文本
//  */
// export const getLevelTitles = (texts) => {
//   const arr = texts.split('\n');
//   if (arr.length > 0) {
//     return arr[0];
//   }
//   return '';
// };

// /**
//  * 校验 输入内容是否符合要求
//  * @param {String} texts : textarea 的文本
//  */
// export const isEquelLevel = (texts) => {
//   const firstArray = texts.split('\n');
//   const titleTextArr = firstArray[0];

//   if (firstArray.length >= 1) {
//     firstArray.shift();
//   }

//   const textArr = compact(firstArray);

//   // 去重
//   const uniqueContentArr = uniq(textArr);

//   const arrTitleArr = titleTextArr ? titleTextArr.split('/') : [];
//   const arrTitleArrLen = compact(arrTitleArr).length;

//   // 查看 ERROR_INFO
//   let errorCode = 0;

//   // 标题 和 内容的级数 是否相同
//   let contentLenflag = false;

//   // 内容超过最大级数
//   let contentOutlen = false;

//   // 没有查过最大级数，并且 内容级数 大于 标题级数
//   let contentGtTitle = false;

//   // 没有查过最大级数，并且 内容级数 大于 标题级数
//   let contentEmpty = false;

//   forEach(uniqueContentArr, (item) => {
//     const itemArr = item.split('/') || [];

//     // 去掉数组中 非假值元素
//     const newItemArr = compact(itemArr);

//     if (newItemArr.length === arrTitleArrLen) {
//       contentLenflag = true;
//     }

//     if (newItemArr.length > MAX_LEVEL) {
//       contentOutlen = true;
//     }

//     if (newItemArr.length > arrTitleArrLen) {
//       contentGtTitle = true;
//     }
//   });

//   if (uniqueContentArr.length === 0) {
//     contentEmpty = true;
//   }

//   if (!contentLenflag || contentGtTitle) {
//     errorCode = 3;
//   }

//   if (contentOutlen) {
//     errorCode = 4;
//   }

//   if (contentEmpty) {
//     errorCode = 5;
//   }

//   if (arrTitleArrLen === 0) {
//     errorCode = 1;
//   } else if (arrTitleArrLen > MAX_LEVEL) {
//     errorCode = 2;
//   }

//   return {
//     errorCode,
//     ERROR_INFO,
//   };
// };

// /**
//  * 新增 数据 加上相应的属性
//  * 用于 transDataFromText()
//  * @param {Array} levelArr ; 具体某一层级的 textDataParser() 数据
//  * @param {Array} textAreaArr : textDataParser() 数据
//  * @param {Array} newFlattenData : 最新扁平数据（包括新增的）
//  * @param {Number} level : 级数
//  * @param {Number} handleLevel : 要处理的级数
//  */
// const setAddDataParams = (levelArr, TextAreaData, newFlattenData, level, handleLevel) => {
//   // 最原始映射
//   const { namesArrObj } = TextAreaData;

//   forEach(levelArr, (item) => {
//     const valueId = item.id;

//     for (let i = 1; i <= handleLevel; i++) {
//       if (level === i) {
//         if (i === 1) {
//           item.parent_id = 0;
//         } else {
//           const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];
//           // 为了获取 上一级的名字
//           const prevLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level - 1}`];

//           forEach(curLeveArr, (val) => {
//             if (valueId === val.id) {
//               const _pid = val.parent_id;
//               const parentValue = getValueById(prevLeveArr, _pid);
//               const parentId = getIdByValueName(newFlattenData, parentValue, _pid, i - 1);

//               item.parent_id = parentId;
//             }
//           });
//         }
//       }
//     }

//     item.new = true;
//   });

//   return levelArr;
// };

// /**
//  * 递归判断 是否时相同的爸爸
//  * 用于 sameParentNew()
//  * @param {Array} namesArrObj : textDataParser() 转化的数据
//  * @param {Array} itemArr : textarea 每一行的字符串转化的数组
//  * @param {Number} level : 级数
//  * @param {Number} pid : 当前循环 item 的 爸爸的 id
//  */
// const isSameFlag = (namesArrObj, itemArr, level, pid) => {
//   let flag = false;

//   const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];
//   const curLevelText = itemArr[level - 1];

//   let curParentId = 0;
//   // 超过 1 级，下一次 还需要用到的 pid
//   let nextParentId = 0;

//   forEach(curLeveArr, (item) => {
//     if (item.value === curLevelText) {
//       curParentId = item.id;
//     }

//     if (item.id === pid) {
//       nextParentId = item.parent_id;
//     }
//   });

//   if (curParentId === pid) {
//     if (level === 1) {
//       flag = true;
//     } else {
//       flag = isSameFlag(namesArrObj, itemArr, level - 1, nextParentId);
//     }
//   }

//   return flag;
// };

// /**
//  * 判读 当前级数中 是否存在 当前值
//  * 如果值相同，并不是第一级，则需要递归去判断他们的爸爸是否相同，直到第一级
//  * 返回 bool
//  * @param {Array} namesArrObj : textDataParser() 转化的数据
//  * @param {Array} itemArr : textarea 每一行的字符串转化的数组
//  * @param {Number} level : 级数
//  */
// const sameParentNew = (namesArrObj, itemArr, level) => {
//   let flag = false;

//   // 当前级数 Arr
//   const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];

//   // 当前级数的 Text
//   const curLevelText = itemArr[level - 1];

//   forEach(curLeveArr, (item) => {
//     if (item.value === curLevelText) {
//       if (level === 1) {
//         flag = true;
//       } else {
//         const pid = item.parent_id;
//         flag = isSameFlag(namesArrObj, itemArr, level - 1, pid);
//       }
//     }
//   });

//   return flag;
// };

// /**
//  * 获取当前 level 字段值 的爸爸 的 id
//  * @param {Array} namesArrObj : textDataParser() 转化的数据
//  * @param {Array} itemArr : textarea 每一行的字符串转化的数组
//  * @param {Number} level : 当前级数
//  */
// const getParentIdNew = (namesArrObj, itemArr, level) => {
//   let id = 0;

//   // 前一级的 parser 数据
//   const tagetArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level - 1}`];
//   // 前一级的名字，下标从 0 开始
//   const targetItemArrText = itemArr[level - 2];

//   forEach(tagetArr, (item) => {
//     if (item.value === targetItemArrText) {
//       id = item.id;
//     }
//   });

//   return id;
// };

// /**
//  * 将 textarea 数据 转化为 一、二、三 级数据
//  * @param {Array} textArr : textarea 的文本 转化的数组
//  * @param {Number} handleLevel : 要处理的级数
//  */
// const textDataParser = (textArr, handleLevel) => {
//   const uniqueTextArr = uniq(textArr);

//   const namesArrObj = {};

//   for (let i = 1; i <= handleLevel; i++) {
//     namesArrObj[`${ROOT_ARR_PREFIX}_${i}`] = [];
//   }

//   forEach(uniqueTextArr, (item) => {
//     const itemArr = item.split('/');

//     for (let i = 1; i <= handleLevel; i++) {
//       if (!sameParentNew(namesArrObj, itemArr, i) && itemArr[i - 1]) {
//         const obj = {};
//         obj.id = _id();
//         obj.value = itemArr[i - 1];
//         obj.level = i;

//         const parentId = getParentIdNew(namesArrObj, itemArr, i);
//         obj.parent_id = parentId;

//         namesArrObj[`${ROOT_ARR_PREFIX}_${i}`].push(obj);
//       }
//     }
//   });

//   return {
//     namesArrObj,
//   };
// };

// /**
//  * 是否是新增的数据
//  * @param {Array} namesArrObj : textDataParser() 转化的数据
//  * @param {Array} newFlattenData : 扁平化数据
//  * @param {Object} val : 存在数据 当前循环的 item
//  * @param {Number} parent_id : textDataParser() 参数循环 pid
//  * @param {Number} level : 级数
//  */
// const isExistitem = (namesArrObj, newFlattenData, val, parent_id, level) => {
//   let flag = false;

//   const valParentId = parseInt(val.parent_id, 10);

//   // 用于比较前一级的name 是否相同
//   const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level - 1}`];

//   if (getValueById(curLeveArr, parent_id) === getValueById(newFlattenData, valParentId)) {
//     if (level === 2) {
//       flag = true;
//     } else {
//       // 获取前前一级的
//       const curPrevParentId = getParentIdById(curLeveArr, parent_id);
//       const curValItem = getItemById(newFlattenData, valParentId);

//       flag = isExistitem(namesArrObj, newFlattenData, curValItem, curPrevParentId, level - 1);
//     }
//   }

//   return flag;
// };

// const getRootIdByParentId = (flattenData, id) => {
//   if (!flattenData) return;

//   let rootId = 0;

//   forEach(flattenData, (item) => {
//     if (item.id === id) {
//       rootId = item.root_id;
//     }
//   });

//   return rootId;
// };

// const getParentIdByRootId = (flattenData, id) => {
//   if (!flattenData) return;

//   let parentId = 0;

//   forEach(flattenData, (item) => {
//     if (item.root_id === id) {
//       parentId = item.parent_id;
//     }
//   });

//   return parentId;
// };

// const isSameFlagForFlatten = (flattenData, rootId, level, pid, namesArrObj) => {
//   let flag = false;

//   const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];

//   if (rootId === pid) {
//     if (level > 1) {
//       const RootPid = getParentIdByRootId(flattenData, rootId);
//       const newRootId = getRootIdByParentId(flattenData, RootPid);

//       const newPid = getParentIdById(curLeveArr, pid);

//       flag = isSameFlagForFlatten(flattenData, newRootId, level - 1, newPid, namesArrObj);
//     } else {
//       flag = true;
//     }
//   }

//   return flag;
// };

// /**
//  * 将 1，2，3级中，填充已有的数据，并筛选出新增的数据
//  * @param {*} TextAreaData : fillExistData() 处理的数据
//  * @param {*} newFlattenData : 扁平化数据
//  * @param {Number} handleLevel : 要处理的级数
//  */
// const fillExistData = (TextAreaData, newFlattenData, handleLevel) => {
//   const { namesArrObj } = TextAreaData;

//   const existNamesArrObj = {};
//   const addNamesArrObj = {};

//   for (let i = 1; i <= handleLevel; i++) {
//     addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`] = [];
//     existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`] = [];
//   }

//   // flatten 加上 parser 的 映射 id
//   for (let i = 1; i <= handleLevel; i++) {
//     const curNamesArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i}`];

//     forEach(curNamesArr, (item) => {
//       const { value, parent_id, id } = item;

//       forEach(newFlattenData, (val) => {
//         if (i === 1) {
//           if (val.level === i && val.value === value) {
//             val.root_id = id;
//           }
//         }
//         if (i > 1) {
//           if (val.level === i && val.value === value) {
//             const rootId = getRootIdByParentId(newFlattenData, val.parent_id);
//             if (isSameFlagForFlatten(newFlattenData, rootId, i - 1, parent_id, namesArrObj)) {
//               val.root_id = id;
//             }
//           }
//         }
//       });
//     });
//   }

//   for (let i = 1; i <= handleLevel; i++) {
//     const curNamesArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i}`];

//     forEach(curNamesArr, (item) => {
//       let flag = false;

//       const { value, parent_id, id } = item;

//       // 新增数据 obj
//       const addNewObj = { level: i, value, id, new: true, root_id: id };

//       if (i === 1) {
//         addNewObj.parent_id = 0;
//       }

//       forEach(newFlattenData, (val) => {
//         if (value === val.value) {
//           if (val.level === i) {
//             // 第一级
//             if (val.level === 1 && val.parent_id === 0) {
//               const obj = { ...val };
//               existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`].push(obj);
//               flag = true;
//             }
//             // 大于第一级
//             if (val.level !== 1 || val.parent_id !== 0) {
//               if (isExistitem(namesArrObj, newFlattenData, val, parent_id, i)) {
//                 const obj = { ...val };
//                 existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`].push(obj);
//                 flag = true;
//               } else {
//                 // 前一级的数组
//                 const prevNameArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i - 1}`];
//                 const newParentValue = getValueById(prevNameArr, parent_id);
//                 const hasDataBeenId = getIdByValueName(
//                   newFlattenData, newParentValue, parent_id, i - 1,
//                 );

//                 addNewObj.parent_id = hasDataBeenId;
//               }
//             }
//           } else {
//             const prevNameArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i - 1}`];
//             const newParentValue = getValueById(prevNameArr, parent_id);
//             const hasDataBeenId = getIdByValueName(
//               newFlattenData, newParentValue, parent_id, i - 1,
//             );

//             addNewObj.parent_id = hasDataBeenId;
//           }
//         } else {
//           // 前一级的数组
//           const prevNameArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i - 1}`];
//           const newParentValue = getValueById(prevNameArr, parent_id);
//           const hasDataBeenId = getIdByValueName(newFlattenData, newParentValue, parent_id, i - 1);

//           addNewObj.parent_id = hasDataBeenId;
//         }
//       });

//       if (!flag) {
//         addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`].push(addNewObj);
//         newFlattenData.push(addNewObj);
//       }
//     });
//   }

//   return {
//     addNamesArrObj,
//     existNamesArrObj,
//   };
// };

// /**
//  * 为删除数据打上标签，并返回删除数据
//  * @param {*} existData : 已存在数据
//  * @param {*} newFlattenData : 扁平化数据
//  */
// const addTagForDeleleData = (existData, newFlattenData) => {
//   const deleteData = [];

//   forEach(newFlattenData, (item) => {
//     forEach(existData, (val) => {
//       if (!item.new) {
//         if (item.id === val.id && item.level === val.level && item.value === val.value) {
//           item.exist = true;
//         }
//       }
//     });
//   });

//   forEach(newFlattenData, (item) => {
//     if (!item.exist && !item.new) {
//       const obj = { ...item, status: 2 };
//       deleteData.push(obj);
//     }
//   });

//   return deleteData;
// };

// /**
//  * 为新增数据添加相应的属性，为之后转化为树状结构数据作准备
//  * @param {*} handleDataArr : fillExistData() 处理的数据
//  * @param {*} textArr : textarea 的文本 转化的数组
//  * @param {*} newFlattenData : 扁平化数据
//  * @param {Number} handleLevel : 要处理的级数
//  */
// const setParamsInAddData = (handleDataArr, TextAreaData, newFlattenData, handleLevel) => {
//   // 新增的映射
//   const { addNamesArrObj } = handleDataArr;
//   const newAddNamesArrObj = {};

//   for (let i = 1; i <= handleLevel; i++) {
//     newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`] = [];
//   }

//   for (let i = 1; i <= handleLevel; i++) {
//     const curAddName = addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`];
//     newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`] = setAddDataParams(curAddName, TextAreaData, newFlattenData, i);
//   }

//   return {
//     newAddNamesArrObj,
//   };
// };

// /**
//  * 生成最新的数据
//  * @param {*} handleDataArr : fillExistData() 处理的数据
//  * @param {*} newAddNamesArrObj : setParamsInAddData() 得到的新增数据
//  * @param {*} deleteData : addTagForDeleleByLevel() 得到的删除数据
//  * @param {Number} handleLevel : 要处理的级数
//  */
// const getLastData = (handleDataArr, newAddNamesArrObj, deleteData, handleLevel) => {
//   const { existNamesArrObj } = handleDataArr;

//   let lastData = [];

//   let AddLast = [];
//   let ExistLast = [];

//   for (let i = 1; i <= handleLevel; i++) {
//     const curArrayExist = existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`];
//     const curArrayAdd = newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`];

//     ExistLast = concat(ExistLast, curArrayExist);
//     AddLast = concat(AddLast, curArrayAdd);
//   }

//   lastData = concat(lastData, ExistLast, AddLast, deleteData);

//   return lastData;
// };

// /**
//  * 根据标题 几级 来获取删除的数据，并给删除数据打上标签，并返回删除数据
//  * @param {*} handleDataArr : fillExistData() 处理的数据
//  * @param {*} newFlattenData : 扁平化数据
//  * @param {Number} handleLevel : 要处理的级数
//  */
// const addTagForDeleleByLevel = (handleDataArr, newFlattenData, handleLevel) => {
//   const { existNamesArrObj } = handleDataArr;

//   let existData = [];

//   for (let i = 1; i <= handleLevel; i++) {
//     const curArray = existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`];
//     existData = concat(existData, curArray);
//   }

//   const deleteData = addTagForDeleleData(existData, newFlattenData);

//   return deleteData;
// };

// /**
//  * 将 textarea 数据 转化为 后端所需的树状结构数据
//  * @param {Array} flattenData : 扁平数据
//  * @param {String} texts : textarea 的文本
//  */
// export const transDataFromText = (flattenData, texts) => {
//   const arr = texts.split('\n');

//   const newFlattenData = cloneDeep(flattenData);

//   if (arr.length > 1) {
//     arr.shift();
//   }

//   // 解析 TextArea 数据 为 指定 层级映射数据
//   const TextAreaData = textDataParser(arr, MAX_LEVEL);

//   // 填充已有数据
//   // 并 筛选出 新增数据
//   const handleDataArr = fillExistData(TextAreaData, newFlattenData, MAX_LEVEL);

//   // 为 新增数据 newAddNamesArrObj 加上 相应
//   // 为之后转化为 tree 数据作准备
//   const {
//     newAddNamesArrObj,
//   } = setParamsInAddData(handleDataArr, TextAreaData, newFlattenData, MAX_LEVEL);

//   // 根据标题 获取 删除的数据
//   // 并给删除数据打上 status: 2
//   const deleteData = addTagForDeleleByLevel(
//     handleDataArr,
//     newFlattenData,
//     MAX_LEVEL,
//     newAddNamesArrObj,
//   );

//   // 拼装最终数据
//   // 已有、新增、删除数据
//   const newDataLists = getLastData(handleDataArr, newAddNamesArrObj, deleteData, MAX_LEVEL);

//   // 得到 树状数据
//   const _data = getTreeDataBylists(newDataLists, 0);

//   return _data;
// };
