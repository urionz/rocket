function module(e,t,n){var a,l,r,c,i,o,u,m,s,f,d;function E(e){var t=e.children,n=e.headerButtons,o=e.save,f=e.cancel,E=e._id,p=e.i18nLabel,h=e.i18nDescription,g=e.changed,k=s(),v=function(e){e.preventDefault(),o()},S=function(e){e.preventDefault(),f()},x=function(e){e.preventDefault(),o()};return E?u.createElement(d,{is:"form",action:"#",method:"post",onSubmit:v},u.createElement(d.Header,{title:k(p)},u.createElement(c,null,g&&u.createElement(r,{danger:!0,primary:!0,type:"reset",onClick:S},k("Cancel")),u.createElement(r,{children:k("Save_changes"),className:"save",disabled:!g,primary:!0,type:"submit",onClick:x}),n)),u.createElement(d.Content,null,u.createElement(l,{style:m((function(){return{margin:"0 auto",width:"100%",maxWidth:"590px"}}),[])},k.has(h)&&u.createElement(i,{hintColor:!0},k(h)),u.createElement(a,{className:"page-settings"},t)))):u.createElement(d,null,u.createElement(d.Header,null),u.createElement(d.Content,null))}function p(){var e=s();return u.createElement(d,null,u.createElement(d.Header,{title:u.createElement(o,{style:{width:"20rem"}})},u.createElement(c,null,u.createElement(r,{children:e("Save_changes"),disabled:!0,primary:!0}))),u.createElement(d.Content,null,u.createElement(l,{style:m((function(){return{margin:"0 auto",width:"100%",maxWidth:"590px"}}),[])},u.createElement(i.Skeleton,null),u.createElement(a,{className:"page-settings"},u.createElement(f.Skeleton,null)))))}n.export({GroupPage:function(){return E},GroupPageSkeleton:function(){return p}}),n.link("@rocket.chat/fuselage",{Accordion:function(e){a=e},Box:function(e){l=e},Button:function(e){r=e},ButtonGroup:function(e){c=e},Paragraph:function(e){i=e},Skeleton:function(e){o=e}},0),n.link("react",{default:function(e){u=e},useMemo:function(e){m=e}},1),n.link("../../../contexts/TranslationContext",{useTranslation:function(e){s=e}},2),n.link("./Section",{Section:function(e){f=e}},3),n.link("../../basic/Page",{Page:function(e){d=e}},4),E.Skeleton=p}

