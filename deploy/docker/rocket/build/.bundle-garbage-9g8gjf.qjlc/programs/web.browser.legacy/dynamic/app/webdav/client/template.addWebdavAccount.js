function module(){Template.__checkName("addWebdavAccount"),Template.addWebdavAccount=new Template("Template.addWebdavAccount",(function(){var t=this;return HTML.FORM({id:"add-webdav",class:"content-background-color color-primary-font-color"},"\n\t\t",HTML.DIV({class:"fields"},"\n\t\t\t",HTML.DIV({class:"rc-input"},"\n\t\t\t\t",HTML.LABEL({class:"rc-input__label",for:"serverURL"},"\n\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t",HTML.INPUT({name:"name",id:"serverName",type:"text",class:"rc-input__element",autocapitalize:"off",autocorrect:"off",placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Name_optional")},autofocus:""}),"\n\t\t\t\t\t\t",HTML.Raw('<div class="input-error"></div>'),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t\t",HTML.DIV({class:"rc-input"},"\n\t\t\t\t",HTML.LABEL({class:"rc-input__label",for:"serverURL"},"\n\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t",HTML.INPUT({name:"serverURL",id:"serverURL",type:"text",class:"rc-input__element",autocapitalize:"off",autocorrect:"off",placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Webdav_Server_URL")},autofocus:""}),"\n\t\t\t\t\t\t",HTML.Raw('<div class="input-error"></div>'),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t\t",HTML.DIV({class:"rc-input"},"\n\t\t\t\t",HTML.LABEL({class:"rc-input__label",for:"username"},"\n\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t",HTML.INPUT({name:"username",id:"username",type:"text",class:"rc-input__element",autocapitalize:"off",autocorrect:"off",placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Username")},autofocus:""}),"\n\t\t\t\t\t\t",HTML.Raw('<div class="input-error"></div>'),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t\t",HTML.DIV({class:"rc-input"},"\n\t\t\t\t",HTML.LABEL({class:"rc-input__label",for:"pass"},"\n\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t",HTML.INPUT({name:"pass",id:"pass",type:"password",class:"rc-input__element",autocapitalize:"off",autocorrect:"off",placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Password")},autofocus:""}),"\n\t\t\t\t\t\t",HTML.Raw('<div class="input-error"></div>'),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t\t",HTML.DIV({class:"submit"},"\n\t\t\t",HTML.BUTTON({class:"rc-button rc-button--primary"},HTML.SPAN(Blaze.View("lookup:btnAddNewServer",(function(){return Spacebars.mustache(t.lookup("btnAddNewServer"))})))),"\n\t\t"),"\n\t")}))}
