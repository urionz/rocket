function module(e,t,n){let i,a,c,r,s,o,l;n.link("meteor/meteor",{Meteor(e){i=e}},0),n.link("meteor/reactive-var",{ReactiveVar(e){a=e}},1),n.link("meteor/templating",{Template(e){c=e}},2),n.link("meteor/rocketchat:tap-i18n",{TAPi18n(e){r=e}},3),n.link("toastr",{default(e){s=e}},4),n.link("../../../utils",{t(e){o=e},handleError(e){l=e}},5),c.channelSettingsDefault.helpers({canMakeDefault(){const e=c.instance().room.get();return e&&"c"===e.t},editing:e=>c.instance().editing.get()===e,roomDefault(){const e=c.instance().room.get();if(e)return e.default},defaultDescription(){const e=c.instance().room.get();return e&&e.default?o("True"):o("False")}}),c.channelSettingsDefault.events({"click [data-edit]"(e,t){e.preventDefault(),t.editing.set($(e.currentTarget).data("edit")),setTimeout(()=>{t.$("input.editing").focus().select()},100)},"click .cancel"(e,t){e.preventDefault(),t.editing.set()},"click .save"(e,t){e.preventDefault(),i.call("saveRoomSettings",c.instance().room.get()._id,"default",$("input[name=default]:checked").val(),e=>{if(e)return l(e);s.success(r.__("Room_type_changed_successfully"))}),t.onSuccess(),t.editing.set()}}),c.channelSettingsDefault.onCreated((function(){this.editing=new a,this.room=new a,this.onSuccess=c.currentData().onSuccess,this.autorun(()=>{const{room:e}=c.currentData();this.room.set(e)})}))}

