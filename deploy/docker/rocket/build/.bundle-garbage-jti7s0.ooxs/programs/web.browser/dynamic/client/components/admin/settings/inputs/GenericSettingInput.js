function module(e,t,l){let n,a,o,r,i,u;function c(e){let{_id:t,label:l,value:c,placeholder:d,readonly:m,autocomplete:s,disabled:g,hasResetButton:h,onChangeValue:p,onResetButtonClick:E}=e;const f=e=>{p&&p(e.currentTarget.value)};return i.createElement(i.Fragment,null,i.createElement(o.Container,null,i.createElement(n,null,i.createElement(a.Label,{htmlFor:t,title:t},l),h&&i.createElement(u,{"data-qa-reset-setting-id":t,onClick:E}))),i.createElement(a.Row,null,i.createElement(r,{"data-qa-setting-id":t,id:t,value:c,placeholder:d,disabled:g,readOnly:m,autoComplete:!1===s?"off":void 0,onChange:f})))}l.export({GenericSettingInput:()=>c}),l.link("@rocket.chat/fuselage",{Box(e){n=e},Field(e){a=e},Flex(e){o=e},TextInput(e){r=e}},0),l.link("react",{default(e){i=e}},1),l.link("../ResetSettingButton",{ResetSettingButton(e){u=e}},2)}
