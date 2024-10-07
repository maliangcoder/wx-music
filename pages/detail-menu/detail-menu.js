// pages/detail-menu/detail-menu.js
import { getSongMenuList, getSongMenuTag } from "../../services/music"
Page({
  data: {
    songMenus: []
  },
  onLoad() {
    this.fetchAllMenuList()
  },
  async fetchAllMenuList() {
    const tagRes = await getSongMenuTag()
    // 获取tags
    const tags = tagRes.tags
    // 根据tag获取歌单
    const allPromise = []
    for (const tag of tags) {
      const promise = getSongMenuList(tag.name)
      allPromise.push(promise)
    }
    // 获取到所有数据之后只调用一次setData
    Promise.all(allPromise).then(res => {
      this.setData({ songMenus: res })
    })
  }
})