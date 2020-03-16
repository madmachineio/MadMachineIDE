import { observable, action } from 'mobx'

const { ipcRenderer } = require('electron')

class User {
  // 用户名字
  @observable userName = ''

  // 用户邮箱
  @observable userEmail = ''

  @action setUserName(name) {
    this.userName = name
  }

  @action setUserEmail(mail) {
    this.userEmail = mail
  }

  @action setUserInfo(info) {
    const { userName, userEmail } = info || {}
    this.userName = userName
    this.userEmail = userEmail
  }

  @action saveUserInfo() {
    fetch(`http://madmachine.arnotong.cn/user/update?mail=${this.userEmail}&name=${this.userName}`)
      .then(() => {
        ipcRenderer.send('SAVE_USER_INFO', {
          userName: this.userName,
          userEmail: this.userEmail,
        })
      })
      .catch(() => {
        ipcRenderer.send('SAVE_USER_INFO', {
          userName: this.userName,
          userEmail: this.userEmail,
        })
      })
  }

  @action closeWindow() {
    ipcRenderer.send('CANCEL_USER_INFO')
  }
}

export default User
