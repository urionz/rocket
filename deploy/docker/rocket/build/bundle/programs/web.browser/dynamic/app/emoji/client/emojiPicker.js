function module(e,t,o){let a,r,c,n,s,i,g;o.export({updateRecentEmoji:()=>u}),o.link("underscore",{default(e){a=e}},0),o.link("meteor/reactive-var",{ReactiveVar(e){r=e}},1),o.link("meteor/reactive-dict",{ReactiveDict(e){c=e}},2),o.link("meteor/templating",{Template(e){n=e}},3),o.link("../../utils/client",{t(e){s=e}},4),o.link("./lib/EmojiPicker",{EmojiPicker(e){i=e}},5),o.link("../lib/rocketchat",{emoji(e){g=e}},6),o.link("./emojiPicker.html"),o.link("../../theme/client/imports/components/emojiPicker.css");const p=27,l=new c("emojiList"),k=(e,t)=>t&&'<li class="emoji-'.concat(e,' emoji-picker-item" data-emoji="').concat(e,'" title="').concat(e,'">').concat(t,"</li>"),m=(e,t)=>{const o=Object.values(g.packages).map(o=>{if(o.emojisByCategory&&o.emojisByCategory[e])return o.emojisByCategory[e].map(e=>{const a=t>0&&o.toneList.hasOwnProperty(e)?"_tone".concat(t):"";return k(e,o.renderPicker(":".concat(e).concat(a,":")))}).join("")}).join("")||"<li>".concat(s("No_emojis_found"),"</li>");return o};function u(e){l.set(e,m(e))}const h=e=>{const t=e.categoriesList,o=e.tone;t.forEach(e=>l.set(e.key,m(e.key,o)))};function j(e){let t='<ul class="emoji-list">';const o=n.instance(),a=o.tone;i.currentCategory.set("");const r=new RegExp(RegExp.escape(e.replace(/:/g,"")),"i");for(let c in g.list)if(g.list.hasOwnProperty(c)&&r.test(c)){const e=g.list[c],{emojiPackage:o}=e;let r="";c=c.replace(/:/g,""),a>0&&g.packages[o].toneList.hasOwnProperty(g)&&(r="_tone".concat(a));let n=!1;for(const t in g.packages[o].emojisByCategory)if(g.packages[o].emojisByCategory.hasOwnProperty(t)){const e=g.packages[o].emojisByCategory[t];if(-1!==e.indexOf(c)){n=!0;break}}if(n){const e=g.packages[o].renderPicker(":".concat(c).concat(r,":"));t+=k(c,e)}}return t+="</ul>"}n.emojiPicker.helpers({emojiCategories:()=>n.instance().categoriesList,emojiByCategory(e){let t=[];for(const o in g.packages)g.packages.hasOwnProperty(o)&&g.packages[o].emojisByCategory.hasOwnProperty(e)&&(t=t.concat(g.packages[o].emojisByCategory[e]));return t},searching:()=>n.instance().currentSearchTerm.get().length>0,searchResults:()=>j(n.instance().currentSearchTerm.get()),emojiList:e=>l.get(e),currentTone:()=>"tone-".concat(n.instance().tone),activeCategory:e=>i.currentCategory.get()===e?"active":"",currentCategory:()=>i.currentCategory.get()}),n.emojiPicker.events({"click .emoji-picker"(e){e.stopPropagation(),e.preventDefault()},"click .category-link":e=>(e.stopPropagation(),e.preventDefault(),i.showCategory(e.currentTarget.hash.substr(1)),!1),"scroll .emojis":a.throttle((e,t)=>{if(i.scrollingToCategory)return;const o=t.$(e.currentTarget),a=o.scrollTop()+8,r=i.getCategoryPositions().filter(e=>e.top<=a).pop();if(!r)return;const{el:c}=r,n=c.id.replace("emoji-list-category-","");i.currentCategory.set(n)},300),"click .change-tone > a"(e,t){e.stopPropagation(),e.preventDefault(),t.$(".tone-selector").toggleClass("show")},"click .tone-selector .tone"(e,t){e.stopPropagation(),e.preventDefault();const o=parseInt(e.currentTarget.dataset.tone);let a;a=o>0?"_tone".concat(o):"";for(const r in g.packages)if(g.packages.hasOwnProperty(r)&&g.packages[r].hasOwnProperty("toneList"))for(const e in g.packages[r].toneList)g.packages[r].toneList.hasOwnProperty(e)&&$(".emoji-".concat(e)).html(g.packages[r].render(":".concat(e).concat(a,":")));i.setTone(o),t.setCurrentTone(o),$(".tone-selector").toggleClass("show")},"click .emoji-list .emoji-picker-item"(e,t){e.stopPropagation();const o=e.currentTarget.dataset.emoji,a=t.tone;let r="";for(const n in g.packages)g.packages.hasOwnProperty(n)&&a>0&&g.packages[n].toneList.hasOwnProperty(o)&&(r="_tone".concat(a));const c=$(".emoji-picker .js-emojipicker-search");c&&c.val(""),t.currentSearchTerm.set(""),i.pickEmoji(o+r)},"keyup .js-emojipicker-search, change .js-emojipicker-search"(e,t){if(e.preventDefault(),e.stopPropagation(),27===e.keyCode)return i.close();const o=e.target.value.trim(),a=t.currentSearchTerm;o!==a.get()&&a.set(o)}}),n.emojiPicker.onCreated((function(){this.tone=i.getTone();const e=i.getRecent();this.currentSearchTerm=new r(""),this.categoriesList=[];for(const t in g.packages)g.packages.hasOwnProperty(t)&&g.packages[t].emojiCategories&&(void 0!==g.packages[t].categoryIndex?this.categoriesList.splice(g.packages[t].categoryIndex,0,...g.packages[t].emojiCategories):this.categoriesList=this.categoriesList.concat(g.packages[t].emojiCategories));e.forEach(e=>{g.packages.base.emojisByCategory.recent.push(e)}),this.setCurrentTone=e=>{$(".current-tone").removeClass("tone-".concat(this.tone)),$(".current-tone").addClass("tone-".concat(e)),this.tone=e},h(this)}))}
