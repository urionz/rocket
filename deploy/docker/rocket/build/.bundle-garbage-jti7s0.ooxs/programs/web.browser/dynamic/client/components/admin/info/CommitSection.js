function module(t,e,a){let n,l,r,c;function i(t){let{info:e}=t;const a=r(),{commit:i={}}=e;return l.createElement(l.Fragment,null,l.createElement(n,{"data-qa":"commit-title"},a("Commit")),l.createElement(c,{"data-qa":"commit-list"},l.createElement(c.Entry,{label:a("Hash")},i.hash),l.createElement(c.Entry,{label:a("Date")},i.date),l.createElement(c.Entry,{label:a("Branch")},i.branch),l.createElement(c.Entry,{label:a("Tag")},i.tag),l.createElement(c.Entry,{label:a("Author")},i.author),l.createElement(c.Entry,{label:a("Subject")},i.subject)))}a.export({CommitSection:()=>i}),a.link("@rocket.chat/fuselage",{Subtitle(t){n=t}},0),a.link("react",{default(t){l=t}},1),a.link("../../../contexts/TranslationContext",{useTranslation(t){r=t}},2),a.link("./DescriptionList",{DescriptionList(t){c=t}},3)}
