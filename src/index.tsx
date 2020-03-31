import React from 'react';
import ReactDOM from 'react-dom'
import TreeTextArea from './components/textarea'
import styles from './index.less'

// 测试数据
import { title, tree_value } from './utils/testData'

class App extends React.Component {
	render() {
		return (
			<div className={styles.root}>
				<TreeTextArea
					treeTitle={title}
					treeData={tree_value}
					row={21}
					showNumber
					shouleGetTreeData
					delimiter='/'
					placeholder='请输入标题，例：省份/城市/区县/学校&#10;浙江省/宁波市/江北区/学校1&#10;浙江省/宁波市/海曙区/学校1'
				/>
			</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('root')
)
