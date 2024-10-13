import { throttle } from "underscore"
import playerStore, { PLAY_SONG_INDEX, PLAY_SONG_LIST } from '../../store/playerStore'

const app = getApp()

const modeNames = ['order', 'repeat', 'random']
Page({
  data: {
    stateKeys: ['id', 'lyricInfos', 'currentLyricText', 'currentLyricIndex', 'currentSong', 'durationTime', 'currentTime', 'isPlaying', 'playModeIndex'],

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

    playModeName: 'order'
  },
  onLoad(options) {
    // 获取屏幕剩余高度
    this.setData({ contentHeight: app.globalData.contentHeight })

    const id = options.id

    playerStore.dispatch('playMusicWithSongIdAction', id)

    playerStore.onStates([PLAY_SONG_INDEX, PLAY_SONG_LIST], this.getPlaySongInfoHandle)
    playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHandle)
  },


  onNavBackTap() {
    wx.navigateBack()
  },

  // 计算当前时间和行进时间
  updateProgress: throttle(function (currentTime) {
    if (this.data.isSliderChanging) return
    const sliderValue = currentTime / this.data.durationTime * 100
    this.setData({ currentTime, sliderValue })
  }, 800, { leading: true, trailing: false }),

  onSwiperChage(event) {
    this.setData({ currentPage: event.detail.current })
  },
  onToggleTab(event) {
    const index = event.currentTarget.dataset.index
    this.setData({ currentPage: index })
  },

  onSliderChange(event) {
    // 1.获取滑块对应的值
    const value = event.detail.value

    // 2.计算要播放的位置时间
    const currentTime = value / 100 * this.data.durationTime

    // 3.设置计算出来的播放时间
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })
  },

  // 拖动过程中触发的事件
  onSliderChanging: throttle(function (event) {
    const value = event.detail.value

    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })

    this.data.isSliderChanging = true
  }, 100),

  onPlayOrPauseTap() {
    playerStore.dispatch('changeMusicStatusAction')
  },

  onPrevBtnTap() {
    playerStore.dispatch('playMusicAction', false)
  },
  onNextBtnTap() {
    playerStore.dispatch('playMusicAction')
  },

  onMoreBtnTap() {
    playerStore.dispatch('changePlayModeAction')
  },

  changeNewSong(isNext = true) {
    
  },

  getPlaySongInfoHandle({ playSongList, playSongIndex }) {
    if (playSongList) {
      this.setData({ playSongList })
    }
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
  },

  getPlayerInfosHandle({ id, lyricInfos, currentLyricIndex, currentLyricText, currentSong, durationTime, currentTime, isPlaying, playModeIndex }) {
    if (id !== undefined) {
      this.setData({ id })
    }
    if (lyricInfos) {
      this.setData({ lyricInfos })
    }
    if (currentLyricIndex !== undefined) {
      this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
    }
    if (currentLyricText) {
      this.setData({ currentLyricText })
    }
    if (currentSong) {
      this.setData({ currentSong })
    }
    if (currentTime !== undefined) {
      this.updateProgress(currentTime)
    }
    if (durationTime !== undefined) {
      this.setData({ durationTime })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
    if (playMoreIndex !== undefined) {
      this.setData({ playModeName: modeNames[playMoreIndex] })
    }
  },

  onUnload() {
    playerStore.offState([PLAY_SONG_LIST, PLAY_SONG_INDEX], this.getPlaySongListHandle)
    playerStore.offState(this.data.stateKeys, this.getPlayInfosHandle)
  }
})