// pages/main-video/main-video.js
import {
	getTopMV
} from '../../services/video'

Page({
	data: {
		videoList: [],
		offset: 0,
		hasMore: true,
	},
	onLoad() {
		// 发送网络请求
		this.fetchTopMv()
	},
	// 发送网络请求的方法
	async fetchTopMv() {
		const res = await getTopMV(this.data.offset)
		// 将新的数据追加到原来的数组中
		const newVideoList = [...this.data.videoList, ...res.data];
		this.setData({
			videoList: newVideoList
		})
		this.data.offset = this.data.videoList.length;
		this.data.hasMore = res.hasMore
	},
	// 监听上拉和下拉功能
	onReachBottom() {
		if (!this.data.hasMore) return
		this.fetchTopMv()
	},

	async onPullDownRefresh() {
		// 清空之前的数据
		this.setData({ videoList: [] });
		this.data.hasMore = true;
		this.data.offset = 0;

		// 重新请求数据
		await this.fetchTopMv()
		// 获取到数据停止下拉刷新
		wx.stopPullDownRefresh()
	},

	onVideoItemTap(event) {
		const item = event.currentTarget.dataset.item
		wx.navigateTo({
			url: `/pages/detail-video/detail-video?id=${item.id}`,
		})
	}
})