function module(e,t,n){let l,a,o,r,i,c,d,u,m,s;function p(e){let{_id:t,label:n,value:p,editor:g,allowedTypes:E,placeholder:C,readonly:h,autocomplete:f,disabled:v,hasResetButton:x,onChangeValue:k,onChangeEditor:y,onResetButtonClick:b}=e;const B=m(),T=e=>{k&&k(e.currentTarget.value)},I=e=>{const t=e.currentTarget.value.trim();y&&y(t)};return u.createElement(u.Fragment,null,u.createElement(o.Container,null,u.createElement(l,null,u.createElement(a.Label,{htmlFor:t,title:t},n),x&&u.createElement(s,{"data-qa-reset-setting-id":t,onClick:b}))),u.createElement(i,{inline:"x4"},u.createElement(a.Row,null,u.createElement(i,{inline:"x4"},u.createElement(o.Item,{grow:2},"color"===g&&u.createElement(r,{"data-qa-setting-id":t,type:"color",id:t,value:p,placeholder:C,disabled:v,readOnly:h,autoComplete:!1===f?"off":void 0,onChange:T}),"expression"===g&&u.createElement(d,{"data-qa-setting-id":t,id:t,value:p,placeholder:C,disabled:v,readOnly:h,autoComplete:!1===f?"off":void 0,onChange:T})),u.createElement(c,{"data-qa-setting-id":"".concat(t,"_editor"),type:"color",id:"".concat(t,"_editor"),value:g,disabled:v,readOnly:h,autoComplete:!1===f?"off":void 0,onChange:I},E&&E.map(e=>u.createElement(c.Option,{key:e,value:e},B(e))))))),u.createElement(a.Hint,null,"Variable name: ",t.replace(/theme-color-/,"@")))}n.export({ColorSettingInput:()=>p}),n.link("@rocket.chat/fuselage",{Box(e){l=e},Field(e){a=e},Flex(e){o=e},InputBox(e){r=e},Margins(e){i=e},SelectInput(e){c=e},TextInput(e){d=e}},0),n.link("react",{default(e){u=e}},1),n.link("../../../../contexts/TranslationContext",{useTranslation(e){m=e}},2),n.link("../ResetSettingButton",{ResetSettingButton(e){s=e}},3)}
