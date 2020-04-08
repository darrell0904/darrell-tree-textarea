import { forEach, cloneDeep, concat } from 'lodash';

import { ROOT_ARR_PREFIX, EXIST_ARR_PREFIX, ADD_ARR_PREFIX, HANDLE_ADD_ARR_PREFIX } from './CONST'

import { _id } from './utils'


import { FlattenDataObj, errorInfo, parserItemObj, parserRootObj, existAndAddDataObj, newAddNamesArrObj, addNewObj } from '../types'

import { parserRootData } from './textDataParser'

/**
 * 通过 value 名 获取对应 item 的 id
 * 必须要名字和 id 都相同
 * @param {Array} flattenData : 扁平化数据
 * @param {String} name : value 名字
 * @param {number} parentId : 当前级数的 id
 */
const getIdByValueName = (flattenData, name, parentId, level) => {
  if (!flattenData) return;

  let id = 0;

  forEach(flattenData, (item) => {
    if (level === 1) {
      if (item.value === name) {
        id = item.id;
      }
    }
    if (level > 1) {
      if (item.value === name && (item.id === parentId || item.root_id === parentId)) {
        id = item.id;
      }
    }
  });

  return id;
};

/**
 * 通过 id 获取对应 item 的 name
 * @param {Array} flattenData : 扁平化数据
 * @param {Number} id : id
 */
const getValueById = (flattenData, id) => {
  if (!flattenData) return;

  let value = '';

  forEach(flattenData, (item) => {
    if (item.id === id) {
      value = item.value;
    }
  });

  return value;
};

/**
 * 通过 id 获取对应 item 的 爸爸 的 id
 * @param {Array} flattenData : 扁平化数据
 * @param {Number} id : id
 */
const getParentIdById = (flattenData, id) => {
  if (!flattenData) return;

  let parentId = 0;

  forEach(flattenData, (item) => {
    if (item.id === id) {
      parentId = item.parent_id;
    }
  });

  return parentId;
};

/**
 * 通过 id 获取对应 item
 * @param {Array} flattenData : 扁平化数据
 * @param {Number} id : id
 */
const getItemById = (flattenData, id) => {
  if (!flattenData) return;

  let curItem = {};

  forEach(flattenData, (item) => {
    if (item.id === id) {
      curItem = item;
    }
  });

  return curItem;
};

/**
 * 是否是新增的数据
 * @param {Array} namesArrObj : textDataParser() 转化的数据
 * @param {Array} newFlattenData : 扁平化数据
 * @param {Object} val : 存在数据 当前循环的 item
 * @param {Number} parent_id : textDataParser() 参数循环 pid
 * @param {Number} level : 级数
 */
const isExistitem = (namesArrObj, newFlattenData, val, parent_id, level) => {
  let flag = false;

  const valParentId = parseInt(val.parent_id, 10);

  // 用于比较前一级的name 是否相同
  const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level - 1}`];

  if (getValueById(curLeveArr, parent_id) === getValueById(newFlattenData, valParentId)) {
    if (level === 2) {
      flag = true;
    } else {
      // 获取前前一级的
      const curPrevParentId = getParentIdById(curLeveArr, parent_id);
      const curValItem = getItemById(newFlattenData, valParentId);

      flag = isExistitem(namesArrObj, newFlattenData, curValItem, curPrevParentId, level - 1);
    }
  }

  return flag;
};

const getRootIdByParentId = (flattenData, id) => {
  if (!flattenData) return;

  let rootId = 0;

  forEach(flattenData, (item) => {
    if (item.id === id) {
      rootId = item.root_id;
    }
  });

  return rootId;
};

const getParentIdByRootId = (flattenData, id) => {
  if (!flattenData) return;

  let parentId = 0;

  forEach(flattenData, (item) => {
    if (item.root_id === id) {
      parentId = item.parent_id;
    }
  });

  return parentId;
};

/**
 * 表示 是否 textDataParser 数据对应
 * @param flattenData 
 * @param rootId 
 * @param level 
 * @param pid 
 * @param namesArrObj 
 */
const isSameFlagForFlatten = (flattenData, rootId, level, pid, namesArrObj) => {
  let flag = false;

  const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];

  if (rootId === pid) {
    if (level > 1) {
      const RootPid = getParentIdByRootId(flattenData, rootId);
      const newRootId = getRootIdByParentId(flattenData, RootPid);

      const newPid = getParentIdById(curLeveArr, pid);

      flag = isSameFlagForFlatten(flattenData, newRootId, level - 1, newPid, namesArrObj);
    } else {
      flag = true;
    }
  }

  return flag;
};

/**
 * 将 1，2，3级中，填充已有的数据，并筛选出新增的数据
 * @param {*} TextAreaData : fillExistData() 处理的数据
 * @param {*} newFlattenData : 扁平化数据
 * @param {Number} handleLevel : 要处理的级数
 */
export const handleExistData = (TextAreaData: parserRootObj, newFlattenData: FlattenDataObj[], handleLevel: number): existAndAddDataObj => {
  const { namesArrObj } = TextAreaData;

  const existNamesArrObj = {};
  const addNamesArrObj = {};

  for (let i = 1; i <= handleLevel; i++) {
    addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`] = [];
    existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`] = [];
  }

  // flatten 加上 parser 的 映射 id
  for (let i = 1; i <= handleLevel; i++) {
    const curNamesArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i}`];

    forEach(curNamesArr, (item) => {
      const { value, parent_id, id } = item;

      forEach(newFlattenData, (val) => {
        if (i === 1) {
          if (val.level === i && val.value === value) {
            val.root_id = id;
          }
        }
        if (i > 1) {
          if (val.level === i && val.value === value) {
            const rootId = getRootIdByParentId(newFlattenData, val.parent_id);
            if (isSameFlagForFlatten(newFlattenData, rootId, i - 1, parent_id, namesArrObj)) {
              val.root_id = id;
            }
          }
        }
      });
    });
  }

  for (let i = 1; i <= handleLevel; i++) {
    const curNamesArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i}`];

    forEach(curNamesArr, (item) => {
      let flag = false;

      const { value, parent_id, id } = item;

      // 新增数据 obj
      const addNewObj: addNewObj = {
        level: i,
        value,
        id,
        new: true,
        root_id: id,
      };

      forEach(newFlattenData, (val) => {
        if (value === val.value) {
          if (val.level === i) {
            // level 等于 1
            if (val.level === 1 && val.parent_id === 0) {
              const obj = { ...val };
              existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`].push(obj);
              flag = true;
            }
            // level 大于 1
            if (val.level !== 1 || val.parent_id !== 0) {
              if (isExistitem(namesArrObj, newFlattenData, val, parent_id, i)) {
                const obj = { ...val };
                existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`].push(obj);
                flag = true;
              }
            }
          }
        }
      });

      if (!flag) {
        addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`].push(addNewObj);
        newFlattenData.push(addNewObj);
      }
    });
  }

  // const aaa = cloneDeep(addNamesArrObj);
  // console.log('---aaa----', aaa);

  return {
    addNamesArrObj,
    existNamesArrObj,
  };
};

/**
 **************** 处理新增数据 *****************
 */

/**
 * 新增 数据 加上相应的属性
 * 用于 transDataFromText()
 * @param {Array} levelArr ; 具体某一层级的 textDataParser() 数据
 * @param {Array} textAreaArr : textDataParser() 数据
 * @param {Array} newFlattenData : 最新扁平数据（包括新增的）
 * @param {Number} level : 级数
 * @param {Number} handleLevel : 要处理的级数
 */
const setAddDataParams = (levelArr, TextAreaData, newFlattenData, level, handleLevel) => {
  // 最原始映射
  const { namesArrObj } = TextAreaData;

  forEach(levelArr, (item) => {
    const valueId = item.id;

    for (let i = 1; i <= handleLevel; i++) {
      if (level === i) {
        if (i === 1) {
          item.parent_id = 0;
        } else {
          const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];
          // 获取 上一级的名字
          const prevLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level - 1}`];

          forEach(curLeveArr, (val) => {
            if (valueId === val.id) {
              const _pid = val.parent_id;
              const parentValue = getValueById(prevLeveArr, _pid);
              const parentId = getIdByValueName(newFlattenData, parentValue, _pid, i - 1);

              item.parent_id = parentId;
            }
          });
        }
      }
    }

    item.new = true;
  });

  return levelArr;
};

/**
 * 为新增数据添加相应的属性，为之后转化为树状结构数据作准备
 * @param {*} handleDataArr : fillExistData() 处理的数据
 * @param {*} textArr : textarea 的文本 转化的数组
 * @param {*} newFlattenData : 扁平化数据
 * @param {Number} handleLevel : 要处理的级数
 */
export const handleParamsInAddData = (handleDataArr, TextAreaData, newFlattenData, handleLevel): newAddNamesArrObj => {
  // 新增的映射
  const { addNamesArrObj } = handleDataArr;
  const newAddNamesArrObj = {};

  for (let i = 1; i <= handleLevel; i++) {
    newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`] = [];
  }

  for (let i = 1; i <= handleLevel; i++) {
    const curAddName = addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`];
    newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`] = setAddDataParams(curAddName, TextAreaData, newFlattenData, i, handleLevel);
  }

  return {
    newAddNamesArrObj,
  };
};

/**
 **************** 处理删除数据 *****************
 */

/**
 * 为删除数据打上标签，并返回删除数据
 * @param {*} existData : 已存在数据
 * @param {*} newFlattenData : 扁平化数据
 */
const addTagForDeleleData = (existData, newFlattenData) => {
  const deleteData = [];

  forEach(newFlattenData, (item) => {
    forEach(existData, (val) => {
      if (!item.new) {
        if (item.id === val.id && item.level === val.level && item.value === val.value) {
          item.exist = true;
        }
      }
    });
  });

  forEach(newFlattenData, (item) => {
    if (!item.exist && !item.new) {
      const obj = { ...item, status: 2 };
      deleteData.push(obj);
    }
  });

  return deleteData;
};

/**
 * 根据标题 几级 来获取删除的数据，并给删除数据打上标签，并返回删除数据
 * @param {*} handleDataArr : fillExistData() 处理的数据
 * @param {*} newFlattenData : 扁平化数据
 * @param {Number} handleLevel : 要处理的级数
 */
export const handleTagForDeleleByLevel = (handleDataArr, newFlattenData, handleLevel) => {
  const { existNamesArrObj } = handleDataArr;

  let existData = [];

  for (let i = 1; i <= handleLevel; i++) {
    const curArray = existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`];
    existData = concat(existData, curArray);
  }

  const deleteData = addTagForDeleleData(existData, newFlattenData);

  return deleteData;
};