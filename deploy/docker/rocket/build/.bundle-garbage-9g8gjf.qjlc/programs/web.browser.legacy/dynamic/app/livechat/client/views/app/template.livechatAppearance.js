function module(){Template.__checkName("livechatAppearance"),Template.livechatAppearance=new Template("Template.livechatAppearance",(function(){var t=this;return Blaze._TemplateWith((function(){return"view-livechat-appearance"}),(function(){return Spacebars.include(t.lookupTemplate("requiresPermission"),(function(){return["\n\n\t\t",HTML.DIV({class:"livechat-content"},"\n\n\t\t\t",HTML.H2(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Settings")}))),"\n\n\t\t\t",HTML.FORM({class:"rocket-form"},"\n\t\t\t\t",HTML.FIELDSET("\n\t\t\t\t\t",HTML.LEGEND(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Livechat_online")}))),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Title")}))),"\n\t\t\t\t\t\t",HTML.INPUT({type:"text",class:"preview-settings rc-input__element",name:"title",id:"title",value:function(){return Spacebars.mustache(t.lookup("title"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"color"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Title_bar_color")}))),"\n\t\t\t\t\t\t",HTML.INPUT({type:"color",class:"preview-settings rc-input__element",name:"color",id:"color",value:function(){return Spacebars.mustache(t.lookup("color"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t\t",HTML.LABEL({for:"showAgentInfo"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Show_agent_info")}))),"\n\t\t\t\t\t\t\t",HTML.DIV({class:"inline-fields"},"\n\t\t\t\t\t\t\t\t",HTML.INPUT({type:"radio",class:"preview-settings",name:"showAgentInfo",id:"showAgentInfoFormTrue",checked:function(){return Spacebars.mustache(t.lookup("showAgentInfoFormTrueChecked"))},value:"true"}),"\n\t\t\t\t\t\t\t\t",HTML.LABEL({for:"showAgentInfoFormTrue"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"True")}))),"\n\t\t\t\t\t\t\t\t",HTML.INPUT({type:"radio",class:"preview-settings",name:"showAgentInfo",id:"showAgentInfoFormFalse",checked:function(){return Spacebars.mustache(t.lookup("showAgentInfoFormFalseChecked"))},value:"false"}),"\n\t\t\t\t\t\t\t\t",HTML.LABEL({for:"showAgentInfoFormFalse"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"False")}))),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"showAgentEmail"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Show_agent_email")}))),"\n\t\t\t\t\t\t",HTML.DIV({class:"inline-fields"},"\n\t\t\t\t\t\t\t",HTML.INPUT({type:"radio",class:"preview-settings",name:"showAgentEmail",id:"showAgentEmailFormTrue",checked:function(){return Spacebars.mustache(t.lookup("showAgentEmailFormTrueChecked"))},value:"true"}),"\n\t\t\t\t\t\t\t",HTML.LABEL({for:"showAgentEmailFormTrue"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"True")}))),"\n\t\t\t\t\t\t\t",HTML.INPUT({type:"radio",class:"preview-settings",name:"showAgentEmail",id:"showAgentEmailFormFalse",checked:function(){return Spacebars.mustache(t.lookup("showAgentEmailFormFalseChecked"))},value:"false"}),"\n\t\t\t\t\t\t\t",HTML.LABEL({for:"showAgentEmailFormFalse"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"False")}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t\t",HTML.FIELDSET("\n\t\t\t\t\t",HTML.LEGEND(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Livechat_offline")}))),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"displayOfflineForm"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Display_offline_form")}))),"\n\t\t\t\t\t\t",HTML.DIV({class:"inline-fields"},"\n\t\t\t\t\t\t\t",HTML.INPUT({type:"radio",class:"preview-settings",name:"displayOfflineForm",id:"displayOfflineFormTrue",checked:function(){return Spacebars.mustache(t.lookup("displayOfflineFormTrueChecked"))},value:"true"}),"\n\t\t\t\t\t\t\t",HTML.LABEL({for:"displayOfflineFormTrue"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"True")}))),"\n\t\t\t\t\t\t\t",HTML.INPUT({type:"radio",class:"preview-settings",name:"displayOfflineForm",id:"displayOfflineFormFalse",checked:function(){return Spacebars.mustache(t.lookup("displayOfflineFormFalseChecked"))},value:"false"}),"\n\t\t\t\t\t\t\t",HTML.LABEL({for:"displayOfflineFormFalse"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"False")}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"offlineUnavailableMessage"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Offline_form_unavailable_message")}))),"\n\t\t\t\t\t\t",HTML.TEXTAREA({class:"preview-settings rc-input__element",name:"offlineUnavailableMessage",id:"offlineUnavailableMessage",value:function(){return Spacebars.mustache(t.lookup("offlineUnavailableMessage"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"offlineMessage"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Offline_message")}))),"\n\t\t\t\t\t\t",HTML.TEXTAREA({class:"preview-settings rc-input__element",name:"offlineMessage",id:"offlineMessage",value:function(){return Spacebars.mustache(t.lookup("offlineMessage"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"titleOffline"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Title_offline")}))),"\n\t\t\t\t\t\t",HTML.INPUT({type:"text",class:"preview-settings rc-input__element",name:"titleOffline",id:"titleOffline",value:function(){return Spacebars.mustache(t.lookup("titleOffline"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"colorOffline"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Title_bar_color_offline")}))),"\n\t\t\t\t\t\t",HTML.INPUT({type:"color",class:"preview-settings rc-input__element",name:"colorOffline",id:"colorOffline",value:function(){return Spacebars.mustache(t.lookup("colorOffline"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"emailOffline"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Email_address_to_send_offline_messages")}))),"\n\t\t\t\t\t\t",HTML.INPUT({type:"text",class:"preview-settings rc-input__element",name:"emailOffline",id:"emailOffline",value:function(){return Spacebars.mustache(t.lookup("emailOffline"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"offlineSuccessMessage"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Offline_success_message")}))),"\n\t\t\t\t\t\t",HTML.TEXTAREA({class:"preview-settings rc-input__element",name:"offlineSuccessMessage",id:"offlineSuccessMessage",value:function(){return Spacebars.mustache(t.lookup("offlineSuccessMessage"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t\t",HTML.FIELDSET("\n\t\t\t\t\t",HTML.LEGEND(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Livechat_registration_form")}))),"\n\t\t\t\t\t",HTML.Comment('\n\t\t\t\t\t<label class="rc-switch__label">\n\t\t\t\t\t\t<input class="rc-switch__input" type="checkbox" name="registrationFormEnabled" checked="{{registrationFormEnabled}}"/>\n\t\t\t\t\t\t<span class="rc-switch__button">\n\t\t\t\t\t\t\t<span class="rc-switch__button-inside"></span>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t\t<span class="rc-switch__text">\n\t\t\t\t\t\t\t{{_ "Show_preregistration_form"}}\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</label>\n\t\t\t\t\t'),"\n\t\t\t\t\t",HTML.LABEL({class:"rc-switch__label"},"\n\t\t\t\t\t\t",HTML.INPUT(HTML.Attrs({class:"rc-switch__input js-input-check",type:"checkbox",name:"registrationFormEnabled"},(function(){return Spacebars.attrMustache(t.lookup("registrationFormEnabled"))}))),"\n\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__button"},"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__button-inside"}),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__text"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Enabled")}))),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.LABEL({class:"rc-switch__label"},"\n\t\t\t\t\t\t",HTML.INPUT(HTML.Attrs({class:"rc-switch__input js-input-check",type:"checkbox",name:"registrationFormNameFieldEnabled"},(function(){return Spacebars.attrMustache(t.lookup("registrationFormNameFieldEnabled"))}))),"\n\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__button"},"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__button-inside"}),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__text"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Show_name_field")}))),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.LABEL({class:"rc-switch__label"},"\n\t\t\t\t\t\t",HTML.INPUT(HTML.Attrs({class:"rc-switch__input js-input-check",type:"checkbox",name:"registrationFormEmailFieldEnabled"},(function(){return Spacebars.attrMustache(t.lookup("registrationFormEmailFieldEnabled"))}))),"\n\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__button"},"\n\t\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__button-inside"}),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.SPAN({class:"rc-switch__text"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Show_email_field")}))),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"registrationFormMessage"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Livechat_registration_form_message")}))),"\n\t\t\t\t\t\t",HTML.TEXTAREA({class:"preview-settings rc-input__element",name:"registrationFormMessage",id:"registrationFormMessage",value:function(){return Spacebars.mustache(t.lookup("registrationFormMessage"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t\t",HTML.FIELDSET("\n\t\t\t\t\t",HTML.LEGEND(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Conversation_finished")}))),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"conversationFinishedMessage"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Conversation_finished_message")}))),"\n\t\t\t\t\t\t",HTML.TEXTAREA({class:"preview-settings rc-input__element",name:"conversationFinishedMessage",id:"conversationFinishedMessage",value:function(){return Spacebars.mustache(t.lookup("conversationFinishedMessage"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t",HTML.LABEL({for:"conversationFinishedText"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Conversation_finished_text")}))),"\n\t\t\t\t\t\t",HTML.TEXTAREA({class:"preview-settings rc-input__element",name:"conversationFinishedText",id:"conversationFinishedText",value:function(){return Spacebars.mustache(t.lookup("conversationFinishedText"))}}),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t\t",HTML.DIV({class:"rc-button__group submit"},"\n\t\t\t\t\t",HTML.BUTTON({class:"rc-button rc-button--danger reset-settings",type:"button"},HTML.I({class:"icon-ccw"}),Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Reset")}))),"\n\t\t\t\t\t",HTML.BUTTON({class:"rc-button rc-button--primary save"},HTML.I({class:"icon-floppy"}),Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Save")}))),"\n\t\t\t\t"),"\n\t\t\t"),"\n\n\t\t"),"\n\t"]}))}))}))}
