function module(t,o,n){let a,c;n.export({formatNumber:()=>r,formatMemorySize:()=>e,formatDate:()=>l,formatHumanReadableTime:()=>u,formatCPULoad:()=>m}),n.link("moment",{default(t){a=t}},0),n.link("underscore.string",{default(t){c=t}},1);const r=t=>c.numberFormat(t,2),e=t=>{if("number"!=typeof t)return null;const o=["bytes","kB","MB","GB"];let n;for(n=0;n<o.length-1;++n){const o=Math.pow(1024,n+1);if(t<o)break}const a=Math.pow(1024,n),r=0===n?0:2;return"".concat(c.numberFormat(t/a,r)," ").concat(o[n])},l=t=>t?a(t).format("LLL"):null,u=(t,o)=>{const n=Math.floor(t/86400),a=Math.floor(t%86400/3600),c=Math.floor(t%86400%3600/60),r=Math.floor(t%86400%3600%60);let e="";return n>0&&(e+="".concat(n," ").concat(o("days"),", ")),a>0&&(e+="".concat(a," ").concat(o("hours"),", ")),c>0&&(e+="".concat(c," ").concat(o("minutes"),", ")),r>0&&(e+="".concat(r," ").concat(o("seconds"))),e},m=t=>{if(!t)return null;const[o,n,a]=t;return"".concat(r(o),", ").concat(r(n),", ").concat(r(a))}}
