import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import _ from 'underscore';
import s from 'underscore.string';
import moment from 'moment';
import UAParser from 'ua-parser-js';

import { modal } from '../../../../../ui-utils';
import { Subscriptions } from '../../../../../models';
import { settings } from '../../../../../settings';
import { t, handleError, roomTypes } from '../../../../../utils';
import { hasRole, hasPermission, hasAtLeastOnePermission } from '../../../../../authorization';
import './visitorInfo.html';
import { APIClient } from '../../../../../utils/client';
import { RoomManager } from '../../../../../ui-utils/client';
import { DateFormat } from '../../../../../lib/client';

const isSubscribedToRoom = () => {
	const data = Template.currentData();
	if (!data || !data.rid) {
		return false;
	}

	const subscription = Subscriptions.findOne({ rid: data.rid });
	return subscription !== undefined;
};

Template.visitorInfo.helpers({
	user() {
		const user = Template.instance().user.get();
		if (user && user.userAgent) {
			const ua = new UAParser();
			ua.setUA(user.userAgent);

			user.os = `${ ua.getOS().name } ${ ua.getOS().version }`;
			if (['Mac OS', 'iOS'].indexOf(ua.getOS().name) !== -1) {
				user.osIcon = 'icon-apple';
			} else {
				user.osIcon = `icon-${ ua.getOS().name.toLowerCase() }`;
			}
			user.browser = `${ ua.getBrowser().name } ${ ua.getBrowser().version }`;
			user.browserIcon = `icon-${ ua.getBrowser().name.toLowerCase() }`;

			user.status = roomTypes.getUserStatus('l', this.rid) || 'offline';
		}
		return user;
	},

	room() {
		return Template.instance().room.get();
	},

	department() {
		return Template.instance().department.get();
	},

	joinTags() {
		const tags = Template.instance().tags.get();
		return tags && tags.join(', ');
	},

	customRoomFields() {
		const customFields = Template.instance().customFields.get();
		if (!customFields || customFields.length === 0) {
			return [];
		}

		const fields = [];
		const room = Template.instance().room.get();
		const { livechatData = {} } = room || {};

		Object.keys(livechatData).forEach((key) => {
			const field = _.findWhere(customFields, { _id: key });
			if (field && field.visibility !== 'hidden' && field.scope === 'room') {
				fields.push({ label: field.label, value: livechatData[key] });
			}
		});

		return fields;
	},

	customVisitorFields() {
		const customFields = Template.instance().customFields.get();
		if (!customFields || customFields.length === 0) {
			return [];
		}

		const fields = [];
		const user = Template.instance().user.get();
		const { livechatData = {} } = user || {};

		Object.keys(livechatData).forEach((key) => {
			const field = _.findWhere(customFields, { _id: key });
			if (field && field.visibility !== 'hidden' && field.scope === 'visitor') {
				fields.push({ label: field.label, value: livechatData[key] });
			}
		});

		return fields;
	},

	createdAt() {
		if (!this.createdAt) {
			return '';
		}
		return moment(this.createdAt).format('L LTS');
	},

	lastLogin() {
		if (!this.lastLogin) {
			return '';
		}
		return moment(this.lastLogin).format('L LTS');
	},

	editing() {
		return Template.instance().action.get() === 'edit';
	},

	forwarding() {
		return Template.instance().action.get() === 'forward';
	},

	editDetails() {
		const instance = Template.instance();
		const user = instance.user.get();
		return {
			visitorId: user ? user._id : null,
			roomId: this.rid,
			save() {
				instance.action.set();
			},
			cancel() {
				instance.action.set();
			},
		};
	},

	forwardDetails() {
		const instance = Template.instance();
		const user = instance.user.get();
		return {
			visitorId: user ? user._id : null,
			roomId: this.rid,
			save() {
				instance.action.set();
			},
			cancel() {
				instance.action.set();
			},
		};
	},

	roomOpen() {
		const room = Template.instance().room.get();
		const uid = Meteor.userId();
		return room && room.open && ((room.servedBy && room.servedBy._id === uid) || hasRole(uid, 'livechat-manager'));
	},

	canReturnQueue() {
		const config = Template.instance().routingConfig.get();
		return config.returnQueue;
	},

	showDetail() {
		if (Template.instance().action.get()) {
			return 'hidden';
		}
	},

	canSeeButtons() {
		if (hasAtLeastOnePermission(['close-others-livechat-room', 'transfer-livechat-guest'])) {
			return true;
		}

		return isSubscribedToRoom();
	},

	canEditRoom() {
		if (hasPermission('save-others-livechat-room-info')) {
			return true;
		}

		return isSubscribedToRoom();
	},

	canCloseRoom() {
		if (hasPermission('close-others-livechat-room')) {
			return true;
		}

		return isSubscribedToRoom();
	},

	canForwardGuest() {
		return hasPermission('transfer-livechat-guest');
	},

	roomClosedDateTime() {
		const { closedAt } = this;
		return DateFormat.formatDateAndTime(closedAt);
	},

	roomClosedBy() {
		const { closedBy = {}, servedBy = {} } = this;
		let { closer } = this;

		if (closer === 'user') {
			if (servedBy._id !== closedBy._id) {
				return closedBy.username;
			}

			closer = 'agent';
		}

		const closerLabel = closer.charAt(0).toUpperCase() + closer.slice(1);
		return t(`${ closerLabel }`);
	},
});

Template.visitorInfo.events({
	'click .edit-livechat'(event, instance) {
		event.preventDefault();

		instance.action.set('edit');
	},
	'click .close-livechat'(event) {
		event.preventDefault();

		const closeRoom = (comment) => Meteor.call('livechat:closeRoom', this.rid, comment, function(error/* , result*/) {
			if (error) {
				return handleError(error);
			}
			modal.open({
				title: t('Chat_closed'),
				text: t('Chat_closed_successfully'),
				type: 'success',
				timer: 1000,
				showConfirmButton: false,
			});
		});

		if (!settings.get('Livechat_request_comment_when_closing_conversation')) {
			const comment = TAPi18n.__('Chat_closed_by_agent');
			return closeRoom(comment);
		}

		// Setting for Ask_for_conversation_finished_message is set to true
		modal.open({
			title: t('Closing_chat'),
			type: 'input',
			inputPlaceholder: t('Please_add_a_comment'),
			showCancelButton: true,
			closeOnConfirm: false,
		}, (inputValue) => {
			if (!inputValue) {
				modal.showInputError(t('Please_add_a_comment_to_close_the_room'));
				return false;
			}

			if (s.trim(inputValue) === '') {
				modal.showInputError(t('Please_add_a_comment_to_close_the_room'));
				return false;
			}

			return closeRoom(inputValue);
		});
	},

	'click .return-inquiry'(event) {
		event.preventDefault();

		modal.open({
			title: t('Would_you_like_to_return_the_inquiry'),
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('Yes'),
		}, () => {
			Meteor.call('livechat:returnAsInquiry', this.rid, function(error/* , result*/) {
				if (error) {
					handleError(error);
				} else {
					Session.set('openedRoom');
					FlowRouter.go('/home');
				}
			});
		});
	},

	'click .forward-livechat'(event, instance) {
		event.preventDefault();

		instance.action.set('forward');
	},
});

Template.visitorInfo.onCreated(function() {
	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.action = new ReactiveVar();
	this.user = new ReactiveVar();
	this.departmentId = new ReactiveVar(null);
	this.tags = new ReactiveVar(null);
	this.routingConfig = new ReactiveVar({});
	this.department = new ReactiveVar({});
	this.room = new ReactiveVar({});

	this.updateRoom = (room) => {
		this.room.set(room);
	};

	Meteor.call('livechat:getCustomFields', (err, customFields) => {
		if (customFields) {
			this.customFields.set(customFields);
		}
	});

	const { rid } = Template.currentData();
	Meteor.call('livechat:getRoutingConfig', (err, config) => {
		if (config) {
			this.routingConfig.set(config);
		}
	});

	const loadRoomData = async (rid) => {
		const { room } = await APIClient.v1.get(`rooms.info?roomId=${ rid }`);
		this.visitorId.set(room && room.v && room.v._id);
		this.departmentId.set(room && room.departmentId);
		this.tags.set(room && room.tags);
		this.room.set(room);
	};

	if (rid) {
		loadRoomData(rid);
		RoomManager.roomStream.on(rid, this.updateRoom);
	}

	this.autorun(async () => {
		if (this.departmentId.get()) {
			const { department } = await APIClient.v1.get(`livechat/department/${ this.departmentId.get() }?includeAgents=false`);
			this.department.set(department);
		}
	});

	this.autorun(async () => {
		const visitorId = this.visitorId.get();
		if (visitorId) {
			const { visitor } = await APIClient.v1.get(`livechat/visitors.info?visitorId=${ visitorId }`);
			this.user.set(visitor);
		}
	});
});

Template.visitorInfo.onDestroyed(function() {
	const { rid } = Template.currentData();
	RoomManager.roomStream.removeListener(rid, this.updateRoom);
});
