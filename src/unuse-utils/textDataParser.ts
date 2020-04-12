/**
 * 处理用户修改后 基本映射数据
 */

import { forEach, uniq } from 'lodash';

import { ROOT_ARR_PREFIX } from '../utils/CONST'

import { _id } from '../utils/utils'

import { parserItemObj, parserRootObj, namesArrObj } from '../types'

/**
 * 递归判断 是否时相同的爸爸
 * 用于 sameParentNew()
 * @param {Array} namesArrObj : textDataParser() 转化的数据
 * @param {Array} itemArr : textarea 每一行的字符串转化的数组
 * @param {Number} level : 级数
 * @param {Number} pid : 当前循环 item 的 爸爸的 id
 */
const isSameFlag = (namesArrObj: namesArrObj, itemArr: string[], level: number, pid: number): boolean => {
  let flag = false;

  const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];
  const curLevelText = itemArr[level - 1];

  let curParentId = 0;
  // 超过 1 级，下一次 还需要用到的 pid
  let nextParentId = 0;

  forEach(curLeveArr, (item) => {
    if (item.value === curLevelText) {
      curParentId = item.id;
    }

    if (item.id === pid) {
      nextParentId = item.parent_id;
    }
  });

  if (curParentId === pid) {
    if (level === 1) {
      flag = true;
    } else {
      flag = isSameFlag(namesArrObj, itemArr, level - 1, nextParentId);
    }
  }

  return flag;
};

/**
 * 判读 当前级数中 是否存在 当前值
 * 如果值相同，并不是第一级，则需要递归去判断他们的爸爸是否相同，直到第一级
 * 返回 bool
 * @param {Array} namesArrObj : textDataParser() 转化的数据
 * @param {Array} itemArr : textarea 每一行的字符串转化的数组
 * @param {Number} level : 级数
 */
const sameParentNew = (namesArrObj: namesArrObj, itemArr: string[], level: number): boolean => {
  let flag = false;

  // 当前级数 Arr
  const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];

  // 当前级数的 Text
  const curLevelText = itemArr[level - 1];

  forEach(curLeveArr, (item) => {
    if (item.value === curLevelText) {
      if (level === 1) {
        flag = true;
      } else {
        const pid = item.parent_id;
        flag = isSameFlag(namesArrObj, itemArr, level - 1, pid);
      }
    }
  });

  return flag;
};

/**
 * 获取当前 level 字段值 的爸爸 的 id
 * @param {Array} namesArrObj : textDataParser() 转化的数据
 * @param {Array} itemArr : textarea 每一行的字符串转化的数组
 * @param {Number} level : 当前级数
 */
const getParentIdNew = (namesArrObj: namesArrObj, itemArr: string[], level: number): number => {
  let id = 0;

  // 前一级的 parser 数据
  const tagetArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level - 1}`];
  // 前一级的名字，下标从 0 开始
  const targetItemArrText = itemArr[level - 2];

  forEach(tagetArr, (item) => {
    if (item.value === targetItemArrText) {
      id = item.id;
    }
  });

  return id;
};

/**
 * 将 textarea 数据 转化为 相应级数 的 数据
 * @param {Array} textArr : textarea 的文本 转化的数组
 * @param {Number} handleLevel : 要处理的级数
 */
export const parserRootData = (textArr: string[], handleLevel: number): parserRootObj => {
  const uniqueTextArr = uniq(textArr);

  const namesArrObj: namesArrObj = {};

  for (let i = 1; i <= handleLevel; i++) {
    namesArrObj[`${ROOT_ARR_PREFIX}_${i}`] = [];
  }

  forEach(uniqueTextArr, (item: string) => {
    const itemArr = item.split('/');

    for (let i = 1; i <= handleLevel; i++) {
      if (!sameParentNew(namesArrObj, itemArr, i) && itemArr[i - 1]) {
        const obj: parserItemObj = {};
        obj.id = _id();
        obj.value = itemArr[i - 1];
        obj.level = i;

        const parentId = getParentIdNew(namesArrObj, itemArr, i);
        obj.parent_id = parentId;

        namesArrObj[`${ROOT_ARR_PREFIX}_${i}`].push(obj);
      }
    }
  });

  return {
    namesArrObj,
  };
};