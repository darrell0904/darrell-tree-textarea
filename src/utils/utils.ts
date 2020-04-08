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