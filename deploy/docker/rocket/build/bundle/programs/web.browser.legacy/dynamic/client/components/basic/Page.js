function module(e,t,n){var r,l,i,u,c,o,a,f,m;function d(e){return a.createElement(u.Container,{direction:"column"},a.createElement(i,l({is:"section",style:f((function(){return{height:"100%"}}),[])},e)))}function s(e){var t=e.children,n=e.title,o=r(e,["children","title"]);return a.createElement(c,{all:"x16"},a.createElement(u.Container,{wrap:"nowrap",alignItems:"center"},a.createElement(i,l({style:{minHeight:"2.75rem"}},o),a.createElement(c,{inlineEnd:"x8"},a.createElement(m,null)),a.createElement(u.Item,{grow:"1"},a.createElement(i,{is:"h1",textStyle:"h1",textColor:"default"},n)),t)))}function g(e){return a.createElement(o,null,a.createElement(i,l({style:f((function(){return{padding:"1rem"}}),[])},e)))}n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){r=e}},0),n.link("@babel/runtime/helpers/extends",{default:function(e){l=e}},1),n.export({Page:function(){return d},PageHeader:function(){return s},PageContent:function(){return g}}),n.link("@rocket.chat/fuselage",{Box:function(e){i=e},Flex:function(e){u=e},Margins:function(e){c=e},Scrollable:function(e){o=e}},0),n.link("react",{default:function(e){a=e},useMemo:function(e){f=e}},1),n.link("./BurgerMenuButton",{BurgerMenuButton:function(e){m=e}},2),d.Header=s,d.Content=g}

