/**
 * 处理渲染数据
 */

import { forEach, filter, concat, cloneDeep } from 'lodash';

import { MAX_LEVEL } from './CONST'

import { FlattenDataObj } from '../types'

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

  console.log(cloneDeep(arr))

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
