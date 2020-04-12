import React, { useState, useRef, useEffect } from 'react'
import { goToEnd } from '../../utils/utils'
import TitlePng from '../../assets/text_area_title.png'
import styles from './index.less';

interface Props {
  row: number;
  value?: string;
  showNumber?: boolean;
  placeholder?: string;
  errCode?: number;
  errText?: string;
  onChange?(data: any): void;
}

const NumberTextArea = (props: Props): JSX.Element => {
	const { showNumber, placeholder, value, row } = props;

	const [curRow, setCurRow] = useState(props.row);
	const [scrollTop, setScrollTop] = useState(0);
	const [firstLineMarginTop, setFirstLineMarginTop] = useState(0);
	const [errCode, setErrCode] = useState(props.errCode);
	const [errText, setErrText] = useState(props.errText);

	let textAreaRef: any = useRef();

	/**
	 * 定位到最后一行
	 */
	useEffect(()=>{
		const textAreaNode = textAreaRef.current;

		if (textAreaNode) {
			goToEnd(textAreaNode);
		}
	}, [textAreaRef])

	/**
	 * 类似 componentWillReceiveProps
	 */
	useEffect(()=>{
		// 设置错误码
		setErrCode(props.errCode);
		// 设置错误文案
		setErrText(props.errText);
	}, [props.errCode, props.errText])

	/**
	 * 生成 左边序号数字
	 * @param lines 
	 */
	const getLinesTpl = (lines) => {
		const tpl: JSX.Element[] = [];

    for (let i = 0; i < lines; i++) {
      const tplItem = (<div key={i + 1} className={styles.lineno}>{i}</div>);
      tpl.push(tplItem);
    }

    return tpl;
	}

	/**
	 * 重新 设置左边 序号数字
	 * @param textAreaHeight : textArea 总高度
	 * @param scrollTop : textArea 滚动高度
	 */
	const setCurRowLines = (textAreaHeight: number, scrollTop: number): void => {
		const lines = (textAreaHeight) / 21;

		setCurRow(lines);
		setScrollTop(scrollTop);
	}

	/**
	 * 滚动事件
	 * @param e 
	 */
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

	/**
	 * 聚焦事件
	 */
	const handleFocus = (): void => {
		setErrCode(0);
		setErrText('');
	}

	/**
	 * change 事件
	 * @param e 
	 */
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

	/**
	 * 回车事件
	 * @param e 
	 */
	const pressEnter = (e: any): void => {
		if (e.keyCode !== 13) return;

		const textAreaHeight = e.target.clientHeight - 8;
    const scrollTop = e.target.scrollTop;
		const allHeight = textAreaHeight + scrollTop;
    setCurRowLines(allHeight, scrollTop);
	}

	/**
	 * 左边序号 字符串
	 */
	const linesTpl = getLinesTpl(curRow);

	return (
		<div className={`${styles.root} ${errCode !== 0 ? styles.error : ''}`}>
			{
				errCode !== 0 ? (
					<div className={styles.errorText}>{errText}</div>
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
						value={value}
						className={styles.textArea}
						rows={row}
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
