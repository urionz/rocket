function module(n,o,t){var e,i,a,c,r,d,u;t.link("meteor/meteor",{Meteor:function(n){e=n}},0),t.link("meteor/tracker",{Tracker:function(n){i=n}},1),t.link("../../../utils",{t:function(n){a=n}},2),t.link("../../../settings",{settings:function(n){c=n}},3),t.link("../../../ui-utils",{messageBox:function(n){r=n},modal:function(n){d=n}},4),t.link("../../../models",{WebdavAccounts:function(n){u=n}},5),r.actions.add("WebDAV","Add Server",{id:"add-webdav",icon:"plus",condition:function(){return c.get("Webdav_Integration_Enabled")},action:function(){d.open({title:a("Webdav_add_new_account"),content:"addWebdavAccount",showCancelButton:!1,showConfirmButton:!1,showFooter:!1,closeOnCancel:!0,html:!0,confirmOnEnter:!1})}}),e.startup((function(){i.autorun((function(){var n=u.find();if(0===n.count())return r.actions.remove("WebDAV",/webdav-upload-/gi);n.forEach((function(n){var o=n.name||n.username+"@"+n.server_url.replace(/^https?\:\/\//i,""),t=a("Upload_From",{name:o});r.actions.add("WebDAV",o,{id:"webdav-upload-"+n._id.toLowerCase(),icon:"cloud-plus",condition:function(){return c.get("Webdav_Integration_Enabled")},action:function(){d.open({data:{name:o,accountId:n._id},title:t,modifier:"modal",content:"webdavFilePicker",showCancelButton:!1,showFooter:!1,showConfirmButton:!1,closeOnCancel:!0,html:!0,confirmOnEnter:!1})}})}))}))}))}

