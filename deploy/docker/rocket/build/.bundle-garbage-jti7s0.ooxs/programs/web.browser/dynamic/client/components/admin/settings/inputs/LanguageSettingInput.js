function module(e,t,n){let l,a,o,u,r,i,c;function d(e){let{_id:t,label:n,value:d,placeholder:s,readonly:m,autocomplete:g,disabled:k,hasResetButton:p,onChangeValue:E,onResetButtonClick:h}=e;const C=i(),f=e=>{E(e.currentTarget.value)};return r.createElement(r.Fragment,null,r.createElement(o.Container,null,r.createElement(l,null,r.createElement(a.Label,{htmlFor:t,title:t},n),p&&r.createElement(c,{"data-qa-reset-setting-id":t,onClick:h}))),r.createElement(a.Row,null,r.createElement(u,{"data-qa-setting-id":t,id:t,value:d,placeholder:s,disabled:k,readOnly:m,autoComplete:!1===g?"off":void 0,onChange:f},C.map(e=>{let{key:t,name:n}=e;return r.createElement(u.Option,{key:t,value:t,dir:"auto"},n)}))))}n.export({LanguageSettingInput:()=>d}),n.link("@rocket.chat/fuselage",{Box(e){l=e},Field(e){a=e},Flex(e){o=e},SelectInput(e){u=e}},0),n.link("react",{default(e){r=e}},1),n.link("../../../../contexts/TranslationContext",{useLanguages(e){i=e}},2),n.link("../ResetSettingButton",{ResetSettingButton(e){c=e}},3)}
