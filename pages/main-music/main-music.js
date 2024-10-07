// pages/main-music/main-music.js
import { getMusicBanner, getSongMenuList } from '../../services/music'
import playerStore, { PLAY_SONG_INDEX, PLAY_SONG_LIST } from '../../store/playerStore'
import recommendStore from '../../store/recommendStore'
import rankingStore, { rankingMap } from '../../store/rankingStore'
import querySelect from '../../utils/query-select'
import { throttle } from 'underscore'

const querySelectThrottle = throttle(querySelect, 100)

Page({
	data: {
		searchValue: "",
		banners: [],
		bannerHeight: 0,

		recommendSongs: [],

		hotMenuList: [],
		recMenuList: [],

		rankingInfos: {}
	},
	onLoad() {
		this.fetchMusicBanner()
		this.fetchSongMenuList()

		recommendStore.onState('recommendSongInfo', this.handleRecommendSongs)
		recommendStore.dispatch('fetchRecommendSongsAction')

		for (const key in rankingMap) {
			rankingStore.onState(key, this.getRankingHandle(key))
		}
		rankingStore.dispatch('fetchRankingDataAction')

	},

	async fetchMusicBanner() {
		const res = await getMusicBanner()
		this.setData({ banners: res.banners })
	},

	async fetchSongMenuList() {
		getSongMenuList().then(res => {
			this.setData({ hotMenuList: res.playlists })
		})
		getSongMenuList("华语").then(res => {
			this.setData({ recMenuList: res.playlists })
		})
	},

	onSearchClick() {
		wx.navigateTo({
			url: '/pages/detail-search/detail-search',
		})
	},

	onBannerImageLoad(event) {
		// 获取Image组件高度
		querySelectThrottle(".banner-image").then(res => {
			this.setData({ bannerHeight: res[0].height })
		})
	},

	onRecommendMoreClick() {
		wx.navigateTo({
			url: '/pages/detail-song/detail-song?type=recommend',
		})
	},

	onSongItemTap(event) {
		const index = event.currentTarget.dataset.index
		playerStore.setState(PLAY_SONG_LIST, this.data.recommendSongs)
		playerStore.setState(PLAY_SONG_INDEX, index)
	},

	handleRecommendSongs(value) {
		if (!value.tracks) return
		this.setData({ recommendSongs: value.tracks.slice(0, 6) })
	},

	getRankingHandle(ranking) {
		return value => {
			const newRankingInfos = { ...this.data.rankingInfos, [ranking]: value }
			this.setData({ rankingInfos: newRankingInfos })
		}
	},

	onUnload() {
		recommendStore.offState('recommendSongs', this.handleRecommendSongs)
		for (const key in rankingMap) {
			recommendStore.offState(key, this.getRankingHandle(key))
		}
	}
})