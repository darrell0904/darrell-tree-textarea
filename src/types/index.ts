// flattenData 接口
export interface FlattenDataObj {
  title?: string;
  value?: string;
  hasChildren?: boolean;

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
  parent_id?: number;

  [propName: string]: any;
}

export interface parserRootObj {
  namesArrObj: any;
}