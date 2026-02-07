import{j as e}from"./index-MBjjlW4L.js";function b({label:o,helpText:d,error:t,showCharCount:c=!1,maxLength:r,className:l="",id:n,disabled:x,rows:f=4,value:a,...u}){const s=n||`textarea-${Math.random().toString(36).slice(2,9)}`,i=typeof a=="string"?a.length:0;return e.jsxs("div",{className:"w-full",children:[o&&e.jsx("label",{htmlFor:s,className:"block text-sm font-medium text-text-secondary mb-1.5",children:o}),e.jsx("div",{className:"relative",children:e.jsx("textarea",{id:s,rows:f,maxLength:r,value:a,className:`
            block w-full rounded-lg
            bg-surface-2 border
            text-text-primary placeholder-text-muted
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y
            px-4 py-3 text-sm
            ${t?"border-danger focus:border-danger focus:ring-danger":"border-border-strong focus:border-gold-500 focus:ring-gold-500"}
            ${l}
          `,disabled:x,"aria-invalid":t?"true":"false","aria-describedby":t?`${s}-error`:d?`${s}-help`:void 0,...u})}),e.jsxs("div",{className:"flex justify-between mt-1.5",children:[e.jsxs("div",{children:[t&&e.jsx("p",{id:`${s}-error`,className:"text-sm text-danger",children:t}),d&&!t&&e.jsx("p",{id:`${s}-help`,className:"text-sm text-text-muted",children:d})]}),c&&r&&e.jsxs("p",{className:`text-sm ${i>=r?"text-danger":"text-text-muted"}`,children:[i,"/",r]})]})]})}export{b as T};
