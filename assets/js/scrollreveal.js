/*! @license ScrollReveal v4.0.9

	Copyright 2021 Fisssion LLC.

	Licensed under the GNU General Public License 3.0 for
	compatible open source projects and non-commercial use.

	For commercial sites, themes, projects, and applications,
	keep your source code private/proprietary by purchasing
	a commercial license from https://scrollrevealjs.org/
*/(function(O,k){typeof exports=="object"&&typeof module<"u"?module.exports=k():typeof define=="function"&&define.amd?define(k):(O=O||self,O.ScrollReveal=k())})(this,function(){"use strict";var O={delay:0,distance:"0",duration:600,easing:"cubic-bezier(0.5, 0, 0, 1)",interval:0,opacity:0,origin:"bottom",rotate:{x:0,y:0,z:0},scale:1,cleanup:!1,container:document.documentElement,desktop:!0,mobile:!0,reset:!1,useDelay:"always",viewFactor:0,viewOffset:{top:0,right:0,bottom:0,left:0},afterReset:function(){},afterReveal:function(){},beforeReset:function(){},beforeReveal:function(){}};function k(){return document.documentElement.classList.remove("sr"),{clean:function(){},destroy:function(){},reveal:function(){},sync:function(){},get noop(){return!0}}}function ft(){document.documentElement.classList.add("sr"),document.body?document.body.style.height="100%":document.addEventListener("DOMContentLoaded",function(){document.body.style.height="100%"})}var I={success:ft,failure:k};/*! @license is-dom-node v1.0.4

		Copyright 2018 Fisssion LLC.

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.

	*/function C(t){return typeof window.Node=="object"?t instanceof window.Node:t!==null&&typeof t=="object"&&typeof t.nodeType=="number"&&typeof t.nodeName=="string"}/*! @license is-dom-node-list v1.2.1

		Copyright 2018 Fisssion LLC.

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.

	*/function ct(t){var e=Object.prototype.toString.call(t),r=/^\[object (HTMLCollection|NodeList|Object)\]$/;return typeof window.NodeList=="object"?t instanceof window.NodeList:t!==null&&typeof t=="object"&&typeof t.length=="number"&&r.test(e)&&(t.length===0||C(t[0]))}/*! @license Tealight v0.3.6

		Copyright 2018 Fisssion LLC.

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.

	*/function P(t,e){if(e===void 0&&(e=document),t instanceof Array)return t.filter(C);if(C(t))return[t];if(ct(t))return Array.prototype.slice.call(t);if(typeof t=="string")try{var r=e.querySelectorAll(t);return Array.prototype.slice.call(r)}catch{return[]}return[]}function A(t){return t!==null&&t instanceof Object&&(t.constructor===Object||Object.prototype.toString.call(t)==="[object Object]")}function s(t,e){if(A(t)){var r=Object.keys(t);return r.forEach(function(i){return e(t[i],i,t)})}if(t instanceof Array)return t.forEach(function(i,o){return e(i,o,t)});throw new TypeError("Expected either an array or object literal.")}function w(t){for(var e=[],r=arguments.length-1;r-- >0;)e[r]=arguments[r+1];if(this.constructor.debug&&console){var i="%cScrollReveal: "+t;e.forEach(function(o){return i+=`
 \u2014 `+o}),console.log(i,"color: #ea654b;")}}function V(){var t=this,e=function(){return{active:[],stale:[]}},r=e(),i=e(),o=e();try{s(P("[data-sr-id]"),function(n){var a=parseInt(n.getAttribute("data-sr-id"));r.active.push(a)})}catch(n){throw n}s(this.store.elements,function(n){r.active.indexOf(n.id)===-1&&r.stale.push(n.id)}),s(r.stale,function(n){return delete t.store.elements[n]}),s(this.store.elements,function(n){o.active.indexOf(n.containerId)===-1&&o.active.push(n.containerId),n.hasOwnProperty("sequence")&&i.active.indexOf(n.sequence.id)===-1&&i.active.push(n.sequence.id)}),s(this.store.containers,function(n){o.active.indexOf(n.id)===-1&&o.stale.push(n.id)}),s(o.stale,function(n){var a=t.store.containers[n].node;a.removeEventListener("scroll",t.delegate),a.removeEventListener("resize",t.delegate),delete t.store.containers[n]}),s(this.store.sequences,function(n){i.active.indexOf(n.id)===-1&&i.stale.push(n.id)}),s(i.stale,function(n){return delete t.store.sequences[n]})}/*! @license Rematrix v0.3.0

		Copyright 2018 Julian Lloyd.

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in
		all copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
		THE SOFTWARE.
	*/function D(t){if(t.constructor!==Array)throw new TypeError("Expected array.");if(t.length===16)return t;if(t.length===6){var e=b();return e[0]=t[0],e[1]=t[1],e[4]=t[2],e[5]=t[3],e[12]=t[4],e[13]=t[5],e}throw new RangeError("Expected array with either 6 or 16 values.")}function b(){for(var t=[],e=0;e<16;e++)e%5==0?t.push(1):t.push(0);return t}function ut(t,e){for(var r=D(t),i=D(e),o=[],n=0;n<4;n++)for(var a=[r[n],r[n+4],r[n+8],r[n+12]],d=0;d<4;d++){var p=d*4,f=[i[p],i[p+1],i[p+2],i[p+3]],l=a[0]*f[0]+a[1]*f[1]+a[2]*f[2]+a[3]*f[3];o[n+p]=l}return o}function dt(t){if(typeof t=="string"){var e=t.match(/matrix(3d)?\(([^)]+)\)/);if(e){var r=e[2].split(", ").map(parseFloat);return D(r)}}return b()}function lt(t){var e=Math.PI/180*t,r=b();return r[5]=r[10]=Math.cos(e),r[6]=r[9]=Math.sin(e),r[9]*=-1,r}function ht(t){var e=Math.PI/180*t,r=b();return r[0]=r[10]=Math.cos(e),r[2]=r[8]=Math.sin(e),r[2]*=-1,r}function vt(t){var e=Math.PI/180*t,r=b();return r[0]=r[5]=Math.cos(e),r[1]=r[4]=Math.sin(e),r[4]*=-1,r}function Z(t,e){var r=b();return r[0]=t,r[5]=typeof e=="number"?e:t,r}function pt(t){var e=b();return e[12]=t,e}function yt(t){var e=b();return e[13]=t,e}var J=(function(){var t={},e=document.documentElement.style;function r(i,o){if(o===void 0&&(o=e),i&&typeof i=="string"){if(t[i])return t[i];if(typeof o[i]=="string")return t[i]=i;if(typeof o["-webkit-"+i]=="string")return t[i]="-webkit-"+i;throw new RangeError('Unable to find "'+i+'" style property.')}throw new TypeError("Expected a string.")}return r.clearCache=function(){return t={}},r})();function gt(t){var e=window.getComputedStyle(t.node),r=e.position,i=t.config,o={},n=t.node.getAttribute("style")||"",a=n.match(/[\w-]+\s*:\s*[^;]+\s*/gi)||[];o.computed=a?a.map(function(g){return g.trim()}).join("; ")+";":"",o.generated=a.some(function(g){return g.match(/visibility\s?:\s?visible/i)})?o.computed:a.concat(["visibility: visible"]).map(function(g){return g.trim()}).join("; ")+";";var d=parseFloat(e.opacity),p=isNaN(parseFloat(i.opacity))?parseFloat(e.opacity):parseFloat(i.opacity),f={computed:d!==p?"opacity: "+d+";":"",generated:d!==p?"opacity: "+p+";":""},l=[];if(parseFloat(i.distance)){var c=i.origin==="top"||i.origin==="bottom"?"Y":"X",v=i.distance;(i.origin==="top"||i.origin==="left")&&(v=/^-/.test(v)?v.substr(1):"-"+v);var E=v.match(/(^-?\d+\.?\d?)|(em$|px$|%$)/g),y=E[0],j=E[1];switch(j){case"em":v=parseInt(e.fontSize)*y;break;case"px":v=y;break;case"%":v=c==="Y"?t.node.getBoundingClientRect().height*y/100:t.node.getBoundingClientRect().width*y/100;break;default:throw new RangeError("Unrecognized or missing distance unit.")}c==="Y"?l.push(yt(v)):l.push(pt(v))}i.rotate.x&&l.push(lt(i.rotate.x)),i.rotate.y&&l.push(ht(i.rotate.y)),i.rotate.z&&l.push(vt(i.rotate.z)),i.scale!==1&&(i.scale===0?l.push(Z(2e-4)):l.push(Z(i.scale)));var h={};if(l.length){h.property=J("transform"),h.computed={raw:e[h.property],matrix:dt(e[h.property])},l.unshift(h.computed.matrix);var Lt=l.reduce(ut);h.generated={initial:h.property+": matrix3d("+Lt.join(", ")+");",final:h.property+": matrix3d("+h.computed.matrix.join(", ")+");"}}else h.generated={initial:"",final:""};var u={};if(f.generated||h.generated.initial){u.property=J("transition"),u.computed=e[u.property],u.fragments=[];var ot=i.delay,$=i.duration,x=i.easing;f.generated&&u.fragments.push({delayed:"opacity "+$/1e3+"s "+x+" "+ot/1e3+"s",instant:"opacity "+$/1e3+"s "+x+" 0s"}),h.generated.initial&&u.fragments.push({delayed:h.property+" "+$/1e3+"s "+x+" "+ot/1e3+"s",instant:h.property+" "+$/1e3+"s "+x+" 0s"});var Mt=u.computed&&!u.computed.match(/all 0s|none 0s/);Mt&&u.fragments.unshift({delayed:u.computed,instant:u.computed});var at=u.fragments.reduce(function(g,N,st){return g.delayed+=st===0?N.delayed:", "+N.delayed,g.instant+=st===0?N.instant:", "+N.instant,g},{delayed:"",instant:""});u.generated={delayed:u.property+": "+at.delayed+";",instant:u.property+": "+at.instant+";"}}else u.generated={delayed:"",instant:""};return{inline:o,opacity:f,position:r,transform:h,transition:u}}function R(t,e){e.split(";").forEach(function(r){var i=r.split(":"),o=i[0],n=i.slice(1);o&&n&&(t.style[o.trim()]=n.join(":"))})}function z(t){var e=this,r;try{s(P(t),function(i){var o=i.getAttribute("data-sr-id");if(o!==null){r=!0;var n=e.store.elements[o];n.callbackTimer&&window.clearTimeout(n.callbackTimer.clock),R(n.node,n.styles.inline.generated),i.removeAttribute("data-sr-id"),delete e.store.elements[o]}})}catch(i){return w.call(this,"Clean failed.",i.message)}if(r)try{V.call(this)}catch(i){return w.call(this,"Clean failed.",i.message)}}function bt(){var t=this;s(this.store.elements,function(e){R(e.node,e.styles.inline.generated),e.node.removeAttribute("data-sr-id")}),s(this.store.containers,function(e){var r=e.node===document.documentElement?window:e.node;r.removeEventListener("scroll",t.delegate),r.removeEventListener("resize",t.delegate)}),this.store={containers:{},elements:{},history:[],sequences:{}}}function q(t){for(var e=[],r=arguments.length-1;r-- >0;)e[r]=arguments[r+1];if(A(t))return s(e,function(i){s(i,function(o,n){A(o)?((!t[n]||!A(t[n]))&&(t[n]={}),q(t[n],o)):t[n]=o})}),t;throw new TypeError("Target must be an object literal.")}function L(t){return t===void 0&&(t=navigator.userAgent),/Android|iPhone|iPad|iPod/i.test(t)}var F=(function(){var t=0;return function(){return t++}})();function K(){var t=this;V.call(this),s(this.store.elements,function(e){var r=[e.styles.inline.generated];e.visible?(r.push(e.styles.opacity.computed),r.push(e.styles.transform.generated.final),e.revealed=!0):(r.push(e.styles.opacity.generated),r.push(e.styles.transform.generated.initial),e.revealed=!1),R(e.node,r.filter(function(i){return i!==""}).join(" "))}),s(this.store.containers,function(e){var r=e.node===document.documentElement?window:e.node;r.addEventListener("scroll",t.delegate),r.addEventListener("resize",t.delegate)}),this.delegate(),this.initTimeout=null}function S(t,e){e===void 0&&(e={});var r=e.pristine||this.pristine,i=t.config.useDelay==="always"||t.config.useDelay==="onload"&&r||t.config.useDelay==="once"&&!t.seen,o=t.visible&&!t.revealed,n=!t.visible&&t.revealed&&t.config.reset;if(e.reveal||o)return mt.call(this,t,i);if(e.reset||n)return wt.call(this,t)}function mt(t,e){var r=[t.styles.inline.generated,t.styles.opacity.computed,t.styles.transform.generated.final];e?r.push(t.styles.transition.generated.delayed):r.push(t.styles.transition.generated.instant),t.revealed=t.seen=!0,R(t.node,r.filter(function(i){return i!==""}).join(" ")),Q.call(this,t,e)}function wt(t){var e=[t.styles.inline.generated,t.styles.opacity.generated,t.styles.transform.generated.initial,t.styles.transition.generated.instant];t.revealed=!1,R(t.node,e.filter(function(r){return r!==""}).join(" ")),Q.call(this,t)}function Q(t,e){var r=this,i=e?t.config.duration+t.config.delay:t.config.duration,o=t.revealed?t.config.beforeReveal:t.config.beforeReset,n=t.revealed?t.config.afterReveal:t.config.afterReset,a=0;t.callbackTimer&&(a=Date.now()-t.callbackTimer.start,window.clearTimeout(t.callbackTimer.clock)),o(t.node),t.callbackTimer={start:Date.now(),clock:window.setTimeout(function(){n(t.node),t.callbackTimer=null,t.revealed&&!t.config.reset&&t.config.cleanup&&z.call(r,t.node)},i-a)}}function _(t,e){if(e===void 0&&(e=this.pristine),!t.visible&&t.revealed&&t.config.reset)return S.call(this,t,{reset:!0});var r=this.store.sequences[t.sequence.id],i=t.sequence.index;if(r){var o=new tt(r,"visible",this.store),n=new tt(r,"revealed",this.store);if(r.models={visible:o,revealed:n},!n.body.length){var a=r.members[o.body[0]],d=this.store.elements[a];if(d)return M.call(this,r,o.body[0],-1,e),M.call(this,r,o.body[0],1,e),S.call(this,d,{reveal:!0,pristine:e})}if(!r.blocked.head&&i===[].concat(n.head).pop()&&i>=[].concat(o.body).shift())return M.call(this,r,i,-1,e),S.call(this,t,{reveal:!0,pristine:e});if(!r.blocked.foot&&i===[].concat(n.foot).shift()&&i<=[].concat(o.body).pop())return M.call(this,r,i,1,e),S.call(this,t,{reveal:!0,pristine:e})}}function Tt(t){var e=Math.abs(t);if(!isNaN(e))this.id=F(),this.interval=Math.max(e,16),this.members=[],this.models={},this.blocked={head:!1,foot:!1};else throw new RangeError("Invalid sequence interval.")}function tt(t,e,r){var i=this;this.head=[],this.body=[],this.foot=[],s(t.members,function(o,n){var a=r.elements[o];a&&a[e]&&i.body.push(n)}),this.body.length&&s(t.members,function(o,n){var a=r.elements[o];a&&!a[e]&&(n<i.body[0]?i.head.push(n):i.foot.push(n))})}function M(t,e,r,i){var o=this,n=["head",null,"foot"][1+r],a=t.members[e+r],d=this.store.elements[a];t.blocked[n]=!0,setTimeout(function(){t.blocked[n]=!1,d&&_.call(o,d,i)},t.interval)}function et(t,e,r){var i=this;e===void 0&&(e={}),r===void 0&&(r=!1);var o=[],n,a=e.interval||O.interval;try{a&&(n=new Tt(a));var d=P(t);if(!d.length)throw new Error("Invalid reveal target.");var p=d.reduce(function(f,l){var c={},v=l.getAttribute("data-sr-id");v?(q(c,i.store.elements[v]),R(c.node,c.styles.inline.computed)):(c.id=F(),c.node=l,c.seen=!1,c.revealed=!1,c.visible=!1);var E=q({},c.config||i.defaults,e);if(!E.mobile&&L()||!E.desktop&&!L())return v&&z.call(i,c),f;var y=P(E.container)[0];if(!y)throw new Error("Invalid container.");if(!y.contains(l))return f;var j;return j=Et(y,o,i.store.containers),j===null&&(j=F(),o.push({id:j,node:y})),c.config=E,c.containerId=j,c.styles=gt(c),n&&(c.sequence={id:n.id,index:n.members.length},n.members.push(c.id)),f.push(c),f},[]);s(p,function(f){i.store.elements[f.id]=f,f.node.setAttribute("data-sr-id",f.id)})}catch(f){return w.call(this,"Reveal failed.",f.message)}s(o,function(f){i.store.containers[f.id]={id:f.id,node:f.node}}),n&&(this.store.sequences[n.id]=n),r!==!0&&(this.store.history.push({target:t,options:e}),this.initTimeout&&window.clearTimeout(this.initTimeout),this.initTimeout=window.setTimeout(K.bind(this),0))}function Et(t){for(var e=[],r=arguments.length-1;r-- >0;)e[r]=arguments[r+1];var i=null;return s(e,function(o){s(o,function(n){i===null&&n.node===t&&(i=n.id)})}),i}function jt(){var t=this;s(this.store.history,function(e){et.call(t,e.target,e.options,!0)}),K.call(this)}var Ot=function(t){return(t>0)-(t<0)||+t},rt=Math.sign||Ot;/*! @license miniraf v1.0.1

		Copyright 2018 Fisssion LLC.

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.

	*/var it=(function(){var t=Date.now();return function(e){var r=Date.now();r-t>16?(t=r,e(r)):setTimeout(function(){return it(e)},0)}})(),Rt=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||it;function nt(t,e){var r=e?t.node.clientHeight:t.node.offsetHeight,i=e?t.node.clientWidth:t.node.offsetWidth,o=0,n=0,a=t.node;do isNaN(a.offsetTop)||(o+=a.offsetTop),isNaN(a.offsetLeft)||(n+=a.offsetLeft),a=a.offsetParent;while(a);return{bounds:{top:o,right:n+i,bottom:o+r,left:n},height:r,width:i}}function kt(t){var e,r;return t.node===document.documentElement?(e=window.pageYOffset,r=window.pageXOffset):(e=t.node.scrollTop,r=t.node.scrollLeft),{top:e,left:r}}function It(t){t===void 0&&(t={});var e=this.store.containers[t.containerId];if(e){var r=Math.max(0,Math.min(1,t.config.viewFactor)),i=t.config.viewOffset,o={top:t.geometry.bounds.top+t.geometry.height*r,right:t.geometry.bounds.right-t.geometry.width*r,bottom:t.geometry.bounds.bottom-t.geometry.height*r,left:t.geometry.bounds.left+t.geometry.width*r},n={top:e.geometry.bounds.top+e.scroll.top+i.top,right:e.geometry.bounds.right+e.scroll.left-i.right,bottom:e.geometry.bounds.bottom+e.scroll.top-i.bottom,left:e.geometry.bounds.left+e.scroll.left+i.left};return o.top<n.bottom&&o.right>n.left&&o.bottom>n.top&&o.left<n.right||t.styles.position==="fixed"}}function Pt(t,e){var r=this;t===void 0&&(t={type:"init"}),e===void 0&&(e=this.store.elements),Rt(function(){var i=t.type==="init"||t.type==="resize";s(r.store.containers,function(o){i&&(o.geometry=nt.call(r,o,!0));var n=kt.call(r,o);o.scroll&&(o.direction={x:rt(n.left-o.scroll.left),y:rt(n.top-o.scroll.top)}),o.scroll=n}),s(e,function(o){(i||o.geometry===void 0)&&(o.geometry=nt.call(r,o)),o.visible=It.call(r,o)}),s(e,function(o){o.sequence?_.call(r,o):S.call(r,o)}),r.pristine=!1})}function qt(){var t=document.documentElement.style;return"transform"in t||"WebkitTransform"in t}function St(){var t=document.documentElement.style;return"transition"in t||"WebkitTransition"in t}var At="4.0.9",W,Y,X,H,U,m,B,G;function T(t){t===void 0&&(t={});var e=typeof this>"u"||Object.getPrototypeOf(this)!==T.prototype;if(e)return new T(t);if(!T.isSupported())return w.call(this,"Instantiation failed.","This browser is not supported."),I.failure();var r;try{r=m?q({},m,t):q({},O,t)}catch(o){return w.call(this,"Invalid configuration.",o.message),I.failure()}try{var i=P(r.container)[0];if(!i)throw new Error("Invalid container.")}catch(o){return w.call(this,o.message),I.failure()}return m=r,!m.mobile&&L()||!m.desktop&&!L()?(w.call(this,"This device is disabled.","desktop: "+m.desktop,"mobile: "+m.mobile),I.failure()):(I.success(),this.store={containers:{},elements:{},history:[],sequences:{}},this.pristine=!0,W=W||Pt.bind(this),Y=Y||bt.bind(this),X=X||et.bind(this),H=H||z.bind(this),U=U||jt.bind(this),Object.defineProperty(this,"delegate",{get:function(){return W}}),Object.defineProperty(this,"destroy",{get:function(){return Y}}),Object.defineProperty(this,"reveal",{get:function(){return X}}),Object.defineProperty(this,"clean",{get:function(){return H}}),Object.defineProperty(this,"sync",{get:function(){return U}}),Object.defineProperty(this,"defaults",{get:function(){return m}}),Object.defineProperty(this,"version",{get:function(){return At}}),Object.defineProperty(this,"noop",{get:function(){return!1}}),G||(G=this))}return T.isSupported=function(){return qt()&&St()},Object.defineProperty(T,"debug",{get:function(){return B||!1},set:function(t){return B=typeof t=="boolean"?t:B}}),T(),T});
