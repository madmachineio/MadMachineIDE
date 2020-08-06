import { observable, action } from 'mobx'

class UserStore {
  @observable userInfo = {}

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @action initUserInfo(userInfo) {
    this.userInfo = userInfo
  }

  @action showUser() {
    this.rootStore.editWindow.app.showUserView()
  }

  @action openCommunity() {
    this.rootStore.editWindow.app.openCommunity()
  }
}

export default UserStore
