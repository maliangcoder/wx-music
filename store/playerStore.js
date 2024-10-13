import { HYEventStore } from 'hy-event-store'
import { parseLyric } from '../utils/parseLyric'
import { getSongDetail, getSongLyric } from '../services/player'

export const PLAY_SONG_INDEX = 'playSongIndex'
export const PLAY_SONG_LIST = 'playSongList'

const audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
	state: {
		[PLAY_SONG_LIST]: [],
		[PLAY_SONG_INDEX]: -1,

		id: 0,
		currentPage: 0,
		contentHeight: 0,
		currentSong: {},
		lyricInfos: [],
		currentLyricText: "",
		currentLyricIndex: -1,

		currentTime: 0,
		durationTime: 0,

		isFirstPlay: true,

		isPlaying: false,
		playModeIndex: 0, // 0:顺序播放 1:单曲循环 2:随机播放

	},

	actions: {
		playMusicWithSongIdAction(ctx, id) {
			ctx.id = id
			ctx.isPlaying = true

			ctx.currentSong = {}
			ctx.currentTime = 0
			ctx.durationTime = 0
			ctx.lyricInfos = []
			ctx.currentLyricIndex = 0
			ctx.currentLyricText = ''

			getSongDetail(id).then(res => {
				ctx.currentSong = res.songs[0]
				ctx.durationTime = res.songs[0].dt
			})

			getSongLyric(id).then(res => {
				const lyricInfos = parseLyric(res.lrc.lyric)
				ctx.lyricInfos = lyricInfos
			})

			audioContext.stop()
			audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
			audioContext.autoplay = true

			if (ctx.isFirstPlay) {
				ctx.isFirstPlay = false

				audioContext.onTimeUpdate(() => {
					// 1.获取当前播放时间
					ctx.currentTime = audioContext.currentTime * 1000

					// 2.匹配正确的歌词
					if (!ctx.lyricInfos.length) return
					const index = ctx.lyricInfos.findIndex(item => item.time > audioContext.currentTime * 1000) - 1

					if (index === ctx.currentLyricIndex) return
					const currentLyricText = ctx.lyricInfos[index].text

					ctx.currentLyricText = currentLyricText
					ctx.currentLyricIndex = index
				})

				audioContext.onWaiting(() => {
					audioContext.pause()
				})

				audioContext.onCanplay(() => {
					audioContext.play()
				})

				audioContext.onEnded(() => {
					// 如果是单曲循环，就不需要播放下一首歌曲
					if (audioContext.loop) return

					// 播放下一首歌曲
					this.dispatch('playNewMusicAction')
				})
			}
		},
		changeMusicStatusAction(ctx) {
			if (!audioContext.paused) {
				audioContext.pause()
				ctx.isPlaying = false
			} else {
				audioContext.play()
				ctx.isPlaying = true
			}
		},
		changePlayModeAction(ctx) {
			let modeIndex = ctx.playModeIndex + 1
			if (modeIndex === 3) modeIndex = 0

			if (modeIndex === 1) {
				audioContext.loop = true
			} else {
				audioContext.loop = false
			}
			ctx.playModeIndex = modeIndex
		},
		playNewMusicAction(ctx, isNext = true) {
			const length = ctx.playSongList.length
			let index = ctx.playSongIndex

			switch (ctx.playModeIndex) {
				case 1:
				case 0:
					index = isNext ? index + 1 : index - 1
					if (index === length) index = 0
					if (index === -1) index = length - 1
					break;
				case 2:
					index = Math.floor(Math.random() * length)
					break
			}
			const newSong = ctx.playSongList[index]

			// 设置新的播放歌曲
			this.dispatch('playMusicWithSongIdAction', newSong.id)

			// 保存最新的索引
			ctx[PLAY_SONG_INDEX] = index

			// this.onPlayOrPauseTap()
		}
	}
})

export default playerStore