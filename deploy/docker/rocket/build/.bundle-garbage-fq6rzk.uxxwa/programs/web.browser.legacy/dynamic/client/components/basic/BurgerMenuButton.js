function module(e,n,r){var t,u,a,o,i,l;r.link("@babel/runtime/helpers/slicedToArray",{default:function(e){t=e}},0),r.export({BurgerMenuButton:function(){return c}}),r.link("@rocket.chat/fuselage",{Box:function(e){u=e}},0),r.link("react",{default:function(e){a=e}},1),r.link("./BurgerMenuButton.css"),r.link("../../contexts/SessionContext",{useSession:function(e){o=e}},2),r.link("../../contexts/SidebarContext",{useSidebar:function(e){i=e}},3),r.link("../../hooks/useEmbeddedLayout",{useEmbeddedLayout:function(e){l=e}},4);var c=function(){var e=i(),n=t(e,2),r=n[0],c=n[1],s=l(),d=o("unread"),m=function(){c(!r)};return a.createElement(u,{is:"button","aria-label":r?"Close menu":"Open menu",className:["rc-old","burger",!!r&&"menu-opened"].filter(Boolean).join(" "),type:"button",onClick:m},a.createElement(u,{is:"i",className:"burger__line","aria-hidden":"true"}),a.createElement(u,{is:"i",className:"burger__line","aria-hidden":"true"}),a.createElement(u,{is:"i",className:"burger__line","aria-hidden":"true"}),!s&&d&&a.createElement(u,{className:"unread-burger-alert color-error-contrast background-error-color"},d))}}
