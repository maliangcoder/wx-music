import { getSongDetail, getSongLyric } from "../../services/player"
import { parseLyric } from '../../utils/parseLyric'
import { throttle } from "underscore"
import playerStore, { PLAY_SONG_INDEX, PLAY_SONG_LIST } from '../../store/playerStore'

const app = getApp()
const audioContext = wx.createInnerAudioContext()
const modeNames = ['order', 'repeat', 'random']
Page({
  data: {
    id: 0,
    currentPage: 0,
    pageTitles: ["歌曲", "歌词"],
    contentHeight: 0,
    currentSong: {},
    lyricInfos: [],
    currentLyricText: "",
    currentLyricIndex: -1,

    currentTime: 0,
    durationTime: 0,
    sliderValue: 0,
    isSliderChanging: false,
    isPlaying: true,

    lyricScrollTop: 0,

    playSongList: [],
    playSongIndex: 0,
    isFirstPlay: true,

    playMoreIndex: 0,
    playModeName: 'order'
  },
  onLoad(options) {
    // 获取屏幕剩余高度
    this.setData({ contentHeight: app.globalData.contentHeight })

    const id = options.id
    this.setupPlaySong(id)

    playerStore.onStates([PLAY_SONG_INDEX, PLAY_SONG_LIST], this.getPlaySongInfoHandle)
  },

  setupPlaySong(id) {
    this.setData({ id })

    getSongDetail(id).then(res => {
      this.setData({ currentSong: res.songs[0], durationTime: res.songs[0].dt })
    })

    getSongLyric(id).then(res => {
      const lyricInfos = parseLyric(res.lrc.lyric)
      this.setData({ lyricInfos })
    })

    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    audioContext.autoplay = true

    if (this.data.isFirstPlay) {
      this.data.isFirstPlay = false
      // 监听播放的进度
      const throttleUpdateProgress = throttle(this.updateProgress, 500, { leading: false, trailing: false })
      audioContext.onTimeUpdate(() => {
        if (!this.data.isSliderChanging) {
          throttleUpdateProgress()
        }

        if (!this.data.lyricInfos.length) return
        const index = this.data.lyricInfos.findIndex(item => item.time > audioContext.currentTime * 1000) - 1

        if (index === this.data.currentLyricIndex) return
        const currentLyricText = this.data.lyricInfos[index].text
        this.setData({ currentLyricText, currentLyricIndex: index, lyricScrollTop: index * 35 })
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
        this.changeNewSong()
      })
    }
  },

  onNavBackTap() {
    wx.navigateBack()
  },

  // 计算当前时间和行进时间
  updateProgress() {
    const sliderValue = this.data.currentTime / this.data.durationTime * 100
    this.setData({ currentTime: audioContext.currentTime * 1000, sliderValue })
  },

  onSwiperChage(event) {
    this.setData({ currentPage: event.detail.current })
  },
  onToggleTab(event) {
    const index = event.currentTarget.dataset.index
    this.setData({ currentPage: index })
  },

  onSliderChange: throttle(function (event) {
    // 1.获取滑块对应的值
    const value = event.detail.value

    // 2.计算要播放的位置时间
    const currentTime = value / 100 * this.data.durationTime

    // 3.设置计算出来的播放时间
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })
  }, 100),

  // 拖动过程中触发的事件
  onSliderChanging(event) {
    const value = event.detail.value

    const currentTime = value / 100 * this.data.durationTime

    this.setData({ currentTime })
    this.data.isSliderChanging = true
  },

  onPlayOrPauseTap() {
    if (!audioContext.paused) {
      audioContext.pause()
      this.setData({ isPlaying: false })
    } else {
      audioContext.play()
      this.setData({ isPlaying: true })
    }
  },

  onPrevBtnTap() {
    this.changeNewSong(false)
  },
  onNextBtnTap() {
    this.changeNewSong()
  },

  onMoreBtnTap() {
    let modeIndex = this.data.playMoreIndex + 1
    if (modeIndex === 3) modeIndex = 0

    if (modeIndex === 1) {
      audioContext.loop = true
    } else {
      audioContext.loop = false
    }

    this.setData({ playMoreIndex: modeIndex, playModeName: modeNames[modeIndex] })
  },

  changeNewSong(isNext = true) {
    const length = this.data.playSongList.length
    let index = this.data.playSongIndex

    switch (this.data.playMoreIndex) {
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


    const newSong = this.data.playSongList[index]
    // 将之前的数据初始化
    this.setData({ currentSong: {}, sliderValue: 0, currentTime: 0, durationTime: 0 })
    // 设置新的播放歌曲
    this.setupPlaySong(newSong.id)

    // 保存最新的索引
    playerStore.setState(PLAY_SONG_INDEX, index)

    this.onPlayOrPauseTap()
  },

  getPlaySongInfoHandle({ playSongList, playSongIndex }) {
    if (playSongList) {
      this.setData({ playSongList })
    }
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
  },

  onUnload() {
    playerStore.offState([PLAY_SONG_LIST, PLAY_SONG_INDEX], this.getPlaySongListHandle)
  }
})