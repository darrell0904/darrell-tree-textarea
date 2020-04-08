import {
  forEach,
  isArray,
  cloneDeep,
  toString,
  uniq,
  compact,
  concat,
} from 'lodash';

import { ROOT_ARR_PREFIX, EXIST_ARR_PREFIX, ADD_ARR_PREFIX, HANDLE_ADD_ARR_PREFIX, MAX_LEVEL, ERROR_INFO } from './CONST'

import { _id } from './utils'


import { FlattenDataObj, errorInfo, parserItemObj, parserRootObj } from '../types'

import { parserRootData } from './textDataParser'
import { handleExistData, handleParamsInAddData, handleTagForDeleleByLevel } from './handleTextDate'


/**
 * 校验 输入内容是否符合要求
 * @param {String} texts : textarea 的文本
 */
export const isEquelLevel = (texts: string): errorInfo => {
  const firstArray = texts.split('\n');
  const titleTextArr = firstArray[0];

  if (firstArray.length >= 1) {
    firstArray.shift();
  }

  const textArr = compact(firstArray);

  // 去重
  const uniqueContentArr = uniq(textArr);

  const arrTitleArr = titleTextArr ? titleTextArr.split('/') : [];
  const arrTitleArrLen = compact(arrTitleArr).length;

  // 查看 ERROR_INFO
  let errorCode = 0;

  // 标题 和 内容的级数 是否相同
  let contentLenflag = false;

  // 内容超过最大级数
  let contentOutlen = false;

  // 没有查过最大级数，并且 内容级数 大于 标题级数
  let contentGtTitle = false;

  // 没有查过最大级数，并且 内容级数 大于 标题级数
  let contentEmpty = false;

  forEach(uniqueContentArr, (item) => {
    const itemArr = item.split('/') || [];

    // 去掉数组中 非假值元素
    const newItemArr = compact(itemArr);

    if (newItemArr.length === arrTitleArrLen) {
      contentLenflag = true;
    }

    if (newItemArr.length > MAX_LEVEL) {
      contentOutlen = true;
    }

    if (newItemArr.length > arrTitleArrLen) {
      contentGtTitle = true;
    }
  });

  if (uniqueContentArr.length === 0) {
    contentEmpty = true;
  }

  if (!contentLenflag || contentGtTitle) {
    errorCode = 3;
  }

  if (contentOutlen) {
    errorCode = 4;
  }

  if (contentEmpty) {
    errorCode = 5;
  }

  if (arrTitleArrLen === 0) {
    errorCode = 1;
  } else if (arrTitleArrLen > MAX_LEVEL) {
    errorCode = 2;
  }

  return {
    errorCode,
    ERROR_INFO,
  };
};

/**
 * 获取 多级下拉 的标题，textarea 的第一行
 * @param {String} texts : textarea 的文本
 */
export const getLevelTitles = (texts) => {
  const arr = texts.split('\n');
  if (arr.length > 0) {
    return arr[0];
  }
  return '';
};


/**
 * 删除 之前 组装 树状结构时 使用的 一些自定义属性
 * 后端不需要
 * @param {Object} item : 每一项的 item
 */
const clearParamsInTreeData = (item) => {
  delete item.title;
  delete item.hasChildren;
  delete item.root_id;

  if (item.new) {
    delete item.new;
    delete item.id;
    delete item.parent_id;
  }
};

/**
 * 递归 将扁平数据转化为 树状 结构数据
 * 用于 transDataFromText
 * @param {Array} lists : 扁平数据
 * @param {Number} parent_id : 爸爸的 id
 */
const getTreeDataBylists = (lists, parent_id) => {
  //递归，菜单
  const tree = [];

  forEach(lists, (item) => {
    const newParentId = toString(item.parent_id);
    const newItemId = newParentId.indexOf('id_') > -1 ? item.parent_id : parseInt(item.parent_id, 10);

    if (parent_id === newItemId) {
      const childrenTree = getTreeDataBylists(lists, item.id);
      if (isArray(childrenTree) && childrenTree.length > 0) {
        item.children = childrenTree;
      } else {
        item.children = null;
      }
      // 删除不必要属性
      // clearParamsInTreeData(item);

      tree.push(item);
    }
  });

  return tree;
};

/**
 * 生成最新的数据
 * @param {*} handleDataArr : fillExistData() 处理的数据
 * @param {*} newAddNamesArrObj : setParamsInAddData() 得到的新增数据
 * @param {*} deleteData : addTagForDeleleByLevel() 得到的删除数据
 * @param {Number} handleLevel : 要处理的级数
 */
const getLastData = (handleDataArr, newAddNamesArrObj, deleteData, handleLevel) => {
  const { existNamesArrObj } = handleDataArr;

  let lastData = [];

  let AddLast = [];
  let ExistLast = [];

  for (let i = 1; i <= handleLevel; i++) {
    const curArrayExist = existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`];
    const curArrayAdd = newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`];

    ExistLast = concat(ExistLast, curArrayExist);
    AddLast = concat(AddLast, curArrayAdd);
  }

  lastData = concat(lastData, ExistLast, AddLast, deleteData);

  return lastData;
};

/**
 * 将 textarea 数据 转化为 后端所需的树状结构数据
 * @param {Array} flattenData : 扁平数据
 * @param {String} texts : textarea 的文本
 */
export const transDataFromText = (flattenData: FlattenDataObj[], texts: string) => {
  const arr = texts.split('\n');

  const newFlattenData = cloneDeep(flattenData);

  if (arr.length > 1) {
    arr.shift();
  }

  // 解析 TextArea 数据 为 指定 层级映射数据
  const TextAreaData = parserRootData(arr, MAX_LEVEL);

  console.log('---TextAreaData---', TextAreaData);

  // 填充已有数据
  // 并 筛选出 新增数据
  const handleDataArr = handleExistData(TextAreaData, newFlattenData, MAX_LEVEL);

  console.log('---handleDataArr---', handleDataArr);

  // 为 新增数据 newAddNamesArrObj 加上 相应
  // 为之后转化为 tree 数据作准备
  const {
    newAddNamesArrObj,
  } = handleParamsInAddData(handleDataArr, TextAreaData, newFlattenData, MAX_LEVEL);

  // 根据标题 获取 删除的数据
  // 并给删除数据打上 status: 2
  const deleteData = handleTagForDeleleByLevel(
    handleDataArr,
    newFlattenData,
    MAX_LEVEL,
  );

  // 拼装最终数据
  // 已有、新增、删除数据
  const newDataLists = getLastData(handleDataArr, newAddNamesArrObj, deleteData, MAX_LEVEL);

  // console.log('--newDataLists--', newDataLists);

  // // 得到 树状数据
  const _data = getTreeDataBylists(newDataLists, 0);

  return _data;
};
