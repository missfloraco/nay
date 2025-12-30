import{R as m,j as e}from"./index-3tzHmsOf.js";const f=m.forwardRef(({label:n,labelExtras:d,icon:s,error:a,success:i,hint:l,endContent:r,className:c="",id:x,...p},o)=>{const t=x||n.replace(/\s+/g,"-").toLowerCase();return e.jsxs("div",{className:"space-y-2.5 group w-full",children:[e.jsxs("div",{className:"flex justify-between items-center px-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("label",{htmlFor:t,className:"form-label group-focus-within:text-primary mb-0",children:n}),d]}),i&&!a&&e.jsx("span",{className:"text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95",children:"تم التحقق"})]}),e.jsxs("div",{className:"relative",children:[s&&e.jsx("div",{className:`
                        absolute top-1/2 -translate-y-1/2 transition-all duration-500 z-10 pointer-events-none
                        end-6
                        ${a?"text-red-400":i?"text-emerald-400":"text-gray-300 group-focus-within:text-primary group-focus-within:scale-110"}
                    `,children:e.jsx(s,{size:18})}),e.jsx("input",{ref:o,id:t,className:`
                        input-field
                        ${s?"pe-16":""} 
                        ${a?"error":i?"success":""} 
                        ${c}
                    `,"aria-invalid":!!a,"aria-describedby":a?`${t}-error`:l?`${t}-hint`:void 0,...p}),r&&e.jsx("div",{className:"absolute top-1/2 -translate-y-1/2 end-6 z-20",children:r})]}),a?e.jsx("p",{id:`${t}-error`,className:"text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1",children:a}):l?e.jsx("p",{id:`${t}-hint`,className:"text-[10px] text-gray-400 font-bold px-2",children:l}):null]})});export{f as I};
