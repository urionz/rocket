function module(){Template.__checkName("adminImportPrepare"),Template.adminImportPrepare=new Template("Template.adminImportPrepare",(function(){var t=this;return HTML.SECTION({class:"page-container page-home page-static page-settings"},"\n\t\t",Blaze._TemplateWith((function(){return{sectionName:Spacebars.call(t.lookup("pageTitle"))}}),(function(){return Spacebars.include(t.lookupTemplate("header"))})),"\n\t\t",HTML.DIV({class:"content"},"\n\t\t\t",Blaze.Unless((function(){return Spacebars.dataMustache(t.lookup("hasPermission"),"run-import")}),(function(){return["\n\t\t\t\t",HTML.P(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"You_are_not_authorized_to_view_this_page")}))),"\n\t\t\t"]}),(function(){return["\n\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("isPreparing"))}),(function(){return["\n\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("hasProgressRate"))}),(function(){return["\n\t\t\t\t\t\t",Blaze.View("lookup:progressRate",(function(){return Spacebars.mustache(t.lookup("progressRate"))})),"\n\t\t\t\t\t"]})),"\n\n\t\t\t\t\t",Spacebars.include(t.lookupTemplate("loading")),"\n\t\t\t\t"]}),(function(){return["\n\t\t\t\t\t",HTML.A({href:function(){return Spacebars.mustache(t.lookup("pathFor"),"admin-import")}},HTML.I({class:"icon-angle-left"})," ",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Back_to_imports")}))),HTML.BR(),HTML.BR(),"\n\n\t\t\t\t\t",HTML.DIV({class:"section"},"\n\t\t\t\t\t\t",HTML.H1(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Actions")}))),"\n\t\t\t\t\t\t",HTML.DIV({class:"section-content"},"\n\t\t\t\t\t\t\t",HTML.BUTTON({class:"button uncheck-deleted-users"},HTML.I({class:"icon-send"}),HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Importer_Prepare_Uncheck_Deleted_Users")})))),"\n\t\t\t\t\t\t\t",HTML.BUTTON({class:"button uncheck-archived-channels"},HTML.I({class:"icon-send"}),HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Importer_Prepare_Uncheck_Archived_Channels")})))),"\n\t\t\t\t\t\t\t",HTML.BUTTON({class:"button primary start"},HTML.I({class:"icon-send"}),HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Importer_Prepare_Start_Import")})))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\n\t\t\t\t\t",HTML.DIV({class:"section"},"\n\t\t\t\t\t\t",HTML.H1(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Messages")})),": ",Blaze.View("lookup:message_count",(function(){return Spacebars.mustache(t.lookup("message_count"))}))),"\n\t\t\t\t\t"),"\n\n\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(Spacebars.dot(t.lookup("users"),"length"))}),(function(){return["\n\t\t\t\t\t\t",HTML.DIV({class:"section"},"\n\t\t\t\t\t\t\t",HTML.H1(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Users")}))),"\n\t\t\t\t\t\t\t",HTML.DIV({class:"section-content"},"\n\t\t\t\t\t\t\t\t",HTML.UL("\n\t\t\t\t\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("users"))}),(function(){return["\n\t\t\t\t\t\t\t\t\t\t",Blaze.Unless((function(){return Spacebars.call(t.lookup("is_bot"))}),(function(){return["\n\t\t\t\t\t\t\t\t\t\t\t",HTML.LI("\n\t\t\t\t\t\t\t\t\t\t\t\t",HTML.INPUT({type:"checkbox",name:function(){return Spacebars.mustache(t.lookup("user_id"))},id:function(){return["user_",Spacebars.mustache(t.lookup("user_id"))]},checked:"checked"}),"\n\t\t\t\t\t\t\t\t\t\t\t\t",HTML.LABEL({for:function(){return["user_",Spacebars.mustache(t.lookup("user_id"))]}},Blaze.View("lookup:username",(function(){return Spacebars.mustache(t.lookup("username"))}))," - ",Blaze.View("lookup:email",(function(){return Spacebars.mustache(t.lookup("email"))}))),"\n\t\t\t\t\t\t\t\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("is_deleted"))}),(function(){return[" ",HTML.EM("(",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Deleted")})),")")]})),"\n\t\t\t\t\t\t\t\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("is_email_taken"))}),(function(){return[" ",HTML.EM("(",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Duplicated_Email_address_will_be_ignored")})),")")]})),"\n\t\t\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t\t\t"]})),"\n\t\t\t\t\t\t\t\t\t"]})),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\n\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(Spacebars.dot(t.lookup("channels"),"length"))}),(function(){return["\n\t\t\t\t\t\t",HTML.DIV({class:"section"},"\n\t\t\t\t\t\t\t",HTML.H1(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Channels")}))),"\n\t\t\t\t\t\t\t",HTML.DIV({class:"section-content"},"\n\t\t\t\t\t\t\t\t",HTML.UL("\n\t\t\t\t\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("channels"))}),(function(){return["\n\t\t\t\t\t\t\t\t\t\t",HTML.LI("\n\t\t\t\t\t\t\t\t\t\t\t",HTML.INPUT({type:"checkbox",name:function(){return Spacebars.mustache(t.lookup("channel_id"))},id:function(){return["channel_",Spacebars.mustache(t.lookup("channel_id"))]},checked:"checked"}),"\n\t\t\t\t\t\t\t\t\t\t\t",HTML.LABEL({for:function(){return["channel_",Spacebars.mustache(t.lookup("channel_id"))]}},Blaze.View("lookup:name",(function(){return Spacebars.mustache(t.lookup("name"))}))),"\n\t\t\t\t\t\t\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("is_archived"))}),(function(){return[" ",HTML.EM("(",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Importer_Archived")})),")")]})),"\n\t\t\t\t\t\t\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("is_private"))}),(function(){return[" ",HTML.EM("(",Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Private_Group")})),")")]})),"\n\t\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t\t"]})),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\t\t\t\t"]})),"\n\t\t\t"]})),"\n\t\t"),"\n\t")}))}

