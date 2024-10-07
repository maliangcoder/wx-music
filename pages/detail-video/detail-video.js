import { getMVUrl, getMVInfo, getMVRelated } from '../../services/video'
Page({
	data: {
		id: 0,
		mvUrl: "",
		relatedVideo: [],
		danmuList: [
			{ text: "哈哈哈，不错哦", color: "#fff000", time: 5 },
			{ text: "呵呵呵，不错哦！！！", color: "#fff010", time: 9 },
			{ text: "嘿嘿嘿，一般般", color: "#fff001", time: 12 },
		],
		mvInfo: {}
	},
	onLoad(options) {
		const id = options.id;
		this.setData({ id })

		this.fetchMvUrl()
		this.fetchMvInfo()
		this.fetchMvRelated()
	},
	async fetchMvUrl() {
		const { data } = await getMVUrl(this.data.id)
		this.setData({ mvUrl: data.url })
	},
	async fetchMvInfo() {
		const res = await getMVInfo(this.data.id)
		this.setData({ mvInfo: res.data })
	},
	async fetchMvRelated() {
		const res = await getMVRelated(this.data.id)
		this.setData({ relatedVideo: res.data })
	}
})