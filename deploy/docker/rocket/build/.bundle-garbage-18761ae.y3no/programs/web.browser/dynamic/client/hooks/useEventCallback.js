function module(r,e,n){let t,u,c;n.export({useEventCallback:()=>a}),n.link("react",{useCallback(r){t=r},useLayoutEffect(r){u=r},useRef(r){c=r}},0);const a=function(r){for(var e=arguments.length,n=new Array(e>1?e-1:0),a=1;a<e;a++)n[a-1]=arguments[a];const o=c(r),l=c(n);return u(()=>{o.current=r,l.current=n}),t((function(){for(var r=arguments.length,e=new Array(r),n=0;n<r;n++)e[n]=arguments[n];return(0,o.current)(...l.current,...e)}),[])}}
