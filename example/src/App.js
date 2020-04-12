import React, { useState } from 'react'

// 测试数据
import { title, tree_value, DEFAULT_TEXT } from './testData'

import TreeTextArea from '@darrell/darrell-tree-textarea'
// import PhotoGallery from 'darrell-photo-gallery';
// import 'darrell-photo-gallery/lib/main.min.css';

console.log('--TreeTextArea---', TreeTextArea);

window.aaa = TreeTextArea;


const App = () => {
  const [visible, setVisible] = useState(false);

  const ChangeVisible = () => {
    setVisible(true);
  }

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
      {visible}
    </div>
  )
}

export default App;
