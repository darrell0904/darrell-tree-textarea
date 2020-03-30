import React from 'react';
import ReactDOM from 'react-dom'
import TreeTextArea from './components/textarea'

import styles from './index.less'

class App extends React.Component {
	render() {
		return (
			<div className={styles.root}>
				<TreeTextArea />
			</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('root')
)
