function module(){Template.__checkName("integrationsAdditionalZapier"),Template.integrationsAdditionalZapier=new Template("Template.integrationsAdditionalZapier",(function(){var e=this;return[HTML.SECTION({class:"page-container page-home page-static page-settings"},"\n\t\t",Blaze._TemplateWith((function(){return{sectionName:Spacebars.call("Zapier"),hideHelp:Spacebars.call(!0),fixedHeight:Spacebars.call(!0)}}),(function(){return Spacebars.include(e.lookupTemplate("header"))})),"\n\t\t",HTML.A({href:function(){return Spacebars.mustache(e.lookup("pathFor"),"admin-integrations")}},HTML.Raw('<i class="icon-angle-left"></i>')," ",Blaze.View("lookup:_",(function(){return Spacebars.mustache(e.lookup("_"),"Back_to_integrations")}))),HTML.Raw("<br>"),HTML.Raw("<br>"),"\n\t\t",HTML.Raw('<div class="content zapier">\n\t\t\t<div id="zapier-goes-here"></div>\n\t\t</div>'),"\n\t"),"\n\t",HTML.SCRIPT({src:"https://zapier.com/apps/embed/widget.js?services=rocketchat&html_id=zapier-goes-here"})]}))}

