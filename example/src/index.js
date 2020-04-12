import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import './index.css'

console.log('----App----', App);
require('react-dom');
window.React2 = require('react');
console.log(window.React1 === window.React2);

ReactDOM.render(<App />, document.getElementById('root'))
