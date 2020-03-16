import { observable, action } from 'mobx'

class ExampleStore {
  @observable exampleList = []

  constructor(rootStore) {
    this.rootStore = rootStore

    this.setList(this.rootStore.editWindow.exampleManager.list)
  }

  @action setList(list) {
    this.exampleList = list
  }

  @action openExample(file) {
    // const targetPath = this.rootStore.editWindow.exampleManager.copyExample(file)
    if (file.path) {
      this.rootStore.editWindow.openExample(file.path)
    }
  }
}

export default ExampleStore
