function module(n,o,e){e.export({downloadJsonAsAFile:function(){return t}});var t=function(n){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"jsonfile",e=o+".json",t="application/json;charset=utf-8;";if(window.navigator&&window.navigator.msSaveOrOpenBlob){var a=new Blob([decodeURIComponent(encodeURI(JSON.stringify(n)))],{type:t});return navigator.msSaveOrOpenBlob(a,e)}var d=document.createElement("a");d.download=e,d.href="data:"+t+","+encodeURIComponent(JSON.stringify(n)),d.target="_blank",document.body.appendChild(d),d.click(),document.body.removeChild(d)}}
