function module(e,t,a){let l,n,r,o,s;a.link("meteor/templating",{Template(e){l=e}},0),a.link("moment",{default(e){n=e}},1),a.link("../../../../../utils",{handleError(e){r=e}},2),a.link("../../../../../ui-utils",{popover(e){o=e}},3),a.link("../../../lib/dateHandler",{setDateRange(e){s=e}},4),a.link("./livechatAnalyticsCustomDaterange.html"),l.livechatAnalyticsCustomDaterange.helpers({from:()=>n(l.currentData().daterange.get().from,"MMM D YYYY").format("L"),to:()=>n(l.currentData().daterange.get().to,"MMM D YYYY").format("L")}),l.livechatAnalyticsCustomDaterange.onRendered((function(){this.$(".lc-custom-daterange").datepicker({autoclose:!0,todayHighlight:!0,format:n.localeData().longDateFormat("L").toLowerCase()})})),l.livechatAnalyticsCustomDaterange.events({"click .lc-custom-daterange-submit"(e){e.preventDefault();const t=document.getElementsByClassName("lc-custom-daterange-from")[0].value,a=document.getElementsByClassName("lc-custom-daterange-to")[0].value;n(t).isValid()&&n(a).isValid()?l.currentData().daterange.set(s("custom",n(new Date(t)),n(new Date(a)))):r({details:{errorTitle:"Invalid_dates"},error:"Error_in_custom_dates"}),o.close()}})}

