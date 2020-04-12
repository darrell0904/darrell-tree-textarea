import React from 'react'
import ReactDOM from 'react-dom'
import TreeTextArea from './components/textarea'
import styles from './index.less'

// 测试数据
import { title, tree_value } from './utils/testData'
import { DEFAULT_TEXT } from './utils/CONST'

export default TreeTextArea;
console.log('--TreeTextArea--', TreeTextArea);

const App = () => {
	return (
		<div className={styles.root}>
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

console.log('--App--', App);

ReactDOM.render(
	<App />,
	document.getElementById('root')
)
