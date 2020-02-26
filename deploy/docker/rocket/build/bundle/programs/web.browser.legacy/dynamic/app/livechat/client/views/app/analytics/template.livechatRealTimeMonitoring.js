function module(){Template.__checkName("livechatRealTimeMonitoring"),Template.livechatRealTimeMonitoring=new Template("Template.livechatRealTimeMonitoring",(function(){var t=this;return Blaze._TemplateWith((function(){return"view-livechat-real-time-monitoring"}),(function(){return Spacebars.include(t.lookupTemplate("requiresPermission"),(function(){return["\n\t",HTML.FORM({class:"form-inline"},"\n\t\t",HTML.DIV({class:"form-group rc-select lc-analytics-header"},"\n\t\t\t",HTML.SELECT({id:"lc-analytics-options",class:"rc-select__element js-interval"},"\n\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:"5"},"5 ",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"seconds")}))),"\n\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:"10"},"10 ",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"seconds")}))),"\n\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:"30"},"30 ",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"seconds")}))),"\n\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:"60"},"1 ",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"minute")}))),"\n\t\t\t"),"\n\t\t\t",HTML.I({class:"icon-angle-down"}),"\n\t\t"),"\n\t"),"\n\t",Blaze.If((function(){return Spacebars.call(t.lookup("isLoading"))}),(function(){return["\n\t\t",Spacebars.include(t.lookupTemplate("loading")),"\n\t"]}),(function(){return["\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",HTML.DIV({class:"lc-analytics-overview"},"\n\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("conversationsOverview"))}),(function(){return["\n\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-col"},"\n\t\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-case"},"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),t.lookup("title"))}))),"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"value"},Blaze.View("lookup:value",(function(){return Spacebars.mustache(t.lookup("value"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t"]})),"\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-doughnut-chart"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",HTML.DIV({class:"lc-monitoring-chart-container"},"\n\t\t\t\t\t",HTML.CANVAS({id:"lc-chats-chart"}),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",HTML.DIV({class:"lc-monitoring-chart-container"},"\n\t\t\t\t\t",HTML.CANVAS({id:"lc-chats-per-agent-chart"}),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("isLoading"))}),(function(){return["\n\t\t\t\t\t",Spacebars.include(t.lookupTemplate("loading")),"\n\t\t\t\t"]}),(function(){return["\n\t\t\t\t",HTML.DIV({class:"lc-analytics-overview"},"\n\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("chatsOverview"))}),(function(){return["\n\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-col"},"\n\t\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-case"},"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),t.lookup("title"))}))),"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"value"},Blaze.View("lookup:value",(function(){return Spacebars.mustache(t.lookup("value"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\t\t\t\t"),"\n\t\t\t\t"]})),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-doughnut-chart"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",HTML.DIV({class:"lc-monitoring-chart-container"},"\n\t\t\t\t\t",HTML.CANVAS({id:"lc-agents-chart"}),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",HTML.DIV({class:"lc-monitoring-chart-container"},"\n\t\t\t\t\t",HTML.CANVAS({id:"lc-chats-per-dept-chart"}),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("isLoading"))}),(function(){return["\n\t\t\t\t\t",Spacebars.include(t.lookupTemplate("loading")),"\n\t\t\t\t"]}),(function(){return["\n\t\t\t\t",HTML.DIV({class:"lc-analytics-overview"},"\n\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("agentsOverview"))}),(function(){return["\n\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-col"},"\n\t\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-case"},"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),t.lookup("title"))}))),"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"value"},Blaze.View("lookup:value",(function(){return Spacebars.mustache(t.lookup("value"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\t\t\t\t"),"\n\t\t\t\t"]})),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",HTML.DIV({class:"lc-monitoring-chart-container"},"\n\t\t\t\t\t",HTML.CANVAS({id:"lc-chat-duration-chart"}),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"section-content border-component-color"},"\n\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("isLoading"))}),(function(){return["\n\t\t\t\t\t",Spacebars.include(t.lookupTemplate("loading")),"\n\t\t\t\t"]}),(function(){return["\n\t\t\t\t",HTML.DIV({class:"lc-analytics-overview"},"\n\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("timingOverview"))}),(function(){return["\n\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-col"},"\n\t\t\t\t\t\t",HTML.DIV({class:"lc-analytics-ov-case"},"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),t.lookup("title"))}))),"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"value"},Blaze.View("lookup:value",(function(){return Spacebars.mustache(t.lookup("value"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\t\t\t\t"),"\n\t\t\t\t"]})),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t",HTML.DIV({class:"lc-monitoring-flex"},"\n\t\t",HTML.DIV({class:"section lc-monitoring-line-chart-full"},"\n\t\t\t",HTML.DIV({class:"lc-monitoring-chart-container"},"\n\t\t\t\t",HTML.CANVAS({id:"lc-reaction-response-times-chart"}),"\n\t\t\t"),"\n\t\t"),"\n\t"),"\n\t"]}))}))}))}

