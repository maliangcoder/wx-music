// components/nav-bar/nav-bar.js
const app = getApp()
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: "歌曲标题"
    }
  },
  data: {
    statusHeight: 20
  },

  lifetimes: {
    attached() {
      this.setData({ statusHeight: app.globalData.statusHeight })
    }
  },
  methods: {
    onLeftClick() {
      this.triggerEvent('leftClick')
    }
  }
})