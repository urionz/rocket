function module(n,o,e){e.export({downloadJsonAsAFile:()=>t});const t=function(n){let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"jsonfile";const e="".concat(o,".json"),t="application/json;charset=utf-8;";if(window.navigator&&window.navigator.msSaveOrOpenBlob){const o=new Blob([decodeURIComponent(encodeURI(JSON.stringify(n)))],{type:t});return navigator.msSaveOrOpenBlob(o,e)}const a=document.createElement("a");a.download=e,a.href="data:".concat(t,",").concat(encodeURIComponent(JSON.stringify(n))),a.target="_blank",document.body.appendChild(a),a.click(),document.body.removeChild(a)}}

