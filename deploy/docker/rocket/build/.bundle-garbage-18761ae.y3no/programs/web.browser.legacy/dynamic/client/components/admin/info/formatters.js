function module(r,n,t){var o,u,e;t.link("@babel/runtime/helpers/slicedToArray",{default:function(r){o=r}},0),t.export({formatNumber:function(){return a},formatMemorySize:function(){return f},formatDate:function(){return i},formatHumanReadableTime:function(){return l},formatCPULoad:function(){return m}}),t.link("moment",{default:function(r){u=r}},0),t.link("underscore.string",{default:function(r){e=r}},1);var a=function(r){return e.numberFormat(r,2)},f=function(r){if("number"!=typeof r)return null;var n=["bytes","kB","MB","GB"],t;for(t=0;t<n.length-1;++t){var o;if(r<Math.pow(1024,t+1))break}var u=Math.pow(1024,t),a=0===t?0:2;return e.numberFormat(r/u,a)+" "+n[t]},i=function(r){return r?u(r).format("LLL"):null},l=function(r,n){var t=Math.floor(r/86400),o=Math.floor(r%86400/3600),u=Math.floor(r%86400%3600/60),e=Math.floor(r%86400%3600%60),a="";return t>0&&(a+=t+" "+n("days")+", "),o>0&&(a+=o+" "+n("hours")+", "),u>0&&(a+=u+" "+n("minutes")+", "),e>0&&(a+=e+" "+n("seconds")),a},m=function(r){if(!r)return null;var n=o(r,3),t=n[0],u=n[1],e=n[2];return a(t)+", "+a(u)+", "+a(e)}}

