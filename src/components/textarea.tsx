import React,  { useState, useEffect } from 'react'
import { isArray } from 'lodash';

import NumberTextArea from './textarea/index'

import { DEFAULT_TEXT } from '../utils/CONST'

import { flattenChainedData, getTextAreaData } from '../utils/getFlattenData'
import treeTextAreaDataHandle from '../utils/handleTreeData';

import styles from './index.less'


interface Props {
	treeTitle?: any;
	treeData?: any;
	shouleGetTreeData?: boolean;
	delimiter?: string;
	showNumber?: boolean;
	placeholder?: string;
	row?: number;
	maxLevel?: number;
	defaultData?: string;
	onChangeTreeData?(treeTitle: any, treeData: any): void;
}

const TreeTextArea = (props: Props): JSX.Element => {
	// 属性值
	// const [__row, setRow] = useState(props.row || 21);
	// const [__showNumber, setShowNumber] = useState(props.showNumber || true);
	// const [__delimiter, setDelimiter] = useState(props.delimiter || '/');
	// const [__shouleGetTreeData, setShouleGetTreeData] = useState(props.shouleGetTreeData !== undefined ? props.shouleGetTreeData : true);
	// const [__placeholder, setPlaceholder] = useState(props.placeholder || '请输入');
	// const [__treeData, setTreeData] = useState(props.treeData || []);
	// const [__treeTitle, setTreeTitle] = useState(props.treeTitle || []);
	// const [__maxLevel, setMaxLevel] = useState(props.maxLevel || 4);

	// 内部状态
	const [__errCode, setErrCode] = useState(0);
	const [__errText, setText] = useState('');
	const [__textAreaData, setTextAreaData] = useState('');
	const [__flattenData, setFlattenData] = useState([]);
	// const [__curTitles, setCurTitles] = useState('');

	const __row = props.row || 21;
	const __showNumber = props.showNumber || true;
	const __delimiter = props.delimiter || '/';
	const __shouleGetTreeData = props.shouleGetTreeData !== undefined ? props.shouleGetTreeData : true;
	const __placeholder = props.placeholder || '请输入';
	const __treeData = props.treeData || [];
	const __treeTitle = props.treeTitle || [];
	const __maxLevel = props.maxLevel || 4;


	useEffect(()=>{
		if (isArray(__treeData) && isArray(__treeTitle)) {
			let titles = '请输入';

			if (__treeTitle.length > 0) {
				titles = __treeTitle.join(__delimiter);
			}

			const flattenData = flattenChainedData(__treeData);
			const textAreaData = getTextAreaData(flattenData, titles);

			setFlattenData(flattenData);
			setTextAreaData(textAreaData.join('\n'));
			// setCurTitles(titles);
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

	// 设置默认值
	const getDefaultData = (): void => {
		const { defaultData } = props;
		setTextAreaData(defaultData || DEFAULT_TEXT);
	}

	const getTreeData = (e: any): void => {
		const { onChangeTreeData } = props;

		const textareaInstance = new treeTextAreaDataHandle({
			flattenData: __flattenData,
			textAreaTexts: __textAreaData,
			delimiter: __delimiter,
			maxLevel: __maxLevel,
		});

		const { errorCode, ERROR_INFO } = textareaInstance.isEquelLevel();

		if (errorCode !== 0) {
			setErrCode(errorCode);
			setText(ERROR_INFO[errorCode]);
    } else {
			const levelTitles = textareaInstance.getLevelTitles();
			const valueData = textareaInstance.transDataFromText();
			
			if (onChangeTreeData) {
				onChangeTreeData(levelTitles, valueData);
			}

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
					<button
						className={`${styles.btn} ${styles.btnOutline}`}
						onClick={getDefaultData}
					>
						填充默认值
					</button>
					<button
						className={styles.btn}
						onClick={getTreeData}
					>
						得到树状值
					</button>
				</div>
				) : null
			}
		</div>
	)
};

export default TreeTextArea;
