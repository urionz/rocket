function module(){Template.__checkName("iframeModal"),Template.iframeModal=new Template("Template.iframeModal",(function(){var a=this;return HTML.MAIN({class:"rc-modal__content",style:"height: 300px; width: 450px; padding: 0px;"},"\n\t\t",HTML.IFRAME({src:function(){return Spacebars.mustache(Spacebars.dot(a.lookup("data"),"url"))},style:"border: none; display: none; height: 100%; width: 100%;"}),"\n\n\t\t",HTML.DIV({class:"loading"},Blaze._TemplateWith((function(){return{class:Spacebars.call("loading-animation--primary")}}),(function(){return Spacebars.include(a.lookupTemplate("loading"))}))),"\n\t")}))}
