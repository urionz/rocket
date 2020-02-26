function module(){Template.__checkName("visitorForward"),Template.visitorForward=new Template("Template.visitorForward",(function(){var t=this;return HTML.DIV({class:"forward-chat"},"\n\t\t",HTML.DIV({class:"edit-form"},"\n\t\t\t",HTML.H3(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Forward_chat")}))),"\n\t\t\t",Spacebars.With((function(){return Spacebars.call(t.lookup("visitor"))}),(function(){return["\n\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t",HTML.LABEL({for:"name"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Name")}))),"\n\t\t\t\t\t",HTML.SPAN(Blaze.View("lookup:username",(function(){return Spacebars.mustache(t.lookup("username"))}))),"\n\t\t\t\t"),"\n\t\t\t"]})),"\n\t\t\t",HTML.FORM("\n\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("hasDepartments"))}),(function(){return["\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"forwardDepartment"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Forward_to_department")}))),"\n\t\t\t\t\t\t",HTML.DIV({class:"rc-select"},"\n\t\t\t\t\t\t\t",HTML.SELECT({class:"rc-select__element",name:"forwardDepartment",id:"forwardDepartment"},"\n\t\t\t\t\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:""},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Select_a_department")}))),"\n\t\t\t\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("departments"))}),(function(){return["\n\t\t\t\t\t\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:function(){return Spacebars.mustache(t.lookup("_id"))}},Blaze.View("lookup:name",(function(){return Spacebars.mustache(t.lookup("name"))}))),"\n\t\t\t\t\t\t\t\t"]})),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t",Blaze._TemplateWith((function(){return{block:Spacebars.call("rc-select__arrow"),icon:Spacebars.call("arrow-down")}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))})),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\n\t\t\t\t\t",HTML.DIV({class:"form-divisor"},"\n\t\t\t\t\t\t",HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"or")}))),"\n\t\t\t\t\t"),"\n\t\t\t\t"]})),"\n\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t",HTML.LABEL({for:"agent"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Forward_to_user")}))),"\n\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t",Blaze._TemplateWith((function(){return{onClickTag:Spacebars.call(t.lookup("onClickTagAgent")),list:Spacebars.call(t.lookup("selectedAgents")),onSelect:Spacebars.call(t.lookup("onSelectAgents")),collection:Spacebars.call("UserAndRoom"),endpoint:Spacebars.call("users.autocomplete"),field:Spacebars.call("username"),sort:Spacebars.call("username"),label:Spacebars.call("Select_a_user"),placeholder:Spacebars.call("Select_a_user"),name:Spacebars.call("agent"),icon:Spacebars.call("at"),noMatchTemplate:Spacebars.call("userSearchEmpty"),templateItem:Spacebars.call("popupList_item_default"),modifier:Spacebars.call(t.lookup("agentModifier")),conditions:Spacebars.call(t.lookup("agentConditions"))}}),(function(){return Spacebars.include(t.lookupTemplate("livechatAutocompleteUser"))})),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t\t",HTML.DIV({class:"rc-user-info__flex rc-user-info__row"},"\n\t\t\t\t\t",HTML.BUTTON({class:"rc-button cancel",type:"button"},HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Cancel")})))),"\n\t\t\t\t\t",HTML.BUTTON({class:"rc-button rc-button--primary save"},HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Forward")})))),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t")}))}

