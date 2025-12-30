import{R as c,j as e}from"./index-CyxQwsQl.js";const m=c.forwardRef(({label:r,icon:s,error:a,success:i,hint:l,className:n="",id:x,...d},o)=>{const t=x||r.replace(/\s+/g,"-").toLowerCase();return e.jsxs("div",{className:"space-y-2.5 group w-full",children:[e.jsxs("div",{className:"flex justify-between items-end px-1",children:[e.jsx("label",{htmlFor:t,className:"form-label group-focus-within:text-primary",children:r}),i&&!a&&e.jsx("span",{className:"text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95",children:"تم الحفظ"})]}),e.jsxs("div",{className:"relative",children:[s&&e.jsx("div",{className:`
                        absolute top-6 transition-all duration-500 z-10 pointer-events-none
                        start-6
                        ${a?"text-red-400":i?"text-emerald-400":"text-gray-300 group-focus-within:text-primary group-focus-within:scale-110"}
                    `,children:e.jsx(s,{size:18})}),e.jsx("textarea",{ref:o,id:t,className:`
                        textarea-field
                        ${s?"ps-16":""} 
                        ${a?"error":i?"success":""} 
                        ${n}
                    `,"aria-invalid":!!a,"aria-describedby":a?`${t}-error`:l?`${t}-hint`:void 0,...d})]}),a?e.jsx("p",{id:`${t}-error`,className:"text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1",children:a}):l?e.jsx("p",{id:`${t}-hint`,className:"text-[10px] text-gray-400 font-bold px-2",children:l}):null]})});export{m as T};
