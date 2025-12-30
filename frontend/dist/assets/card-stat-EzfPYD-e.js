import{f as n,j as t}from"./index-3tzHmsOf.js";/**
 * @license lucide-react v0.561.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M16 17h6v-6",key:"t6n2it"}],["path",{d:"m22 17-8.5-8.5-5 5L2 7",key:"x473p"}]],p=n("trending-down",l);/**
 * @license lucide-react v0.561.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]],g=n("trending-up",x),u=({title:c,value:o,trend:s,icon:r,trendLabel:d,colorFrom:e="from-blue-600",colorTo:a="to-blue-400"})=>{const i=s>=0;return t.jsxs("div",{className:"premium-card p-8 group transition-all duration-500",children:[t.jsx("div",{className:`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${e} ${a} opacity-[0.03] dark:opacity-[0.07] rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-700`}),t.jsxs("div",{className:"relative flex justify-between items-start mb-6",children:[t.jsx("div",{className:`p-4 rounded-2xl bg-gradient-to-br ${e} ${a} text-white shadow-xl shadow-${e.replace("from-","")}/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`,children:r&&t.jsx(r,{className:"w-6 h-6"})}),t.jsxs("div",{className:`
          flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter
          ${i?"bg-success/10 text-success":"bg-rose-50 dark:bg-rose-500/10 text-rose-600"}
        `,children:[i?t.jsx(g,{className:"w-3.5 h-3.5"}):t.jsx(p,{className:"w-3.5 h-3.5"}),Math.abs(s),"%"]})]}),t.jsxs("div",{className:"relative",children:[t.jsx("p",{className:"text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2",children:c}),t.jsx("h3",{className:"text-4xl font-black text-gray-900 dark:text-white tracking-tight",children:o}),t.jsxs("p",{className:"text-[10px] font-black text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-2 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity",children:[t.jsx("span",{className:`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${e} ${a}`}),d]})]})]})};export{u as S,g as T};
