import { HYEventStore } from 'hy-event-store'
import { getPlayListDetail } from '../services/music'

const recommendStore = new HYEventStore({
	state: {
		recommendSongInfo: {}
	},
	actions: {
		fetchRecommendSongsAction(ctx) {
			getPlayListDetail(3778678).then(res => {
				ctx.recommendSongInfo = res.playlist
			})
		}
	}
})

export default recommendStore