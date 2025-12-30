import{f as n,l as r,e as i}from"./index-CyxQwsQl.js";import{u}from"./adslot-DC0mcUoM.js";/**
 * @license lucide-react v0.561.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",key:"1jg4f8"}]],S=n("facebook",h);function O(t,c=!0){return u({queryKey:["seo",t],queryFn:async()=>{var o;const e=await i.get(`/public/seo/${t}`),a=((o=e.data)==null?void 0:o.data)||e.data;try{localStorage.setItem(`seo_${t}`,JSON.stringify(a))}catch(s){r.error("Failed to cache SEO:",s)}return a},initialData:(()=>{try{const e=localStorage.getItem(`seo_${t}`);if(e)return JSON.parse(e)}catch(e){r.error("Failed to parse cached SEO:",e)}})(),enabled:c,staleTime:1e3*60*5,refetchOnWindowFocus:!1})}export{S as F,O as u};
