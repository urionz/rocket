function module(t,n,i){let o,r,e,a,g;async function l(t,n){if(!t)return;const i={integrationId:t};if(!a("manage-outgoing-integrations")){if(!a("manage-own-outgoing-integrations"))return e.error(o.__("No_integration_found")),void r.go("admin-integrations");i.createdBy=n}try{const{integration:t}=await g.v1.get("integrations.get",i);return t}catch(l){e.error(o.__("Error")),console.error(l)}}i.export({getIntegration:()=>l}),i.link("meteor/rocketchat:tap-i18n",{TAPi18n(t){o=t}},0),i.link("meteor/kadira:flow-router",{FlowRouter(t){r=t}},1),i.link("toastr",{default(t){e=t}},2),i.link("../../authorization/client",{hasAllPermission(t){a=t}},3),i.link("../../utils/client",{APIClient(t){g=t}},4)}
