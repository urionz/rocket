function module(e,t,i){let l,a,o,r,n,s,m,c;i.link("meteor/meteor",{Meteor(e){l=e}},0),i.link("meteor/reactive-var",{ReactiveVar(e){a=e}},1),i.link("meteor/kadira:flow-router",{FlowRouter(e){o=e}},2),i.link("meteor/templating",{Template(e){r=e}},3),i.link("toastr",{default(e){n=e}},4),i.link("../../../../utils",{t(e){s=e},handleError(e){m=e}},5),i.link("./livechatCustomFieldForm.html"),i.link("../../../../utils/client",{APIClient(e){c=e}},6),r.livechatCustomFieldForm.helpers({customField:()=>r.instance().customField.get()}),r.livechatCustomFieldForm.events({"submit #customField-form"(e,t){e.preventDefault();const i=t.$("button.save"),a=$(e.currentTarget).data("id"),r=t.$("input[name=field]").val(),c=t.$("input[name=label]").val(),u=t.$("select[name=scope]").val(),d=t.$("select[name=visibility]").val(),v=t.$("input[name=regexp]").val();if(!/^[0-9a-zA-Z-_]+$/.test(r))return n.error(s("error-invalid-custom-field-name"));if(""===c.trim())return n.error(s("Please_fill_a_label"));const f=i.html();i.html(s("Saving"));const h={field:r,label:c,scope:u.trim(),visibility:d.trim(),regexp:v.trim()};l.call("livechat:saveCustomField",a,h,(function(e){if(i.html(f),e)return m(e);n.success(s("Saved")),o.go("livechat-customfields")}))},"click button.back"(e){e.preventDefault(),o.go("livechat-customfields")}}),r.livechatCustomFieldForm.onCreated((async function(){this.customField=new a({});const{customField:e}=await c.v1.get("livechat/custom-fields/".concat(o.getParam("_id")));e&&this.customField.set(e)}))}
