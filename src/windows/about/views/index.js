import { remote } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'

import App from '@about/components/app'

import Store from '@about/store'

import './index.scss'

const pv = remote.getGlobal('pv')

ReactDOM.render(
  <Provider {...new Store()}>
    <App />
  </Provider>,
  document.getElementById('root'),
)
pv('/about', 'About')

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
