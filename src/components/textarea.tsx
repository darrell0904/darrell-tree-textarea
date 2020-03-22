import React from 'react'
import MyTextarea from './textarea/index'

import styles from './index.less'

// const styles = require('./index.less')

console.log('--styles--', styles);

class App extends React.Component {
	render () {
		return (
			<div className={styles.wrapper}>
				<MyTextarea />
			</div>
		)
	}
}

export default App;
