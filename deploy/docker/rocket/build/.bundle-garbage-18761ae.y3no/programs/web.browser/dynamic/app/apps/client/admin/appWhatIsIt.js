function module(e,t,a){let r,i,n,o,s,l,p;a.link("meteor/meteor",{Meteor(e){r=e}},0),a.link("meteor/reactive-var",{ReactiveVar(e){i=e}},1),a.link("meteor/kadira:flow-router",{FlowRouter(e){n=e}},2),a.link("meteor/templating",{Template(e){o=e}},3),a.link("meteor/tracker",{Tracker(e){s=e}},4),a.link("../orchestrator",{Apps(e){l=e}},5),a.link("../../../ui-utils/client",{SideNav(e){p=e}},6),o.appWhatIsIt.onCreated((function(){this.isLoading=new i(!1),this.hasError=new i(!1)})),o.appWhatIsIt.helpers({isLoading:()=>!!o.instance().isLoading&&o.instance().isLoading.get(),hasError:()=>!!o.instance().hasError&&o.instance().hasError.get()}),o.appWhatIsIt.events({"click .js-enable"(e,t){t.isLoading.set(!0),r.call("apps/go-enable",(function e(a){if(a)return t.hasError.set(!0),void t.isLoading.set(!1);l.load(!0),n.go("/admin/apps")}))}}),o.appWhatIsIt.onRendered(()=>{s.afterFlush(()=>{p.setFlex("adminFlex"),p.openFlex()})})}

