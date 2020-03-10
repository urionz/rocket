function module(t,a,e){let c,s,n,r,i,o,l;e.link("meteor/templating",{Template(t){c=t}},0),e.link("moment",{default(t){s=t}},1),e.link("meteor/reactive-var",{ReactiveVar(t){n=t}},2),e.link("../../../lib/chartHandler",{drawLineChart(t){r=t},drawDoughnutChart(t){i=t},updateChart(t){o=t}},3),e.link("../../../../../utils/client",{APIClient(t){l=t}},4),e.link("./livechatRealTimeMonitoring.html");const h={};let d;const v={"lc-chats-chart":()=>i(document.getElementById("lc-chats-chart"),"Chats",h["lc-chats-chart"],["Open","Queue","Closed"],[0,0,0]),"lc-agents-chart":()=>i(document.getElementById("lc-agents-chart"),"Agents",h["lc-agents-chart"],["Available","Away","Busy","Offline"],[0,0,0,0]),"lc-chats-per-agent-chart":()=>r(document.getElementById("lc-chats-per-agent-chart"),h["lc-chats-per-agent-chart"],["Open","Closed"],[],[[],[]],{legends:!0,anim:!0,smallTicks:!0}),"lc-chats-per-dept-chart":()=>document.getElementById("lc-chats-per-dept-chart")?r(document.getElementById("lc-chats-per-dept-chart"),h["lc-chats-per-dept-chart"],["Open","Closed"],[],[[],[]],{legends:!0,anim:!0,smallTicks:!0}):null,"lc-reaction-response-times-chart"(){const t=[],a=[],e=s().startOf("day");for(let c=e;c.diff(s(),"hours")<0;c.add(1,"hours")){const e=c.format("H");t.push("".concat(s(e,["H"]).format("hA"),"-").concat(s((parseInt(e)+1)%24,["H"]).format("hA"))),a.push(0)}return r(document.getElementById("lc-reaction-response-times-chart"),h["lc-reaction-response-times-chart"],["Avg_reaction_time","Longest_reaction_time","Avg_response_time","Longest_response_time"],t.slice(),[a.slice(),a.slice(),a.slice(),a.slice()],{legends:!0,anim:!0,smallTicks:!0})},"lc-chat-duration-chart"(){const t=[],a=[],e=s().startOf("day");for(let c=e;c.diff(s(),"hours")<0;c.add(1,"hours")){const e=c.format("H");t.push("".concat(s(e,["H"]).format("hA"),"-").concat(s((parseInt(e)+1)%24,["H"]).format("hA"))),a.push(0)}return r(document.getElementById("lc-chat-duration-chart"),h["lc-chat-duration-chart"],["Avg_chat_duration","Longest_chat_duration"],t.slice(),[a.slice(),a.slice()],{legends:!0,anim:!0,smallTicks:!0})}},g=async()=>{h["lc-chats-chart"]=await v["lc-chats-chart"](),h["lc-agents-chart"]=await v["lc-agents-chart"](),h["lc-chats-per-agent-chart"]=await v["lc-chats-per-agent-chart"](),h["lc-chats-per-dept-chart"]=await v["lc-chats-per-dept-chart"](),h["lc-reaction-response-times-chart"]=await v["lc-reaction-response-times-chart"](),h["lc-chat-duration-chart"]=await v["lc-chat-duration-chart"]()},u=async(t,a,e)=>{h[t]||(h[t]=await v[t]()),await o(h[t],a,e)};let m;const w=()=>{const t=s(new Date);return{start:"".concat(s(new Date(t.year(),t.month(),t.date(),0,0,0)).utc().format("YYYY-MM-DDTHH:mm:ss"),"Z"),end:"".concat(s(new Date(t.year(),t.month(),t.date(),23,59,59)).utc().format("YYYY-MM-DDTHH:mm:ss"),"Z")}},p=async t=>{let{start:a,end:e}=t;const{totalizers:c}=await l.v1.get("livechat/analytics/dashboards/conversation-totalizers?start=".concat(a,"&end=").concat(e));return c},y=async t=>{t&&Array.isArray(t)&&d.conversationsOverview.set(t)},f=async t=>{let{start:a,end:e}=t;const{totalizers:c}=await l.v1.get("livechat/analytics/dashboards/agents-productivity-totalizers?start=".concat(a,"&end=").concat(e));return c},O=async t=>{t&&Array.isArray(t)&&d.agentsOverview.set(t)},A=async t=>{let{start:a,end:e}=t;const{totalizers:c}=await l.v1.get("livechat/analytics/dashboards/chats-totalizers?start=".concat(a,"&end=").concat(e));return c},b=async t=>{t&&Array.isArray(t)&&d.chatsOverview.set(t)},D=async t=>{let{start:a,end:e}=t;const{totalizers:c}=await l.v1.get("livechat/analytics/dashboards/productivity-totalizers?start=".concat(a,"&end=").concat(e));return c},H=async t=>{t&&Array.isArray(t)&&d.timingOverview.set(t)},I=t=>{let{start:a,end:e}=t;return l.v1.get("livechat/analytics/dashboards/charts/chats?start=".concat(a,"&end=").concat(e))},T=async t=>{let{open:a,closed:e,queued:c}=t;await u("lc-chats-chart","Open",[a]),await u("lc-chats-chart","Closed",[e]),await u("lc-chats-chart","Queue",[c])},k=async t=>{let{start:a,end:e}=t;const c=await l.v1.get("livechat/analytics/dashboards/charts/chats-per-agent?start=".concat(a,"&end=").concat(e));return delete c.success,c},_=t=>{Object.keys(t).forEach(a=>u("lc-chats-per-agent-chart",a,[t[a].open,t[a].closed]))},C=()=>l.v1.get("livechat/analytics/dashboards/charts/agents-status"),M=async t=>{t&&(await u("lc-agents-chart","Offline",[t.offline]),await u("lc-agents-chart","Available",[t.available]),await u("lc-agents-chart","Away",[t.away]),await u("lc-agents-chart","Busy",[t.busy]))},z=async t=>{let{start:a,end:e}=t;const c=await l.v1.get("livechat/analytics/dashboards/charts/chats-per-department?start=".concat(a,"&end=").concat(e));return delete c.success,c},B=t=>{Object.keys(t).forEach(a=>u("lc-chats-per-dept-chart",a,[t[a].open,t[a].closed]))},E=t=>{let{start:a,end:e}=t;return l.v1.get("livechat/analytics/dashboards/charts/timings?start=".concat(a,"&end=").concat(e))},L=async t=>{const a=s(new Date).format("H"),e="".concat(s(a,["H"]).format("hA"),"-").concat(s((parseInt(a)+1)%24,["H"]).format("hA"));await u("lc-reaction-response-times-chart",e,[t.reaction.avg,t.reaction.longest,t.response.avg,t.response.longest]),await u("lc-chat-duration-chart",e,[t.chatDuration.avg,t.chatDuration.longest])},R=()=>1e3*d.interval.get();c.livechatRealTimeMonitoring.helpers({selected:t=>(t===d.analyticsOptions.get().value||t===d.chartOptions.get().value)&&"selected",conversationsOverview:()=>d.conversationsOverview.get(),timingOverview:()=>d.timingOverview.get(),agentsOverview:()=>d.agentsOverview.get(),chatsOverview:()=>d.chatsOverview.get(),isLoading:()=>c.instance().isLoading.get()}),c.livechatRealTimeMonitoring.onCreated((function(){d=c.instance(),this.isLoading=new n(!1),this.conversationsOverview=new n,this.timingOverview=new n,this.chatsOverview=new n,this.agentsOverview=new n,this.conversationTotalizers=new n([]),this.interval=new n(5)})),c.livechatRealTimeMonitoring.onRendered((async function(){await g(),this.updateDashboard=async()=>{const t=w();y(await p(t)),H(await D(t)),T(await I(t)),_(await k(t)),M(await C()),B(await z(t)),L(await E(t)),O(await f(t)),b(await A(t))},this.autorun(()=>{m&&clearInterval(m),m=setInterval(()=>this.updateDashboard(),R())}),this.isLoading.set(!0),await this.updateDashboard(),this.isLoading.set(!1)})),c.livechatRealTimeMonitoring.events({"change .js-interval":(t,a)=>{a.interval.set(t.target.value)}}),c.livechatRealTimeMonitoring.onDestroyed((function(){clearInterval(m)}))}
