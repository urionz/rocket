function module(e,t,n){let s,r,i,a,o,l,c,u,d,g,p,h,f,m,S,v,y,_,b,k,C,x,T;n.link("@babel/runtime/helpers/objectWithoutProperties",{default(e){s=e}},0),n.link("@babel/runtime/helpers/objectSpread2",{default(e){r=e}},1),n.export({SettingsState:()=>O,useGroup:()=>N,useSection:()=>V,useSettingActions:()=>M,useSettingDisabledState:()=>P,useSectionChangedState:()=>Q,useSetting:()=>A}),n.link("@rocket.chat/fuselage-hooks",{useDebouncedCallback(e){i=e}},0),n.link("meteor/mongo",{Mongo(e){a=e}},1),n.link("meteor/tracker",{Tracker(e){o=e}},2),n.link("react",{default(e){l=e},createContext(e){c=e},useCallback(e){u=e},useContext(e){d=e},useEffect(e){g=e},useLayoutEffect(e){p=e},useMemo(e){h=e},useReducer(e){f=e},useRef(e){m=e},useState(e){S=e}},3),n.link("../../../../app/ui-admin/client/SettingsCachedCollection",{PrivateSettingsCachedCollection(e){v=e}},4),n.link("../../../contexts/SettingsContext",{useBatchSettingsDispatch(e){y=e}},5),n.link("../../../contexts/ToastMessagesContext",{useToastMessageDispatch(e){_=e}},6),n.link("../../../hooks/useEventCallback",{useEventCallback(e){b=e}},7),n.link("../../../hooks/useReactiveValue",{useReactiveValue(e){k=e}},8),n.link("../../../contexts/TranslationContext",{useTranslation(e){C=e},useLoadLanguage(e){x=e}},9),n.link("../../../contexts/UserContext",{useUser(e){T=e}},10);const R=c({});let E;const w=()=>E?[E,Promise.resolve()]:[E=new v,E.init()],D=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return e===t||!e&&!t?0:e>t?1:-1},L=(e,t)=>D(e.section,t.section)||D(e.sorter,t.sorter)||D(e.i18nLabel,t.i18nLabel),j=(e,t)=>{let{type:n,payload:s}=t;const{settings:i,persistedSettings:a}=e;switch(n){case"add":return{settings:[...i,...s].sort(L),persistedSettings:[...a,...s].sort(L)};case"change":{const e=e=>e._id!==s._id?e:s;return{settings:i.map(e),persistedSettings:i.map(e)}}case"remove":{const e=e=>e._id!==s;return{settings:i.filter(e),persistedSettings:a.filter(e)}}case"hydrate":{const e={};s.forEach(t=>{e[t._id]=t});const t=t=>e[t._id]?r({},t,{},e[t._id]):t;return{settings:i.map(t),persistedSettings:a}}}return e};function O(e){let{children:t}=e;const[n,r]=S(!0),[i]=S(new Set),o=m({settings:[],persistedSettings:[]}),c=u((e,t)=>{const n=j(e,t);return o.current=n,i.forEach(e=>{e(n)}),n},[j,i]),[,d]=f(c,{settings:[],persistedSettings:[]}),p=m({});g(()=>{const[e,t]=w(),n=()=>{r(!1)};t.then(n,n);const{collection:s}=e,i=new a.Collection(null);p.current={persistedSettingsCollection:s,settingsCollection:i}},[p]),g(()=>{if(n)return;const{current:{persistedSettingsCollection:e,settingsCollection:t}}=p,s=e.find(),r=s.observe({added:e=>t.insert(e),changed:e=>t.update(e._id,e),removed:e=>{let{_id:n}=e;return t.remove(n)}}),i=[];let a;const o=s.observe({added:e=>{i.push(e),clearTimeout(a),a=setTimeout(()=>{d({type:"add",payload:i})},70)},changed:e=>{d({type:"change",payload:e})},removed:e=>{let{_id:t}=e;d({type:"remove",payload:t})}});return()=>{r&&r.stop(),o&&o.stop(),clearTimeout(a)}},[n,p]);const v=m({}),y=u(e=>{let{_id:t}=e,n=s(e,["_id"]);const{current:{settingsCollection:r}}=p,{current:i}=v;clearTimeout(i[t]),i[t]=setTimeout(()=>{r.update(t,{$set:n})},70)},[p,v]),_=u(e=>{e.forEach(y),d({type:"hydrate",payload:e})},[y,d]),b=u(e=>{let{blocked:t,enableQuery:n}=e;if(t)return!0;if(!n)return!1;const{current:{settingsCollection:s}}=p,r=[].concat("string"==typeof n?JSON.parse(n):n);return!r.every(e=>!!s.findOne(e))},[p]),k=h(()=>({subscribers:i,stateRef:o,hydrate:_,isDisabled:b}),[i,o,_,b]);return l.createElement(R.Provider,{children:t,value:k})}const J=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:(e,t)=>e===t;const{subscribers:n,stateRef:s}=d(R),[r,i]=S(()=>e(s.current)),a=b((e,t,n,s)=>{const r=e(s);t(r,n)||i(r)},e,t,r);return g(()=>(n.add(a),()=>{n.delete(a)}),[a]),p(()=>{a(s.current)}),r},N=e=>{const t=J(t=>t.settings.find(t=>{let{_id:n,type:s}=t;return n===e&&"group"===s})),n=t=>t.filter(t=>{let{group:n}=t;return n===e}),s=J(e=>n(e.settings).some(e=>{let{changed:t}=e;return t})),i=J(e=>Array.from(new Set(n(e.settings).map(e=>{let{section:t}=e;return t||""}))),(e,t)=>e.length===t.length&&e.join()===t.join()),a=y(),{stateRef:o,hydrate:l}=d(R),c=_(),u=C(),g=x(),p=T(),h=b(async(e,t,n,s)=>{let{current:r}=t;const i=e(r.settings),a=i.filter(e=>{let{changed:t}=e;return t}).map(e=>{let{_id:t,value:n,editor:s}=e;return{_id:t,value:n,editor:s}});if(0!==a.length)try{if(await n(a),a.some(e=>{let{_id:t}=e;return"Language"===t})){const e=s.language||a.filter(e=>{let{_id:t}=e;return"Language"===t}).shift().value||"en";try{await g(e),c({type:"success",message:u("Settings_updated",{lng:e})})}catch(o){c({type:"error",message:o})}return}c({type:"success",message:u("Settings_updated")})}catch(o){c({type:"error",message:o})}},n,o,a,p),f=b((e,t,n)=>{let{current:s}=t;const r=e(s.settings),i=e(s.persistedSettings),a=r.filter(e=>{let{changed:t}=e;return t}).map(e=>{const{_id:t,value:n,editor:s}=i.find(t=>{let{_id:n}=t;return n===e._id});return{_id:t,value:n,editor:s,changed:!1}});n(a)},n,o,l);return t&&r({},t,{sections:i,changed:s,save:h,cancel:f})},V=(e,t)=>{t=t||"";const n=n=>n.filter(n=>{let{group:s,section:r}=n;return s===e&&(!t&&!r||t===r)}),s=J(e=>n(e.settings).some(e=>{let{value:t,packageValue:n}=e;return JSON.stringify(t)!==JSON.stringify(n)})),r=J(e=>n(e.settings).map(e=>{let{_id:t}=e;return t}),(e,t)=>e.length===t.length&&e.join()===t.join()),{stateRef:i,hydrate:a,isDisabled:l}=d(R),c=b((e,t,n)=>{let{current:s}=t;const r=e(s.settings).filter(e=>o.nonreactive(()=>!l(e))),i=e(s.persistedSettings),a=r.map(e=>{const{_id:t,value:n,packageValue:s,editor:r}=i.find(t=>{let{_id:n}=t;return n===e._id});return{_id:t,value:s,editor:r,changed:s!==n}});n(a)},n,i,a);return{name:t,canReset:s,settings:r,reset:c}},M=e=>{const{hydrate:t}=d(R),n=i(n=>{let{value:s=e.value,editor:r=e.editor}=n;const i=[{_id:e._id,value:s,editor:r,changed:s!==e.value||r!==e.editor}];t(i)},70,[t,e]),s=i(()=>{const{_id:n,value:s,packageValue:r,editor:i}=e,a=[{_id:n,value:r,editor:i,changed:JSON.stringify(r)!==JSON.stringify(s)}];t(a)},70,[t,e]);return{update:n,reset:s}},P=e=>{let{blocked:t,enableQuery:n}=e;const{isDisabled:s}=d(R);return k(()=>s({blocked:t,enableQuery:n}),[t,n])},Q=(e,t)=>J(n=>n.settings.some(n=>{let{group:s,section:r,changed:i}=n;return s===e&&(!t&&!r||t===r)&&i})),A=e=>{const t=t=>t.find(t=>t._id===e),n=J(e=>t(e.settings)),s=J(e=>t(e.persistedSettings)),{update:i,reset:a}=M(s),o=P(s);return r({},n,{disabled:o,update:i,reset:a})}}

