function module(t,e,n){let c,a,i;n.link("meteor/templating",{Template(t){c=t}},0),n.link("underscore.string",{default(t){a=t}},1),n.link("../../../../settings",{settings(t){i=t}},2),n.link("./livechatInstallation.html"),c.livechatInstallation.helpers({script(){const t=a.rtrim(i.get("Site_Url"),"/");return'\x3c!-- Start of Rocket.Chat Livechat Script --\x3e\n<script type="text/javascript">\n(function(w, d, s, u) {\n\tw.RocketChat = function(c) { w.RocketChat._.push(c) }; w.RocketChat._ = []; w.RocketChat.url = u;\n\tvar h = d.getElementsByTagName(s)[0], j = d.createElement(s);\n\tj.async = true; j.src = \''.concat(t,"/livechat/rocketchat-livechat.min.js?_=201903270000';\n\th.parentNode.insertBefore(j, h);\n})(window, document, 'script', '").concat(t,"/livechat');\n<\/script>\n\x3c!-- End of Rocket.Chat Livechat Script --\x3e")}})}
