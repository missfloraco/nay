import{f as s,r as o,j as a}from"./index-CyxQwsQl.js";/**
 * @license lucide-react v0.561.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],i=s("moon",l);/**
 * @license lucide-react v0.561.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],n=s("sun",d),h=()=>{const[t,r]=o.useState(()=>{const e=localStorage.getItem("theme");return e==="dark"||e==="light"?e:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"});o.useEffect(()=>{const e=document.documentElement;t==="dark"?(e.classList.add("dark-mode"),e.classList.remove("light-mode")):(e.classList.remove("dark-mode"),e.classList.add("light-mode")),localStorage.setItem("theme",t)},[t]);const c=()=>{r(e=>e==="light"?"dark":"light")};return a.jsx("button",{onClick:c,className:"p-2.5 rounded-2xl bg-gray-50 text-gray-400 hover:text-primary hover:bg-white border border-transparent hover:border-gray-100 transition-all active:scale-95 group shadow-sm hover:shadow-md","aria-label":"Toggle Dark Mode",title:t==="light"?"تفعيل الوضع الليلي":"تفعيل الوضع المضيء",children:a.jsxs("div",{className:"relative w-5 h-5",children:[a.jsx(n,{size:20,className:`absolute inset-0 transition-all duration-500 transform ${t==="light"?"scale-0 rotate-90 opacity-0":"scale-100 rotate-0 opacity-100 text-yellow-500"}`}),a.jsx(i,{size:20,className:`absolute inset-0 transition-all duration-500 transform ${t==="dark"?"scale-0 -rotate-90 opacity-0":"scale-100 rotate-0 opacity-100"}`})]})})};export{h as T};
