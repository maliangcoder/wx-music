// app.js
App({
	globalData: {
		screenWidth: 375,
		screenHeight: 667,
		statusHeight: 20,
		contentHeight: 500,
	},


	onLaunch() {
		this.globalData.screenWidth = wx.getWindowInfo().screenWidth
		this.globalData.screenHeight = wx.getWindowInfo().screenHeight
		this.globalData.statusHeight = wx.getWindowInfo().statusBarHeight
		this.globalData.contentHeight = this.globalData.screenHeight - this.globalData.statusHeight - 44
	}
})
