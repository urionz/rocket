function module(e,t,n){var o,r,l,a,c,i,u,m,f,s,d,p;function h(e){var t=e._id,n=e.label,h=e.value,v=e.placeholder,k=e.readonly,E=e.autocomplete,g=e.disabled,b=e.hasResetButton,C=e.onChangeValue,y=e.onResetButtonClick;h=h||[];var _=f(),B=f(h),R=function(e){return function(){C(h.filter((function(t){var n;return t._id!==e})))}};return d((function(){B.current=h})),s((function(){var e=i.renderWithData(u.inputAutocomplete,{id:t,name:t,class:"search autocomplete rc-input__element",autocomplete:!1===E?"off":void 0,readOnly:k,placeholder:v,disabled:g,settings:{limit:10,rules:[{collection:"CachedChannelList",endpoint:"rooms.autocomplete.channelAndPrivate",field:"name",template:u.roomSearch,noMatchTemplate:u.roomSearchEmpty,matchAll:!0,selector:function(e){return{name:e}},sort:"name"}]}},_.current);return $(".autocomplete",_.current).on("autocompleteselect",(function(e,t){var n=B.current;C([].concat(o(n.filter((function(e){var n;return e._id!==t._id}))),[t])),e.currentTarget.value="",e.currentTarget.focus()})),function(){i.remove(e)}}),[B]),m.createElement(m.Fragment,null,m.createElement(a.Container,null,m.createElement(r,null,m.createElement(l.Label,{htmlFor:t,title:t},n),b&&m.createElement(p,{"data-qa-reset-setting-id":t,onClick:y}))),m.createElement("div",{style:{position:"relative"},ref:_}),m.createElement("ul",{className:"selected-rooms"},h.map((function(e){var t=e._id,n=e.name;return m.createElement("li",{key:t,className:"remove-room",onClick:R(t)},n," ",m.createElement(c,{name:"cross"}))}))))}n.link("@babel/runtime/helpers/toConsumableArray",{default:function(e){o=e}},0),n.export({RoomPickSettingInput:function(){return h}}),n.link("@rocket.chat/fuselage",{Box:function(e){r=e},Field:function(e){l=e},Flex:function(e){a=e},Icon:function(e){c=e}},0),n.link("meteor/blaze",{Blaze:function(e){i=e}},1),n.link("meteor/templating",{Template:function(e){u=e}},2),n.link("react",{default:function(e){m=e},useRef:function(e){f=e},useEffect:function(e){s=e},useLayoutEffect:function(e){d=e}},3),n.link("../ResetSettingButton",{ResetSettingButton:function(e){p=e}},4)}
