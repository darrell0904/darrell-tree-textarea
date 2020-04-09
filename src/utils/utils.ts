import {
  forEach,
} from 'lodash';

import {
  FlattenDataObj,
} from '../types'

/**
 * textArea 光标定位到最后
 */
export const goToEnd = (textAreaNode: any): void => {
  textAreaNode.scrollTop = textAreaNode.scrollHeight;
  const valueLen = textAreaNode.value.length;

  if (textAreaNode.setSelectionRange) {
    textAreaNode.setSelectionRange(valueLen, valueLen);
    textAreaNode.focus();
  } else {
    textAreaNode.focus();
  }
}

/**
 * 返回随机 id
 * 用于新增 树数据时 使用
 */
export const _id = () => {
  return `id_${Math.random().toString(12).substring(2)}`;
};

/**
 * 获取数组中 对应的 id，通过传入的 id
 * @param arr : 数组 
 * @param id : 查询的 id 
 * @param wantId : 想要返回的 id 名 
 * @param fromId : 通过哪一个 id 名查询
 * 
 * example: getParentIdByRootId => 
 *  wantId = parentId
 *  fromId = rootId
 */
export const getWantIdByFromId = (arr: FlattenDataObj[], id: number | string, wantId: number | string, fromId: number | string): number | string => {
  if (!arr) return;
  
  let parentId: number | string = 0;

  forEach(arr, (item) => {
    if (item[fromId] === id) {
      parentId = item[wantId];
    }
  });

  return parentId;
}

/**
 * 通过 id 获取 item
 * @param arr 
 * @param id 
 */
export const getItemById = (arr: FlattenDataObj[], id: number | string): FlattenDataObj => {
  if (!arr) return;

  let curItem = {};

  forEach(arr, (item) => {
    if (item.id === id) {
      curItem = item;
    }
  });

  return curItem;
}

/**
 * 通过 id 获取 value
 * @param arr 
 * @param id 
 */
export const getValueById = (arr: FlattenDataObj[], id: number | string): string => {
  if (!arr) return;

  let value = '';

  forEach(arr, (item) => {
    if (item.id === id) {
      value = item.value;
    }
  });

  return value;
}

/**
 * 通过 value 获得相应的 id，同时需要比较传入的 id 和 root_id 或者 id 是否相同
 * @param arr : 数组
 * @param name : value 值
 * @param id : item 对应的 id
 * @param level : 级数
 */
export const getIdByValueNameAndId = (arr: FlattenDataObj[], name: string, parentId: number | string, level: number): number | string  => {
  if (!arr) return;

  let id: number | string = 0;

  forEach(arr, (item) => {
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
}