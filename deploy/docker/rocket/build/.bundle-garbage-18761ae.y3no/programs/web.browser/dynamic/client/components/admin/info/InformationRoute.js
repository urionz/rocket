function module(t,n,e){let i,o,s,a,r,l,c,u,f,d;function m(){u();const t=a("view-statistics"),[n,e]=o(!0),[m,k]=o({}),[h,v]=o([]),[w,S]=o(()=>()=>({})),x=c("GET","statistics"),A=r("instances/get");s(()=>{let n=!1;const i=async()=>{if(!t)return k(null),void v(null);e(!0);try{const[t,i]=await Promise.all([x({refresh:!0}),A()]);if(n)return;k(t),v(i)}finally{e(!1)}};return S(()=>i),i(),()=>{n=!0}},[t]);const I=l(),g=()=>{n||w()},C=()=>{n||d(m,"statistics")};return i.createElement(f,{canViewStatistics:t,isLoading:n,info:I,statistics:m,instances:h,onClickRefreshButton:g,onClickDownloadInfo:C})}e.export({InformationRoute:()=>m}),e.link("react",{default(t){i=t},useState(t){o=t},useEffect(t){s=t}},0),e.link("../../../contexts/AuthorizationContext",{usePermission(t){a=t}},1),e.link("../../../contexts/ServerContext",{useMethod(t){r=t},useServerInformation(t){l=t},useEndpoint(t){c=t}},2),e.link("../../../hooks/useAdminSideNav",{useAdminSideNav(t){u=t}},3),e.link("./InformationPage",{InformationPage(t){f=t}},4),e.link("../../../helpers/download",{downloadJsonAsAFile(t){d=t}},5)}

