import React, { useState, useRef, useEffect } from 'react'
import TitlePng from '../../assets/text_area_title.png'
import styles from './index.less';

interface Props {
  row?: number;
  value?: string;
  showNumber?: boolean;
  placeholder?: string;
  errCode?: number;
  errorText?: string;
  onChange?(data: any): void;
}

// 是否需要左边数字栏目
// 是否要处理树数据（）
// 处理树数据的分隔符（“/”）
// 

const NumberTextArea = (props: Props): JSX.Element => {
	console.log('---styles--11111--', TitlePng);
	const { showNumber, placeholder } = props;
 
	const [curRow, setCurRow] = useState(props.row || 21);
	const [scrollTop, setScrollTop] = useState(0);
	const [firstLineMarginTop, setFirstLineMarginTop] = useState(0);
	const [errCode, setErrCode] = useState(props.errCode || 0);
	const [errorText, setErrorText] = useState(props.errorText || '');


	let textAreaRef: any = useRef();

	const getLinesTpl = (lines) => {
		const tpl: JSX.Element[] = [];

    for (let i = 0; i < lines; i++) {
      const tplItem = (<div key={i + 1} className={styles.lineno}>{i}</div>);
      tpl.push(tplItem);
    }

    return tpl;
	}

	const setCurRowLines = (textAreaHeight: number, scrollTop: number): void => {
		const lines = (textAreaHeight) / 21;

		setCurRow(lines);
		setScrollTop(scrollTop);
	}

	// 滚动事件
	const handleScroll = (e: any): void => {
		const textAreaHeight = e.target.clientHeight - 8;
		const scrollTop = e.target.scrollTop;
		let marginTop = scrollTop;

		const allHeight = textAreaHeight + scrollTop;
		
		if (scrollTop > 30) {
      marginTop = 30;
		}
		
		setFirstLineMarginTop(marginTop);

    setCurRowLines(allHeight, scrollTop);
	}

	// 聚焦事件
	const handleFocus = (): void => {
		setErrCode(0);
		setErrorText('');
	}

	// change 事件
	const changeValue = (e: any): void => {
		e.stopPropagation();
    const { onChange } = props;
		const value = e.target.value;

		if (onChange) {
			onChange(value);
		}

    // 清除错误
    handleFocus();
	}

	// 回车事件
	const pressEnter = (e: any): void => {
		console.log('--e.keyCode--', e.keyCode);
		if (e.keyCode !== 13) return;

		const textAreaHeight = e.target.clientHeight - 8;
    const scrollTop = e.target.scrollTop;
		const allHeight = textAreaHeight + scrollTop;
    setCurRowLines(allHeight, scrollTop);
	}

	// 序号 number
	const linesTpl = getLinesTpl(curRow);

	return (
		<div className={`${styles.root} ${errCode !== 0 ? styles.error : ''}`}>
			{
				errCode !== 0 ? (
					<div className={styles.errorText}>{errorText}</div>
				) : null
			}
			<div className={styles.infoBox}>
				<div
					className={styles.imgbox}
					style={{ marginTop: `-${firstLineMarginTop}px` }}
				>
					<img src={TitlePng} alt="标题" />
				</div>
				<div
					className={styles.bg}
					style={{ marginTop: `-${firstLineMarginTop}px` }}
				/>
				{
					showNumber ? (
						<div
							className={styles.lines}
						>
							<div
								className={styles.codelines}
								style={{ marginTop: `-${scrollTop}px` }}
							>
								{linesTpl}
							</div>
						</div>
					) : null
				}
				<div
					className={styles.linedtextarea}
					style={{
						marginLeft: `${showNumber ? '40px' : '0'}`,
					}}
				>
					<textarea
						ref={textAreaRef}
						className={styles.textArea}
						rows={props.row || 21}
						placeholder={placeholder}
						onScroll={handleScroll}
						onFocus={handleFocus}
						onChange={changeValue}
						onKeyDown={pressEnter}
					/>
				</div>
			</div>
			
		</div>
	)
};

export default NumberTextArea;
