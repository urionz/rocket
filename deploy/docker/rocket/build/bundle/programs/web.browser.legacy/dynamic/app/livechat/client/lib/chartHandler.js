function module(t,e,n){var a,r;n.link("@babel/runtime/regenerator",{default:function(t){a=t}},0),n.export({drawLineChart:function(){return s},drawDoughnutChart:function(){return u},updateChart:function(){return d}}),n.link("meteor/rocketchat:tap-i18n",{TAPi18n:function(t){r=t}},0);var o=function(t){var e=t.legends,n=void 0!==e&&e,a=t.anim,r=void 0!==a&&a,o=t.smallTicks,i=void 0!==o&&o,s={layout:{padding:{top:10,bottom:0}},legend:{display:!1},title:{display:!1},tooltips:{enabled:!0,mode:"point",displayColors:!1},scales:{xAxes:[{scaleLabel:{display:!1},gridLines:{display:!0,color:"rgba(0, 0, 0, 0.03)"}}],yAxes:[{scaleLabel:{display:!1},gridLines:{display:!0,color:"rgba(0, 0, 0, 0.03)"},ticks:{beginAtZero:!0}}]},hover:{animationDuration:0},responsive:!0,maintainAspectRatio:!1,responsiveAnimationDuration:0};return r||(s.animation={duration:0}),n&&(s.legend={display:!0,labels:{boxWidth:20,fontSize:8}}),i&&(s.scales.xAxes[0].ticks={fontSize:8},s.scales.yAxes[0].ticks={beginAtZero:!0,fontSize:8}),s},i=function(t){return{layout:{padding:{top:0,bottom:0}},legend:{display:!0,position:"right",labels:{boxWidth:20,fontSize:8}},title:{display:"true",text:t},tooltips:{enabled:!0,mode:"point",displayColors:!1},hover:{animationDuration:0},responsive:!0,maintainAspectRatio:!1,responsiveAnimationDuration:0}},s=function(){function t(t,e,i,s,u){var d,c,l,p,f,b=arguments;return a.async(function(){function h(h){for(;;)switch(h.prev=h.next){case 0:if(d=b.length>5&&void 0!==b[5]?b[5]:{},t){h.next=4;break}return console.log("No chart element"),h.abrupt("return");case 4:return e&&e.destroy(),c=["#2de0a5","#ffd21f","#f5455c","#cbced1"],l=[],i.forEach((function(t,e){l.push({label:r.__(t),data:u[e],backgroundColor:[c[e]],borderColor:[c[e]],borderWidth:3,fill:!1})})),h.next=10,a.awrap(n.dynamicImport("chart.js"));case 10:return p=h.sent,f=p.default,h.abrupt("return",new f(t,{type:"line",data:{labels:s,datasets:l},options:o(d)}));case 13:case"end":return h.stop()}}return h}())}return t}(),u=function(){function t(t,e,r,o,s){var u,d;return a.async(function(){function c(c){for(;;)switch(c.prev=c.next){case 0:if(t){c.next=2;break}return c.abrupt("return");case 2:return r&&r.destroy(),c.next=5,a.awrap(n.dynamicImport("chart.js"));case 5:return u=c.sent,d=u.default,c.abrupt("return",new d(t,{type:"doughnut",data:{labels:o,datasets:[{data:s,backgroundColor:["#2de0a5","#ffd21f","#f5455c","#cbced1"],borderWidth:0}]},options:i(e)}));case 8:case"end":return c.stop()}}return c}())}return t}(),d=function(){function t(t,e,n){var r,o;return a.async(function(){function i(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,a.awrap(t);case 2:-1===(r=i.sent).data.labels.indexOf(e)?(r.data.labels.push(e),r.data.datasets.forEach((function(t,e){t.data.push(n[e])}))):(o=r.data.labels.indexOf(e),r.data.datasets.forEach((function(t,e){t.data[o]=n[e]}))),r.update();case 5:case"end":return i.stop()}}return i}())}return t}()}

