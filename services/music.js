import { requestInstance } from './index'

export function getMusicBanner(type = 0) {
	return requestInstance.get({
		url: '/banner',
		data: {
			type
		}
	})
}

export function getPlayListDetail(id) {
	return requestInstance.get({
		url: "/playlist/detail",
		data: {
			id
		}
	})
}

export function getSongMenuList(cat = "全部", limit = 6, offset = 0) {
	return requestInstance.get({
		url: "/top/playlist",
		data: {
			cat,
			limit,
			offset
		}
	})
}

export function getSongMenuTag() {
	return requestInstance.get({
		url: "/playlist/hot",
	})
}