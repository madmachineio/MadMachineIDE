import React from 'react'

import './index.scss'

import logoPng from '@windows/assets/images/logo.png'

const App = () => (
  <div className="layout-about">
    <img src={logoPng} alt="logo" className="logo" />
    <div className="body">
      <div className="header">
        <div className="title">MadMachine</div>
        <div className="version">Version Beta {process.env.VERSION}</div>
      </div>
      <div className="tip">Copyright © 2018-2019 MadMachine. All Rights Reserved.</div>
    </div>
  </div>
)

export default App
