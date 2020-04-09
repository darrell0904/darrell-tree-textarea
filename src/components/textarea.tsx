import React,  { useState, useEffect } from 'react'
import NumberTextArea from './textarea/index'
import {
  isArray,
} from 'lodash';
import { DEFAULT_TEXT } from '../utils/CONST'
import { flattenChainedData, getTextAreaData } from '../utils/getFlattenData'
import {
	isEquelLevel,
	getLevelTitles,
	transDataFromText,
} from '../utils/getTreeData'

import styles from './index.less'

// const styles = require('./index.less')
// title ["请选择省份", "城市", "区县", "学校"]
// value 

interface Props {
	treeTitle: any;
	treeData: any;
	shouleGetTreeData?: boolean
	delimiter?: string;
	showNumber?: boolean;
	placeholder?: string;
	row?: number;
}

const TreeTextArea = (props: Props): JSX.Element => {

	// 属性值
	const [__row, setRow] = useState(props.row || 21);
	const [__showNumber, setShowNumber] = useState(props.showNumber || true);
	const [__delimiter, setDelimiter] = useState(props.delimiter || '/');
	const [__shouleGetTreeData, setShouleGetTreeData] = useState(props.shouleGetTreeData || true);
	const [__placeholder, setPlaceholder] = useState(props.placeholder || '请输入');
	const [__treeData, setTreeData] = useState(props.treeData || []);
	const [__treeTitle, setTreeTitle] = useState(props.treeTitle || []);


	// 内部状态
	const [__errCode, setErrCode] = useState(0);
	const [__errText, setText] = useState('');
	const [__textAreaData, setTextAreaData] = useState('');
	const [__flattenData, setFlattenData] = useState([]);
	const [__curTitles, setCurTitles] = useState('');


	useEffect(()=>{
		if (isArray(__treeData) && isArray(__treeTitle)) {
			let titles = '请输入';

			if (__treeTitle.length > 0) {
				titles = __treeTitle.join('/');
			}

			const flattenData = flattenChainedData(__treeData);
    	const textAreaData = getTextAreaData(flattenData, titles);

			setFlattenData(flattenData);
			setTextAreaData(textAreaData.join('\n'));
			setCurTitles(titles);
		}

		return ()=>{
			// willUnMount
		}
	}, [])

	const onChange = (data: any): void => {
		setTextAreaData(data);
		setErrCode(0);
		setText('');
	}

	const getTreeData = (e: any): void => {
		// console.log('---__textAreaData---', __textAreaData);
		console.log('---__flattenData---', __flattenData);

		const { errorCode, ERROR_INFO } = isEquelLevel(__textAreaData);

		if (errorCode !== 0) {
			setErrCode(errorCode);
			setText(ERROR_INFO[errorCode]);
    } else {
			// console.log();
			const levelTitles = getLevelTitles(__textAreaData);
			const valueData = transDataFromText(__flattenData, __textAreaData);
			
			console.log('--levelTitles--', levelTitles);
			console.log('--valueData--', valueData);
		}

	}

	return (
		<div className={styles.wrapper}>
			<NumberTextArea
				row={__row}
				value={__textAreaData}
				onChange={onChange}
				showNumber={__showNumber}
				placeholder={__placeholder}
				errCode={__errCode}
				errText={__errText}
			/>
			{
				__shouleGetTreeData ? (
					<div className={styles.btnBox}>
					<button className={styles.btn}>填充默认值</button>
					<button className={styles.btn} onClick={getTreeData}>得到树状值</button>
				</div>
				) : null
			}
		</div>
	)
};

export default TreeTextArea;


// typescript 使用 less