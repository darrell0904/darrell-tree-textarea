import { ROOT_ARR_PREFIX } from '../utils/CONST'

// flattenData 接口
export interface FlattenDataObj {
  id?: number | string;
  title?: string;
  value?: string;
  level?: number;
  parent_id?: number | string;
  new?: boolean;
  root_id?: string;
  hasChildren?: boolean;
  status?: number;
  children?: FlattenDataObj[];

  [propName: string]: any;
}

// 错误返回接口
export interface errorInfo {
  errorCode: number;
  ERROR_INFO: any;
}

// textDataParser
export interface parserItemObj {
  id?: number | string;
  value?: string;
  level?: number;
  parent_id?: number | string;

  [propName: string]: any;
}

export interface parserRootObj {
  namesArrObj: any;
}

export interface existAndAddDataObj {
  addNamesArrObj: any;
  existNamesArrObj: any;
}

export interface newAddNamesArrObj {
  newAddNamesArrObj: any;
}

// 这个之后在定义
export interface namesArrObj {
  [propName: string]: any;
}

export interface addNewObj {
  level?: number;
  value?: string;
  id?: number | string;
  new?: boolean;
  root_id?: string;
  parent_id?: number | string;

  [propName: string]: any;
}