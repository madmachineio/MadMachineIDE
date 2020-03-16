import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'

import App from '@start/components/app'

import Store from '@start/store'

import './index.scss'

ReactDOM.render(
  <Provider {...new Store()}>
    <App />
  </Provider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
