import { requestInstance } from './index'

export function getSongDetail(ids) {
	return requestInstance.get({
		url: "/song/detail",
		data: {
			ids
		}
	})
}

export function getSongLyric(id) {
	return requestInstance.get({
		url: "/lyric",
		data: {
			id
		}
	})
}