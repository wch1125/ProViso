import{j as e}from"./index-DWEbi0Ni.js";import{B as f}from"./Card-CUxgOUt7.js";import{ao as p,r as b,ap as g,aq as h,s as y}from"./vendor-icons-BfZMwiYt.js";const j={sm:{container:"py-6",icon:"w-8 h-8",title:"text-sm",description:"text-xs"},md:{container:"py-12",icon:"w-12 h-12",title:"text-base",description:"text-sm"},lg:{container:"py-16",icon:"w-16 h-16",title:"text-lg",description:"text-base"}};function x({icon:i=h,title:s,description:t,action:r,size:n="md",className:l=""}){const a=j[n];return e.jsxs("div",{className:`flex flex-col items-center justify-center text-center ${a.container} ${l}`,children:[e.jsx("div",{className:"p-4 bg-surface-2/50 rounded-full mb-4",children:e.jsx(i,{className:`${a.icon} text-text-muted`})}),e.jsx("h3",{className:`font-medium text-text-secondary mb-1 ${a.title}`,children:s}),t&&e.jsx("p",{className:`text-text-muted max-w-sm ${a.description}`,children:t}),r&&e.jsx("div",{className:"mt-4",children:e.jsx(f,{variant:r.variant||"secondary",size:n==="lg"?"md":"sm",icon:r.icon,onClick:r.onClick,children:r.label})})]})}function k({searchTerm:i,onClear:s}){return e.jsx(x,{icon:b,title:"No results found",description:i?`No items match "${i}". Try adjusting your search or filters.`:"Try adjusting your search or filters.",action:s?{label:"Clear filters",onClick:s,variant:"ghost"}:void 0})}function C({itemType:i="items",onCreate:s,createLabel:t="Create first"}){return e.jsx(x,{icon:p,title:`No ${i} yet`,description:`Get started by creating your first ${i.replace(/s$/,"")}.`,action:s?{label:t,onClick:s,variant:"primary"}:void 0})}function F(){return e.jsx(x,{icon:g,title:"No changes",description:"This version has no changes from the previous version.",size:"sm"})}const v={sm:"px-3 py-1.5 text-sm",md:"px-4 py-2 text-sm",lg:"px-4 py-3 text-base"};function I({label:i,helpText:s,error:t,size:r="md",icon:n,className:l="",id:a,disabled:m,...u}){const o=a||`input-${Math.random().toString(36).slice(2,9)}`;return e.jsxs("div",{className:"w-full",children:[i&&e.jsx("label",{htmlFor:o,className:"block text-sm font-medium text-text-secondary mb-1.5",children:i}),e.jsxs("div",{className:"relative",children:[n&&e.jsx("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted",children:n}),e.jsx("input",{id:o,className:`
            block w-full rounded-lg
            bg-surface-2 border
            text-text-primary placeholder-text-muted
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${t?"border-danger focus:border-danger focus:ring-danger":"border-border-strong focus:border-gold-500 focus:ring-gold-500"}
            ${n?"pl-10":""}
            ${v[r]}
            ${l}
          `,disabled:m,"aria-invalid":t?"true":"false","aria-describedby":t?`${o}-error`:s?`${o}-help`:void 0,...u})]}),t&&e.jsx("p",{id:`${o}-error`,className:"mt-1.5 text-sm text-danger",children:t}),s&&!t&&e.jsx("p",{id:`${o}-help`,className:"mt-1.5 text-sm text-text-muted",children:s})]})}const N={sm:"px-3 py-1.5 text-sm",md:"px-4 py-2 text-sm",lg:"px-4 py-3 text-base"};function z({label:i,helpText:s,error:t,size:r="md",options:n,placeholder:l,className:a="",id:m,disabled:u,...o}){const c=m||`select-${Math.random().toString(36).slice(2,9)}`;return e.jsxs("div",{className:"w-full",children:[i&&e.jsx("label",{htmlFor:c,className:"block text-sm font-medium text-text-secondary mb-1.5",children:i}),e.jsxs("div",{className:"relative",children:[e.jsxs("select",{id:c,className:`
            block w-full rounded-lg
            bg-surface-2 border
            text-text-primary
            appearance-none
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0
            disabled:opacity-50 disabled:cursor-not-allowed
            pr-10
            ${t?"border-danger focus:border-danger focus:ring-danger":"border-border-strong focus:border-gold-500 focus:ring-gold-500"}
            ${N[r]}
            ${a}
          `,disabled:u,"aria-invalid":t?"true":"false","aria-describedby":t?`${c}-error`:s?`${c}-help`:void 0,...o,children:[l&&e.jsx("option",{value:"",disabled:!0,children:l}),n.map(d=>e.jsx("option",{value:d.value,disabled:d.disabled,children:d.label},d.value))]}),e.jsx("div",{className:"absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted",children:e.jsx(y,{className:"h-4 w-4"})})]}),t&&e.jsx("p",{id:`${c}-error`,className:"mt-1.5 text-sm text-danger",children:t}),s&&!t&&e.jsx("p",{id:`${c}-help`,className:"mt-1.5 text-sm text-text-muted",children:s})]})}export{x as E,I,C as N,z as S,k as a,F as b};
