function module(e,t,n){let s,i,o,a,l,d,u;n.link("meteor/meteor",{Meteor(e){s=e}},0),n.link("meteor/templating",{Template(e){i=e}},1),n.link("meteor/rocketchat:tap-i18n",{TAPi18n(e){o=e}},2),n.link("toastr",{default(e){a=e}},3),n.link("underscore.string",{default(e){l=e}},4),n.link("../../../utils",{t(e){d=e},handleError(e){u=e}},5),i.soundEdit.helpers({sound:()=>i.instance().sound,name(){return this.name||this._id}}),i.soundEdit.events({"click .cancel"(e,t){e.stopPropagation(),e.preventDefault(),delete i.instance().soundFile,t.cancel(t.find("form"))},"submit form"(e,t){e.stopPropagation(),e.preventDefault(),t.save(e.currentTarget)},"change input[type=file]"(e){const t=null!=e.originalEvent?e.originalEvent:e;let{files:n}=t.target;null!=t.target.files&&0!==n.length||(n=null!=t.dataTransfer.files?t.dataTransfer.files:[]);for(const s in n)n.hasOwnProperty(s)&&(i.instance().soundFile=n[s])}}),i.soundEdit.onCreated((function(){null!=this.data?this.sound=this.data.sound:(this.sound=void 0,this.data.tabBar.showGroup("custom-sounds")),this.onSuccess=i.currentData().onSuccess,this.cancel=(e,t)=>{e.reset(),this.data.tabBar.close(),this.sound&&this.data.back(t)},this.getSoundData=()=>{const e={};return null!=this.sound&&(e._id=this.sound._id,e.previousName=this.sound.name,e.extension=this.sound.extension,e.previousExtension=this.sound.extension),e.name=l.trim(this.$("#name").val()),e.newFile=!1,e},this.validate=()=>{const e=this.getSoundData(),t=[];e.name||t.push("Name"),e._id||this.soundFile||t.push("Sound_File_mp3");for(const n of t)a.error(o.__("error-the-field-is-required",{field:o.__(n)}));return this.soundFile&&(/audio\/mp3/.test(this.soundFile.type)||/audio\/mpeg/.test(this.soundFile.type)||/audio\/x-mpeg/.test(this.soundFile.type)||(t.push("FileType"),a.error(o.__("error-invalid-file-type")))),0===t.length},this.save=e=>{if(this.validate()){const t=this.getSoundData();this.soundFile&&(t.newFile=!0,t.extension=this.soundFile.name.split(".").pop(),t.type=this.soundFile.type),s.call("insertOrUpdateSound",t,(n,i)=>{if(i){if(t._id=i,t.random=Math.round(1e3*Math.random()),this.soundFile){a.info(o.__("Uploading_file"));const e=new FileReader;e.readAsBinaryString(this.soundFile),e.onloadend=()=>{s.call("uploadCustomSound",e.result,this.soundFile.type,t,e=>{null!=e&&(u(e),console.log(e))}),delete this.soundFile,a.success(o.__("File_uploaded"))}}a.success(d("Custom_Sound_Saved_Successfully")),this.onSuccess(),this.cancel(e,t.name)}n&&u(n)})}}}))}

