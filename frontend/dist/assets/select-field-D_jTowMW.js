import{R as m,j as e}from"./index-3tzHmsOf.js";import{C as u}from"./user-BF6dZPLy.js";const j=m.forwardRef(({label:n,icon:s,error:t,success:i,hint:l,options:d,className:o="",id:c,...x},p)=>{const a=c||n.replace(/\s+/g,"-").toLowerCase();return e.jsxs("div",{className:"space-y-2.5 group w-full",children:[e.jsxs("div",{className:"flex justify-between items-end px-1",children:[e.jsx("label",{htmlFor:a,className:"form-label group-focus-within:text-primary",children:n}),i&&!t&&e.jsx("span",{className:"text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95",children:"تم الاختيار"})]}),e.jsxs("div",{className:"relative",children:[s&&e.jsx("div",{className:`
                        absolute top-1/2 -translate-y-1/2 transition-all duration-500 z-10 pointer-events-none
                        start-6
                        ${t?"text-red-400":i?"text-emerald-400":"text-gray-300 group-focus-within:text-primary group-focus-within:scale-110"}
                    `,children:e.jsx(s,{size:18})}),e.jsx("select",{ref:p,id:a,className:`
                        select-field
                        pe-16
                        ${s?"ps-16":"ps-6"} 
                        ${t?"error":i?"success":""} 
                        ${o}
                    `,"aria-invalid":!!t,"aria-describedby":t?`${a}-error`:l?`${a}-hint`:void 0,...x,children:d.map(r=>e.jsx("option",{value:r.value,className:"bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100",children:r.label},r.value))}),e.jsx("div",{className:"absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors end-6",children:e.jsx(u,{size:18,strokeWidth:3})})]}),t?e.jsx("p",{id:`${a}-error`,className:"text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1",children:t}):l?e.jsx("p",{id:`${a}-hint`,className:"text-[10px] text-gray-400 font-bold px-2",children:l}):null]})});export{j as S};
