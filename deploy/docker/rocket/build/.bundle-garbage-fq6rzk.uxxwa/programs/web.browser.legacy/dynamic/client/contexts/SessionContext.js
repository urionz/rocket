function module(n,t,e){var u,o,r,i;e.export({SessionContext:function(){return c},useSession:function(){return s},useSessionDispatch:function(){return f}}),e.link("react",{createContext:function(n){u=n},useCallback:function(n){o=n},useContext:function(n){r=n}},0),e.link("../hooks/useObservableValue",{useObservableValue:function(n){i=n}},1);var c=u({get:function(){},set:function(){}}),s=function(n){var t,e=r(c).get;return i((function(t){return e(n,t)}))},f=function(n){var t,e=r(c).set;return o((function(t){return e(n,t)}),[e,n])}}

