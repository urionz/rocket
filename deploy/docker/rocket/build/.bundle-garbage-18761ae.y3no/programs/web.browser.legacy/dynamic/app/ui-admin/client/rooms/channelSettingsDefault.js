function module(t,e,n){var i,c,a,o,u,r,s;n.link("meteor/meteor",{Meteor:function(t){i=t}},0),n.link("meteor/reactive-var",{ReactiveVar:function(t){c=t}},1),n.link("meteor/templating",{Template:function(t){a=t}},2),n.link("meteor/rocketchat:tap-i18n",{TAPi18n:function(t){o=t}},3),n.link("toastr",{default:function(t){u=t}},4),n.link("../../../utils",{t:function(t){r=t},handleError:function(t){s=t}},5),a.channelSettingsDefault.helpers({canMakeDefault:function(){var t=a.instance().room.get();return t&&"c"===t.t},editing:function(t){return a.instance().editing.get()===t},roomDefault:function(){var t=a.instance().room.get();if(t)return t.default},defaultDescription:function(){var t=a.instance().room.get();return t&&t.default?r("True"):r("False")}}),a.channelSettingsDefault.events({"click [data-edit]":function(t,e){t.preventDefault(),e.editing.set($(t.currentTarget).data("edit")),setTimeout((function(){e.$("input.editing").focus().select()}),100)},"click .cancel":function(t,e){t.preventDefault(),e.editing.set()},"click .save":function(t,e){t.preventDefault(),i.call("saveRoomSettings",a.instance().room.get()._id,"default",$("input[name=default]:checked").val(),(function(t){if(t)return s(t);u.success(o.__("Room_type_changed_successfully"))})),e.onSuccess(),e.editing.set()}}),a.channelSettingsDefault.onCreated((function(){var t=this;this.editing=new c,this.room=new c,this.onSuccess=a.currentData().onSuccess,this.autorun((function(){var e,n=a.currentData().room;t.room.set(n)}))}))}

