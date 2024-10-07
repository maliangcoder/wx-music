import { requestInstance } from './index'

// 获取MV数据列表
export function getTopMV(offset = 0, limit = 20) {
	return requestInstance.get({
		url: "/top/mv",
		data: {
			limit,
			offset
		}
	})
}

// 获取MV的url
export function getMVUrl(id) {
	return requestInstance.get({
		url: "/mv/url",
		data: {
			id
		}
	})
}

// 获取MV的详情
export function getMVInfo(mvid) {
	return requestInstance.get({
		url: "/mv/detail",
		data: {
			mvid
		}
	})
}

// 获取MV相关的视频
export function getMVRelated(id) {
	return requestInstance.get({
		url: "/related/allvideo",
		data: {
			id
		}
	})
}

