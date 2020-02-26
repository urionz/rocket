import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { LivechatRooms, LivechatInquiry } from '../../../models/server';
import { createLivechatRoom, createLivechatInquiry } from './Helper';
import { callbacks } from '../../../callbacks/server';
import { RoutingManager } from './RoutingManager';
import { Livechat } from './Livechat';

export const QueueManager = {
	async requestRoom({ guest, message, roomInfo, agent }) {
		check(message, Match.ObjectIncluding({
			rid: String,
		}));
		check(guest, Match.ObjectIncluding({
			_id: String,
			username: String,
			status: Match.Maybe(String),
			department: Match.Maybe(String),
		}));

		if (!Livechat.online(guest.department)) {
			throw new Meteor.Error('no-agent-online', 'Sorry, no online agents');
		}

		const { rid } = message;
		const name = (roomInfo && roomInfo.fname) || guest.name || guest.username;

		const room = LivechatRooms.findOneById(createLivechatRoom(rid, name, guest, roomInfo));
		let inquiry = LivechatInquiry.findOneById(createLivechatInquiry(rid, name, guest, message));

		LivechatRooms.updateRoomCount();

		if (!agent) {
			agent = RoutingManager.getMethod().delegateAgent(agent, inquiry);
		}

		inquiry = await callbacks.run('livechat.beforeRouteChat', inquiry, agent);
		if (inquiry.status !== 'ready') {
			return room;
		}

		return RoutingManager.delegateInquiry(inquiry, agent);
	},
};
