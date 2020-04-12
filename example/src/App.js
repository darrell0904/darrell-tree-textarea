import React, { Component } from 'react'

// 测试数据
import { title, tree_value, DEFAULT_TEXT } from './testData'

import TreeTextArea from 'darrell-tree-textarea'

console.log('---title---', title);
console.log('---tree_value---', tree_value);
console.log('---DEFAULT_TEX11111T---', DEFAULT_TEXT);
console.log('---TreeTextArea---', TreeTextArea);


const App = () => {
  return (
    <div className='App'>
      <TreeTextArea
        treeTitle={title}
        treeData={tree_value}
        row={21}
        showNumber
        shouleGetTreeData
        delimiter='/'
        maxLevel={4}
        onChangeTreeData={
          (treeTitle, treeData) => {
            console.log('---treeTitle---', treeTitle);
            console.log('---treeData---', treeData);
          }
        }
        defaultData={DEFAULT_TEXT}
        placeholder='请输入标题，例：省份/城市/区县/学校&#10;浙江省/宁波市/江北区/学校1&#10;浙江省/宁波市/海曙区/学校1'
      />
    </div>
  )
}

export default App;
