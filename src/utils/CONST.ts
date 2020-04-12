// 分隔符
export const Delimiter = '/';

// textArea 元数据 数组
export const ROOT_ARR_PREFIX = 'ROOT_ARR_PREFIX';

// 后端存在的数据数组，并填充完了 后端数据
export const EXIST_ARR_PREFIX = 'EXIST_ARR_PREFIX';

// 新增数据数组
export const ADD_ARR_PREFIX = 'ADD_ARR_PREFIX';

// 新增和存在数据数组
export const EXIST_ADD_ARR_PREFIX = 'EXIST_ADD_ARR_PREFIX';

// 填充了属性的 新增数据数组
export const HANDLE_ADD_ARR_PREFIX = 'HANDLE_ADD_ARR_PREFIX';

/**
 * 最大处理个数
 */
export const MAX_LEVEL = 4;

/**
 * 校验信息
 */
export const ERROR_INFO = {
  1: '第一行标题不可为空',
  2: `第一行标题不可超过 ${MAX_LEVEL} 列`,
  3: '标题和选择项的层级数请保持一致',
  4: `选择项不可超过 ${MAX_LEVEL} 行`,
  5: '请至少填写一行选择项',
};

export const DEFAULT_TEXT = '请选择省份/城市/区县/学校\n浙江省/宁波市/海曙区/学校1\n浙江省/宁波市/海曙区/学校2\n浙江省/宁波市/江北区/学校1\n浙江省/宁波市/江北区/学校2\n浙江省/宁波市/鄞州区/学校1\n浙江省/杭州市/上城区/学校1\n浙江省/杭州市/上城区/学校2\n浙江省/杭州市/下城区/学校1\n浙江省/杭州市/西湖区/学校1\n浙江省/杭州市/下沙区/学校1\n江苏省/南京市/鼓楼区/学校1\n江苏省/南京市/浦口区/学校1\n江苏省/无锡市/惠山区/学校1';
