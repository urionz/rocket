function module(e,n,t){var u,r,o,i,a,c;function l(e){var n=e.groupId,t=c(n);return t?"Assets"===n?u.createElement(r,t):"OAuth"===n?u.createElement(o,t):u.createElement(i,t):u.createElement(a.Skeleton,null)}t.export({GroupSelector:function(){return l}}),t.link("react",{default:function(e){u=e}},0),t.link("./groups/AssetsGroupPage",{AssetsGroupPage:function(e){r=e}},1),t.link("./groups/OAuthGroupPage",{OAuthGroupPage:function(e){o=e}},2),t.link("./groups/GenericGroupPage",{GenericGroupPage:function(e){i=e}},3),t.link("./GroupPage",{GroupPage:function(e){a=e}},4),t.link("./SettingsState",{useGroup:function(e){c=e}},5)}
