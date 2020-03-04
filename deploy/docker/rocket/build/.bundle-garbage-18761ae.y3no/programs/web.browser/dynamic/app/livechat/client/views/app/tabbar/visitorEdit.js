function module(t,e,a){let i,s,n,r,o,l,c;a.link("meteor/meteor",{Meteor(t){i=t}},0),a.link("meteor/reactive-var",{ReactiveVar(t){s=t}},1),a.link("meteor/templating",{Template(t){n=t}},2),a.link("toastr",{default(t){r=t}},3),a.link("../../../../../utils",{t(t){o=t}},4),a.link("../../../../../authorization",{hasRole(t){l=t}},5),a.link("./visitorEdit.html"),a.link("../../../../../utils/client",{APIClient(t){c=t}},6);const g=100;n.visitorEdit.helpers({visitor:()=>n.instance().visitor.get(),visitorCustomFields(){const t=n.instance().customFields.get();if(!t||0===t.length)return[];const e=[],a=n.instance().visitor.get(),{livechatData:i={}}=a||{};return t.forEach(t=>{if("hidden"!==t.visibility&&"visitor"===t.scope){const a=i[t._id]?i[t._id]:"";e.push({name:t._id,label:t.label,value:a})}}),e},room:()=>n.instance().room.get(),roomCustomFields(){const t=n.instance().customFields.get();if(!t||0===t.length)return[];const e=[],a=n.instance().room.get(),{livechatData:i={}}=a||{};return t.forEach(t=>{if("hidden"!==t.visibility&&"room"===t.scope){const a=i[t._id]?i[t._id]:"";e.push({name:t._id,label:t.label,value:a})}}),e},email(){const t=n.instance().visitor.get();if(t.visitorEmails&&t.visitorEmails.length>0)return t.visitorEmails[0].address},phone(){const t=n.instance().visitor.get();if(t.phone&&t.phone.length>0)return t.phone[0].phoneNumber},tags:()=>n.instance().tags.get(),availableUserTags:()=>n.instance().availableUserTags.get(),hasAvailableTags(){const t=n.instance().availableTags.get();return t&&t.length>0},canRemoveTag:(t,e)=>l(i.userId(),["admin","livechat-manager"])||Array.isArray(t)&&(0===t.length||t.indexOf(e)>-1),isSmsIntegration(){const t=n.instance().room.get();return!(!t||!t.sms)}}),n.visitorEdit.onCreated((async function(){this.visitor=new s,this.room=new s,this.tags=new s([]),this.availableTags=new s([]),this.agentDepartments=new s([]),this.availableUserTags=new s([]),this.customFields=new s([]),this.autorun(async()=>{const{visitorId:t}=n.currentData();if(t){const{visitor:e}=await c.v1.get("livechat/visitors.info?visitorId=".concat(t));this.visitor.set(e)}});const t=n.currentData().roomId;this.autorun(async()=>{const{room:e}=await c.v1.get("rooms.info?roomId=".concat(t)),{customFields:a}=await c.v1.get("livechat/custom-fields?count=".concat(100));this.room.set(e),this.tags.set(e&&e.tags||[]),this.customFields.set(a||[])});const e=i.userId(),{departments:a}=await c.v1.get("livechat/agents/".concat(e,"/departments")),r=a.map(t=>t.departmentId);this.agentDepartments.set(r),i.call("livechat:getTagsList",(t,a)=>{this.availableTags.set(a);const i=this.agentDepartments.get(),s=l(e,["admin","livechat-manager"]),n=this.availableTags.get()||[],r=n.filter(t=>{let{departments:e}=t;return s||0===e.length||e.some(t=>i.indexOf(t)>-1)}).map(t=>{let{name:e}=t;return e});this.availableUserTags.set(r)})})),n.visitorEdit.events({"submit form"(t,e){t.preventDefault();const a={_id:e.visitor.get()._id},s=e.room.get(),{_id:n,sms:l}=s,c={_id:n};a.name=t.currentTarget.elements.name.value,a.email=t.currentTarget.elements.email.value,a.phone=t.currentTarget.elements.phone.value,a.livechatData={},$("[data-visitorLivechatData=true]").each((function(){a.livechatData[this.name]=$(this).val()||""})),c.topic=t.currentTarget.elements.topic.value,c.tags=e.tags.get(),c.livechatData={},$("[data-roomLivechatData=true]").each((function(){c.livechatData[this.name]=$(this).val()||""})),l&&delete a.phone,i.call("livechat:saveInfo",a,c,t=>{t?r.error(o(t.error)):(r.success(o("Saved")),this.save())})},"click .remove-tag"(t,e){const a=this.valueOf(),s=e.availableTags.get(),n=s&&s.length>0,r=e.availableUserTags.get();if(!l(i.userId(),["admin","livechat-manager"])&&n&&(!r||-1===r.indexOf(a)))return;t.stopPropagation(),t.preventDefault();let o=e.tags.get();o=o.filter(t=>t!==a),e.tags.set(o)},"click #addTag"(t,e){if(t.stopPropagation(),t.preventDefault(),$("#tagSelect").find(":selected").is(":disabled"))return;const a=[...e.tags.get()],i=$("#tagSelect").val();""===i||a.indexOf(i)>-1||(a.push(i),e.tags.set(a),$("#tagSelect").val("placeholder"))},"keydown #tagInput"(t,e){if(13===t.which){t.stopPropagation(),t.preventDefault();const a=[...e.tags.get()],i=$("#tagInput").val();if(""===i||a.indexOf(i)>-1)return;a.push(i),e.tags.set(a),$("#tagInput").val("")}},"click .cancel"(){this.cancel()}})}

