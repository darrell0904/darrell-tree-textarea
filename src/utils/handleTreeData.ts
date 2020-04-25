/**
 * 处理 textarea 数据类
 */

import { forEach, isArray, cloneDeep, uniq, compact, concat } from 'lodash';

import { ROOT_ARR_PREFIX, ADD_ARR_PREFIX, EXIST_ARR_PREFIX, HANDLE_ADD_ARR_PREFIX, EXIST_ADD_ARR_PREFIX, MAX_LEVEL, ERROR_INFO, Delimiter } from './CONST'

import { _id, getWantIdByFromId, getItemById, getValueById, getIdByValueNameAndId } from './utils'

import { FlattenDataObj, addNewObj, errorInfo, parserItemObj, namesArrObj } from '../types'

interface treeTextAreaData {
  flattenData: FlattenDataObj[];
  textAreaTexts: string;
  delimiter?: string;
  maxLevel?: number;
}

class treeTextAreaDataHandle {
  // 扁平化数组
  private flattenData: FlattenDataObj[];
  // textarea 框 文本值
  private textAreaTexts: string;

  // textarea 框 标题
  private textAreaTitle: string;

  // 最大 支持计数
  private MAX_LEVEL: number = MAX_LEVEL;

  // 每一级的 textArea
  private textAreaArr: string[];

  // 将 textarea 数据 转化为 相应级数 的 数据
  private rootArrObj: namesArrObj;

  // 存在数据
  private existNamesArrObj: namesArrObj;

  // 新增数据
  private addNamesArrObj: namesArrObj;

  // 处理后的新增数据
  private newAddNamesArrObj: namesArrObj;

  // 存在数据和新增数据
  private existAndAddArrObj: namesArrObj;

  // 填充数据
  private deleteData: FlattenDataObj[];

  // 最终组装的扁平数据
  private newDataLists: FlattenDataObj[];

  // 最终生成的树状数据
  private lastTreeData: any;

  // 分隔符
  private delimiter: string = Delimiter;


  constructor(options: treeTextAreaData) {
    const { flattenData, textAreaTexts, delimiter, maxLevel } = options;

    this.flattenData = cloneDeep(flattenData);
    this.textAreaTexts = textAreaTexts;

    if (delimiter) {
      this.delimiter = delimiter;
    }

    if (maxLevel) {
      this.MAX_LEVEL = maxLevel;
    }
  }

  /**
   * 校验 输入内容是否符合要求
   * @param {String} texts : textarea 的文本
   */
  public getLevelTitles() {
    const textAreaTexts = this.textAreaTexts;

    const arr = textAreaTexts.split('\n');

    let title = '';

    if (arr.length > 0) {
      title = arr[0];
    }

    this.textAreaTitle = title;

    return title;
  }

  /**
   * 获取 多级下拉 的标题，textarea 的第一行
   * @param {String} texts : textarea 的文本
   */
  public isEquelLevel(): errorInfo {
    const texts = this.textAreaTexts;
    const delimiter = this.delimiter;

    const firstArray = texts.split('\n');
    const titleTextArr = firstArray[0];

    if (firstArray.length >= 1) {
      firstArray.shift();
    }

    const textArr = compact(firstArray);

    // 去重
    const uniqueContentArr = uniq(textArr);

    const arrTitleArr = titleTextArr ? titleTextArr.split(delimiter) : [];
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
      const itemArr = item.split(delimiter) || [];

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
  }

  /**
   * 将 textarea 数据 转化为 后端所需的树状结构数据
   * @param {Array} flattenData : 扁平数据
   * @param {String} texts : textarea 的文本
   */
  public transDataFromText() {
    const texts = this.textAreaTexts;

    const arr = texts.split('\n');

    if (arr.length > 1) {
      arr.shift();
    }

    this.textAreaArr = arr;

    // 解析 TextArea 数据 为 指定 层级映射数据
    this.parserRootData();

    // 填充已有数据 并 筛选新增数据
    this.handleExistData();

    // 处理新增数据
    this.handleParamsInAddData();

    // 获取删除数据
    this.handleTagForDeleleByLevel();

    // 获取最新扁平数据
    this.getLastFlattenData();

    // 获取最新树状数据
    this.lastTreeData = this.getTreeDataBylists(0);

    return this.lastTreeData;
  }

  // ----------------------------------
  // ------ textDataParser START ------
  // ----------------------------------

  static isSameFlag(namesArrObj: namesArrObj, itemArr: string[], level: number, pid: number): boolean {
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
        flag = this.isSameFlag(namesArrObj, itemArr, level - 1, nextParentId);
      }
    }
  
    return flag;
  };

  static sameParentNew(namesArrObj: namesArrObj, itemArr: string[], level: number): boolean {
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
          flag = this.isSameFlag(namesArrObj, itemArr, level - 1, pid);
        }
      }
    });

    return flag;
  }

  static getParentIdNew(namesArrObj: namesArrObj, itemArr: string[], level: number): number | string {
    let id: number | string = 0;

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
  }

  private parserRootData() {
    const textArr  = this.textAreaArr;
    const handleLevel = this.MAX_LEVEL;
    const delimiter = this.delimiter;

    const uniqueTextArr = uniq(textArr);

    const namesArrObj: namesArrObj = {};

    for (let i = 1; i <= handleLevel; i++) {
      namesArrObj[`${ROOT_ARR_PREFIX}_${i}`] = [];
    }

    forEach(uniqueTextArr, (item: string) => {
      const itemArr = item.split(delimiter);

      for (let i = 1; i <= handleLevel; i++) {
        if (!treeTextAreaDataHandle.sameParentNew(namesArrObj, itemArr, i) && itemArr[i - 1]) {
          const obj: parserItemObj = {};
          obj.id = _id();
          obj.value = itemArr[i - 1];
          obj.level = i;

          const parentId = treeTextAreaDataHandle.getParentIdNew(namesArrObj, itemArr, i);
          obj.parent_id = parentId;

          namesArrObj[`${ROOT_ARR_PREFIX}_${i}`].push(obj);

          // this.rootArrObj = namesArrObj;
        }
      }
    });

    this.rootArrObj = namesArrObj;
  }

  // ----------------------------------
  // ------ textDataParser END --------
  // ----------------------------------

  // -------------------------------------------
  // ------ 填充已有数据 并筛选新增数据 START ------
  // -------------------------------------------

  /**
   * 通过 value 名 获取对应 item 的 id
   * 必须要名字和 id 都相同
   * @param {Array} flattenData : 扁平化数据
   * @param {String} name : value 名字
   * @param {number} parentId : 当前级数的 id
   */
  // static getIdByValueName(flattenData: FlattenDataObj[], name: string, parentId: number | string, level: number): number | string {
  //   if (!flattenData) return;
  
  //   let id: number | string = 0;
  
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
  // static getValueById(flattenData: FlattenDataObj[], id: number | string): string {
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
  // static getParentIdById = (flattenData: FlattenDataObj[], id: number | string): number | string => {
  //   if (!flattenData) return;

  //   let parentId: number | string = 0;

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
  // static getItemById = (flattenData: FlattenDataObj[], id: number | string): FlattenDataObj => {
  //   if (!flattenData) return;

  //   let curItem = {};

  //   forEach(flattenData, (item) => {
  //     if (item.id === id) {
  //       curItem = item;
  //     }
  //   });

  //   return curItem;
  // };

  /**
   * 是否是新增的数据
   * @param {Array} namesArrObj : textDataParser() 转化的数据
   * @param {Array} newFlattenData : 扁平化数据
   * @param {Object} val : 存在数据 当前循环的 item
   * @param {Number} parent_id : textDataParser() 参数循环 pid
   * @param {Number} level : 级数
   */
  private isExistitem = (val: FlattenDataObj, parent_id: number | string, level: number): boolean => {
    const namesArrObj = this.rootArrObj;
    const newFlattenData = this.flattenData;

    let flag = false;

    const valParentId = val.parent_id;

    // 用于比较前一级的name 是否相同
    const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level - 1}`];

    if (getValueById(curLeveArr, parent_id) === getValueById(newFlattenData, valParentId)) {
      if (level === 2) {
        flag = true;
      } else {
        // 获取前前一级的
        // const curPrevParentId = getParentIdById(curLeveArr, parent_id);
        const curPrevParentId = getWantIdByFromId(curLeveArr, parent_id, 'parent_id', 'id');
        const curValItem = getItemById(newFlattenData, valParentId);

        flag = this.isExistitem(curValItem, curPrevParentId, level - 1);
      }
    }

    return flag;
  };

  /**
   * 表示 是否 textDataParser 数据对应
   * @param flattenData 
   * @param rootId 
   * @param level 
   * @param pid 
   * @param namesArrObj 
   */
  private isSameFlagForFlatten = (rootId: number | string, level: number, pid: number | string, namesArrObj: namesArrObj): boolean => {
    const flattenData = this.flattenData;
    let flag = false;

    const curLeveArr = namesArrObj[`${ROOT_ARR_PREFIX}_${level}`];

    if (rootId === pid) {
      if (level > 1) {
        // const RootPid = getParentIdByRootId(flattenData, rootId);
        // const newRootId = getRootIdByParentId(flattenData, RootPid);

        const RootPid = getWantIdByFromId(flattenData, rootId, 'parent_id', 'root_id');
        const newRootId = getWantIdByFromId(flattenData, RootPid, 'root_id', 'id');


        // const newPid = getParentIdById(curLeveArr, pid);

        const newPid = getWantIdByFromId(curLeveArr, pid, 'parent_id', 'id');

        flag = this.isSameFlagForFlatten(newRootId, level - 1, newPid, namesArrObj);
      } else {
        flag = true;
      }
    }

    return flag;
  };

  // 为 flatten 加上 parser 的 映射 id
  static getRootIdByParentId = (flattenData: FlattenDataObj[], id: number | string): string => {
    if (!flattenData) return;
  
    let rootId: string = '0';
  
    forEach(flattenData, (item) => {
      if (item.id === id) {
        rootId = item.root_id;
      }
    });
  
    return rootId;
  };
  
  static getParentIdByRootId = (flattenData: FlattenDataObj[], id: number | string): number | string => {
    if (!flattenData) return;
  
    let parentId: number | string = 0;
  
    forEach(flattenData, (item) => {
      if (item.root_id === id) {
        parentId = item.parent_id;
      }
    });
  
    return parentId;
  };

  private setMapIdForFlattenDataToRootData() {
    const namesArrObj = this.rootArrObj;
    const handleLevel = this.MAX_LEVEL;
    const newFlattenData = this.flattenData;

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
              // const rootId = getRootIdByParentId(newFlattenData, val.parent_id);
              const rootId = getWantIdByFromId(newFlattenData, val.parent_id, 'root_id', 'id');
              if (this.isSameFlagForFlatten(rootId, i - 1, parent_id, namesArrObj)) {
                val.root_id = id;
              }
            }
          }
        });
      });
    }
  }

  /**
   * 将 1，2，3级中，填充已有的数据，并筛选出新增的数据
   * @param {*} TextAreaData : fillExistData() 处理的数据
   * @param {*} newFlattenData : 扁平化数据
   * @param {Number} handleLevel : 要处理的级数
   */
  private handleExistData() {
    const namesArrObj = this.rootArrObj;
    const newFlattenData = this.flattenData;
    const handleLevel = this.MAX_LEVEL;
    // const { namesArrObj } = TextAreaData;

    const existNamesArrObj = {};
    const addNamesArrObj = {};
    const existAndAddArrObj = {};

    for (let i = 1; i <= handleLevel; i++) {
      addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`] = [];
      existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`] = [];
      existAndAddArrObj[`${EXIST_ADD_ARR_PREFIX}_${i}`] = [];
    }

    // flatten 加上 parser 的 映射 id
    this.setMapIdForFlattenDataToRootData();
    // for (let i = 1; i <= handleLevel; i++) {
    //   const curNamesArr = namesArrObj[`${ROOT_ARR_PREFIX}_${i}`];

    //   forEach(curNamesArr, (item) => {
    //     const { value, parent_id, id } = item;

    //     forEach(newFlattenData, (val) => {
    //       if (i === 1) {
    //         if (val.level === i && val.value === value) {
    //           val.root_id = id;
    //         }
    //       }
    //       if (i > 1) {
    //         if (val.level === i && val.value === value) {
    //           const rootId = getRootIdByParentId(newFlattenData, val.parent_id);
    //           if (isSameFlagForFlatten(newFlattenData, rootId, i - 1, parent_id, namesArrObj)) {
    //             val.root_id = id;
    //           }
    //         }
    //       }
    //     });
    //   });
    // }

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
                existAndAddArrObj[`${EXIST_ADD_ARR_PREFIX}_${i}`].push(obj);
                flag = true;
              }
              // level 大于 1
              if (val.level !== 1 || val.parent_id !== 0) {
                if (this.isExistitem(val, parent_id, i)) {
                  const obj = { ...val };
                  existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`].push(obj);
                  existAndAddArrObj[`${EXIST_ADD_ARR_PREFIX}_${i}`].push(obj);
                  flag = true;
                }
              }
            }
          }
        });

        if (!flag) {
          addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`].push(addNewObj);
          existAndAddArrObj[`${EXIST_ADD_ARR_PREFIX}_${i}`].push(addNewObj);
          newFlattenData.push(addNewObj);
        }
      });
    }

    // const aaa = cloneDeep(addNamesArrObj);
    // console.log('---aaa----', aaa);

    this.existNamesArrObj = existNamesArrObj;
    this.addNamesArrObj = addNamesArrObj;
    this.existAndAddArrObj = existAndAddArrObj;
  };


  // -----------------------------------------
  // ------ 填充已有数据 并筛选新增数据 END ------
  // -----------------------------------------



  // ------------------------------
  // ------ 处理新增数据 START ------
  // ------------------------------

  /**
   * 新增 数据 加上相应的属性
   * 用于 transDataFromText()
   * @param {Array} levelArr ; 具体某一层级的 textDataParser() 数据
   * @param {Array} textAreaArr : textDataParser() 数据
   * @param {Array} newFlattenData : 最新扁平数据（包括新增的）
   * @param {Number} level : 级数
   * @param {Number} handleLevel : 要处理的级数
   */
  private setAddDataParams = (levelArr: FlattenDataObj[], level: number): FlattenDataObj[] => {
    // 最原始映射
    // const { namesArrObj } = TextAreaData;

    const namesArrObj = this.rootArrObj;
    const newFlattenData = this.flattenData;
    const handleLevel = this.MAX_LEVEL;

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
                const parentId = getIdByValueNameAndId(newFlattenData, parentValue, _pid, i - 1);

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
  private handleParamsInAddData = () => {
    // 新增的映射
    // const { addNamesArrObj } = handleDataArr;

    const addNamesArrObj = this.addNamesArrObj;
    const handleLevel = this.MAX_LEVEL;

    const newAddNamesArrObj = {};

    for (let i = 1; i <= handleLevel; i++) {
      newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`] = [];
    }

    for (let i = 1; i <= handleLevel; i++) {
      const curAddName = addNamesArrObj[`${ADD_ARR_PREFIX}_${i}`];
      newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`] = this.setAddDataParams(curAddName, i);
      // addNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`] = this.setAddDataParams(curAddName, i);
    }

    this.newAddNamesArrObj = newAddNamesArrObj;

    // console.log('---addNamesArrObj---', addNamesArrObj);
  };

  // ------------------------------
  // ------ 处理新增数据 END ------
  // ------------------------------



  // ------------------------------
  // ------ 处理删除数据 START ------
  // ------------------------------

  /**
   * 为删除数据打上标签，并返回删除数据
   * @param {*} existData : 已存在数据
   * @param {*} newFlattenData : 扁平化数据
   */
  private addTagForDeleleData = (existData: FlattenDataObj[]): FlattenDataObj[] => {
    const newFlattenData = this.flattenData;
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
  private handleTagForDeleleByLevel = () => {
    const existNamesArrObj = this.existNamesArrObj;
    const handleLevel = this.MAX_LEVEL;

    let existData = [];

    for (let i = 1; i <= handleLevel; i++) {
      const curArray = existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`];
      existData = concat(existData, curArray);
    }

    const deleteData = this.addTagForDeleleData(existData);

    this.deleteData = deleteData;
  };

  // ------------------------------
  // ------ 处理删除数据 END ------
  // ------------------------------

  // -------------------------------------
  // ------ 开始组装新的扁平数据 START ------
  // -------------------------------------

  /**
   * 生成最新的数据
   * @param {*} handleDataArr : fillExistData() 处理的数据
   * @param {*} newAddNamesArrObj : setParamsInAddData() 得到的新增数据
   * @param {*} deleteData : addTagForDeleleByLevel() 得到的删除数据
   * @param {Number} handleLevel : 要处理的级数
   */
  private getLastFlattenData() {
    const existNamesArrObj = this.existNamesArrObj;
    const newAddNamesArrObj = this.newAddNamesArrObj;
    // const addNamesArrObj = this.addNamesArrObj;
    const existAndAddArrObj = this.existAndAddArrObj;
    const deleteData = this.deleteData;
    const handleLevel = this.MAX_LEVEL;

    let lastData = [];

    let AddLast = [];
    let ExistLast = [];
    let ExistAndLast = [];


    for (let i = 1; i <= handleLevel; i++) {
      const curArrayExist = existNamesArrObj[`${EXIST_ARR_PREFIX}_${i}`];
      const curArrayAdd = newAddNamesArrObj[`${HANDLE_ADD_ARR_PREFIX}_${i}`];
      const curArrayExistAndAdd = existAndAddArrObj[`${EXIST_ADD_ARR_PREFIX}_${i}`];

      ExistLast = concat(ExistLast, curArrayExist);
      AddLast = concat(AddLast, curArrayAdd);
      ExistAndLast = concat(ExistAndLast, curArrayExistAndAdd);
    }

    lastData = concat(lastData, ExistAndLast, deleteData);

    this.newDataLists = lastData;
  };

  // -------------------------------------
  // ------ 开始组装新的扁平数据 END ------
  // -------------------------------------


  // -------------------------------------
  // ------ 开始组装最后的树数据 START ------
  // -------------------------------------

  /**
   * 删除 之前 组装 树状结构时 使用的 一些自定义属性
   * 后端不需要
   * @param {Object} item : 每一项的 item
   */
  static clearParamsInTreeData = (item) => {
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
  private getTreeDataBylists = (parent_id: number | string): any => {

    const lists = this.newDataLists;

    //递归，菜单
    const tree = [];

    forEach(lists, (item) => {
      const newItemId = item.parent_id;

      if (parent_id === newItemId) {
        const childrenTree = this.getTreeDataBylists(item.id);
        if (isArray(childrenTree) && childrenTree.length > 0) {
          item.children = childrenTree;
        } else {
          item.children = null;
        }

        // 删除不必要属性
        // treeTextAreaDataHandle.clearParamsInTreeData(item);

        tree.push(item);
      }
    });

    return tree;
  };

  // -------------------------------------
  // ------ 开始组装最后的树数据 END ------
  // -------------------------------------
}

export default treeTextAreaDataHandle;