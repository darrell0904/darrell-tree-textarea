import React from 'react'
import NumberTextArea from './textarea/index'
// 测试数据
import { title, tree_value } from '../utils/testData'

import styles from './index.less'

// const styles = require('./index.less')
// title ["请选择省份", "城市", "区县", "学校"]
// value 

console.log('--styles--', styles);

interface Props {
}

const TreeTextArea = (props: Props): JSX.Element => {

	const onChange = (data: any): void => {
		console.log('----data----', data);
	}

	return (
		<div className={styles.wrapper}>
			<NumberTextArea
				row={21}
				onChange={onChange}
				showNumber
				placeholder="请输入标题，例：省份/城市/区县/学校&#10;浙江省/宁波市/江北区/学校1&#10;浙江省/宁波市/海曙区/学校1"
			/>
			<div className={styles.btnBox}>
				<button className={styles.btn}>得到树状值</button>
			</div>
		</div>
	)
};

export default TreeTextArea;


// typescript 使用 less