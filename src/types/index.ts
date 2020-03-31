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