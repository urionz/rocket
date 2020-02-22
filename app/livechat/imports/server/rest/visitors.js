
import { check } from 'meteor/check';

import { API } from '../../../../api';
import { findVisitorInfo, findVisitedPages, findChatHistory } from '../../../server/api/lib/visitors';

API.v1.addRoute('livechat/visitors.info', { authRequired: true }, {
	get() {
		check(this.queryParams, {
			visitorId: String,
		});

		const visitor = Promise.await(findVisitorInfo({ userId: this.userId, visitorId: this.queryParams.visitorId }));

		return API.v1.success(visitor);
	},
});

API.v1.addRoute('livechat/visitors.pagesVisited/:roomId', { authRequired: true }, {
	get() {
		check(this.urlParams, {
			roomId: String,
		});
		const { offset, count } = this.getPaginationItems();
		const { sort } = this.parseJsonQuery();


		const pages = Promise.await(findVisitedPages({
			userId: this.userId,
			roomId: this.urlParams.roomId,
			pagination: {
				offset,
				count,
				sort,
			},
		}));

		return API.v1.success(pages);
	},
});

API.v1.addRoute('livechat/visitors.chatHistory/room/:roomId/visitor/:visitorId', { authRequired: true }, {
	get() {
		check(this.urlParams, {
			visitorId: String,
			roomId: String,
		});
		const { offset, count } = this.getPaginationItems();
		const { sort } = this.parseJsonQuery();

		const history = Promise.await(findChatHistory({
			userId: this.userId,
			roomId: this.urlParams.roomId,
			visitorId: this.urlParams.visitorId,
			pagination: {
				offset,
				count,
				sort,
			},
		}));

		return API.v1.success(history);
	},
});
