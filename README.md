# darrell-tree-textarea
## 介绍

> 最近在业务中遇到了一个关于 **多级下拉** 需求，需要将后端树状数据显示在 `textarea` 上，同时 `textArea` 中也能对数据进行处理，转化为能进行多级选择树状数据。

举个🌰：

就是需要将类似下面后端提供的树状数据，转化为 `textarea` 中的数据：

![](https://user-gold-cdn.xitu.io/2020/4/13/17173bd45dee1a6a?w=782&h=780&f=png&s=27327)

转化为如下数据：

![](https://user-gold-cdn.xitu.io/2020/4/13/17173bbdb3a2b6e1?w=490&h=330&f=png&s=9964)

接着用户便可以在 `textarea` 框中进行编辑，最终我们还需要将 `textarea` 中的数据在转化为相应的树状数据给后端。

&nbsp;

## 预览图

![](https://user-gold-cdn.xitu.io/2020/4/13/17173bb29fc4144f?w=1088&h=1056&f=png&s=36980)

&nbsp;

## 安装

```javascript
// 安装
npm install darrell-tree-textarea -D

// 在项目中使用
import darrellTreeTextarea from 'darrell-tree-textarea';
```

&nbsp;

## 参数介绍

```jsx
<TreeTextArea
  treeTitle={title} // 多级下拉 标题数据
  treeData={tree_value} // 树状数据
  row={21} // textarea 的行数
  showNumber // 是否展示左侧 textarea 数字
  shouleGetTreeData // 是否开启 处理树数据的功能
  delimiter='/'     // 以什么符号切割
  maxLevel={4}      // 支持的最大级数
  onChangeTreeData={  // 与 shouleGetTreeData 进行搭配使用，返回处理后的标题和树状数据
    (treeTitle, treeData) => {
      console.log('---treeTitle---', treeTitle);
      console.log('---treeData---', treeData);
    }
  }
  defaultData={DEFAULT_TEXT} // 树状数据默认值
  placeholder='请输入标题，例：省份/城市/区县/学校&#10;浙江省/宁波市/江北区/学校1'
/>
```

&nbsp;

## 原理介绍

原理介绍大家可以移步笔者的掘金文章：[使用 React Hooks 定制一个多级下拉的 TextArea 组件](https://juejin.im/post/5e94685ce51d4546b659cf23)