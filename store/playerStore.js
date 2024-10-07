import { HYEventStore } from 'hy-event-store'

export const PLAY_SONG_INDEX = 'playSongIndex'
export const PLAY_SONG_LIST = 'playSongList'

const playerStore = new HYEventStore({
	state: {
		[PLAY_SONG_LIST]: [],
		[PLAY_SONG_INDEX]: -1
	}
})

export default playerStore