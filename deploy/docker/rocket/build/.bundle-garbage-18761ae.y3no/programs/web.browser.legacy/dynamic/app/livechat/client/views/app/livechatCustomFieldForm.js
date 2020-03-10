function module(e,t,i){var n,l,r,a,o,u,c,s,m;i.link("@babel/runtime/regenerator",{default:function(e){n=e}},0),i.link("meteor/meteor",{Meteor:function(e){l=e}},0),i.link("meteor/reactive-var",{ReactiveVar:function(e){r=e}},1),i.link("meteor/kadira:flow-router",{FlowRouter:function(e){a=e}},2),i.link("meteor/templating",{Template:function(e){o=e}},3),i.link("toastr",{default:function(e){u=e}},4),i.link("../../../../utils",{t:function(e){c=e},handleError:function(e){s=e}},5),i.link("./livechatCustomFieldForm.html"),i.link("../../../../utils/client",{APIClient:function(e){m=e}},6),o.livechatCustomFieldForm.helpers({customField:function(){return o.instance().customField.get()}}),o.livechatCustomFieldForm.events({"submit #customField-form":function(e,t){e.preventDefault();var i=t.$("button.save"),n=$(e.currentTarget).data("id"),r=t.$("input[name=field]").val(),o=t.$("input[name=label]").val(),m=t.$("select[name=scope]").val(),f=t.$("select[name=visibility]").val(),v=t.$("input[name=regexp]").val();if(!/^[0-9a-zA-Z-_]+$/.test(r))return u.error(c("error-invalid-custom-field-name"));if(""===o.trim())return u.error(c("Please_fill_a_label"));var d=i.html();i.html(c("Saving"));var h={field:r,label:o,scope:m.trim(),visibility:f.trim(),regexp:v.trim()};l.call("livechat:saveCustomField",n,h,(function(e){if(i.html(d),e)return s(e);u.success(c("Saved")),a.go("livechat-customfields")}))},"click button.back":function(e){e.preventDefault(),a.go("livechat-customfields")}}),o.livechatCustomFieldForm.onCreated(function(){function e(){var e,t;return n.async(function(){function i(i){for(;;)switch(i.prev=i.next){case 0:return this.customField=new r({}),i.next=3,n.awrap(m.v1.get("livechat/custom-fields/"+a.getParam("_id")));case 3:e=i.sent,(t=e.customField)&&this.customField.set(t);case 6:case"end":return i.stop()}}return i}(),null,this)}return e}())}
