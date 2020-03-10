function module(t,e,n){var a,r,l,s,o,i;function c(t){var e=t.statistics,n=t.isLoading,c=function(t){return n?l.createElement(r,{width:"50%"}):t()},u=s();return l.createElement(l.Fragment,null,l.createElement(a,{"data-qa":"usage-title"},u("Usage")),l.createElement(o,{"data-qa":"usage-list"},l.createElement(o.Entry,{label:u("Stats_Total_Users")},c((function(){return e.totalUsers}))),l.createElement(o.Entry,{label:u("Stats_Active_Users")},c((function(){return e.activeUsers}))),l.createElement(o.Entry,{label:u("Stats_App_Users")},c((function(){return e.appUsers}))),l.createElement(o.Entry,{label:u("Stats_Non_Active_Users")},c((function(){return e.nonActiveUsers}))),l.createElement(o.Entry,{label:u("Stats_Total_Connected_Users")},c((function(){return e.totalConnectedUsers}))),l.createElement(o.Entry,{label:u("Stats_Online_Users")},c((function(){return e.onlineUsers}))),l.createElement(o.Entry,{label:u("Stats_Away_Users")},c((function(){return e.awayUsers}))),l.createElement(o.Entry,{label:u("Stats_Offline_Users")},c((function(){return e.offlineUsers}))),l.createElement(o.Entry,{label:u("Stats_Total_Rooms")},c((function(){return e.totalRooms}))),l.createElement(o.Entry,{label:u("Stats_Total_Channels")},c((function(){return e.totalChannels}))),l.createElement(o.Entry,{label:u("Stats_Total_Private_Groups")},c((function(){return e.totalPrivateGroups}))),l.createElement(o.Entry,{label:u("Stats_Total_Direct_Messages")},c((function(){return e.totalDirect}))),l.createElement(o.Entry,{label:u("Stats_Total_Livechat_Rooms")},c((function(){return e.totalLivechat}))),l.createElement(o.Entry,{label:u("Total_Discussions")},c((function(){return e.totalDiscussions}))),l.createElement(o.Entry,{label:u("Total_Threads")},c((function(){return e.totalThreads}))),l.createElement(o.Entry,{label:u("Stats_Total_Messages")},c((function(){return e.totalMessages}))),l.createElement(o.Entry,{label:u("Stats_Total_Messages_Channel")},c((function(){return e.totalChannelMessages}))),l.createElement(o.Entry,{label:u("Stats_Total_Messages_PrivateGroup")},c((function(){return e.totalPrivateGroupMessages}))),l.createElement(o.Entry,{label:u("Stats_Total_Messages_Direct")},c((function(){return e.totalDirectMessages}))),l.createElement(o.Entry,{label:u("Stats_Total_Messages_Livechat")},c((function(){return e.totalLivechatMessages}))),l.createElement(o.Entry,{label:u("Stats_Total_Uploads")},c((function(){return e.uploadsTotal}))),l.createElement(o.Entry,{label:u("Stats_Total_Uploads_Size")},c((function(){return i(e.uploadsTotalSize)}))),e&&e.apps&&l.createElement(l.Fragment,null,l.createElement(o.Entry,{label:u("Stats_Total_Installed_Apps")},e.apps.totalInstalled),l.createElement(o.Entry,{label:u("Stats_Total_Active_Apps")},e.apps.totalActive)),l.createElement(o.Entry,{label:u("Stats_Total_Integrations")},c((function(){return e.integrations.totalIntegrations}))),l.createElement(o.Entry,{label:u("Stats_Total_Incoming_Integrations")},c((function(){return e.integrations.totalIncoming}))),l.createElement(o.Entry,{label:u("Stats_Total_Active_Incoming_Integrations")},c((function(){return e.integrations.totalIncomingActive}))),l.createElement(o.Entry,{label:u("Stats_Total_Outgoing_Integrations")},c((function(){return e.integrations.totalOutgoing}))),l.createElement(o.Entry,{label:u("Stats_Total_Active_Outgoing_Integrations")},c((function(){return e.integrations.totalOutgoingActive}))),l.createElement(o.Entry,{label:u("Stats_Total_Integrations_With_Script_Enabled")},c((function(){return e.integrations.totalWithScriptEnabled})))))}n.export({UsageSection:function(){return c}}),n.link("@rocket.chat/fuselage",{Subtitle:function(t){a=t},Skeleton:function(t){r=t}},0),n.link("react",{default:function(t){l=t}},1),n.link("../../../contexts/TranslationContext",{useTranslation:function(t){s=t}},2),n.link("./DescriptionList",{DescriptionList:function(t){o=t}},3),n.link("./formatters",{formatMemorySize:function(t){i=t}},4)}

