import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'

import emitter from '@/utils/emitter'

import '@edit/index.scss'
import App from '@edit/components/app'

import Store from '@edit/store'

// let scaleRate = 1
// const scaleSpeed = 0.2
// document.addEventListener('keydown', (event) => {
//   if (event.metaKey || event.ctrlKey) {
//     if (event.key === '-') {
//       scaleRate -= scaleSpeed
//     }
//     if (event.key === '=') {
//       scaleRate += scaleSpeed
//     }
//     if (event.key === '0') {
//       scaleRate = 1
//     }

//     webFrame.setZoomFactor(scaleRate)
//   }
// })

window.addEventListener('resize', () => {
  emitter.emit('PAGE_RESIZE')
})

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
