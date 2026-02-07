import{j as e}from"./index-DWEbi0Ni.js";import{u as l,L as n}from"./vendor-react-C-GM1j7h.js";import{l as r}from"./vendor-icons-BfZMwiYt.js";const i=[{to:"/about",label:"About ProViso"},{to:"/deals",label:"Demo"}];function c({breadcrumbs:s}){const o=l();return e.jsx("nav",{className:`
        sticky top-0 z-30
        h-16
        bg-navy-900/95 backdrop-blur-md
        border-b border-border-DEFAULT
        shadow-sm
      `,children:e.jsxs("div",{className:"h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-8",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{to:"/",className:"flex items-center gap-3 group","aria-label":"ProViso home",children:e.jsxs("span",{className:"text-xl font-semibold text-text-primary tracking-tight",children:["Pro",e.jsx("span",{className:"text-blue-700 font-bold",children:"V"}),"iso"]})}),s&&s.length>0&&e.jsx("div",{className:"hidden sm:flex items-center gap-1.5 ml-2",children:s.map((t,a)=>e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(r,{className:"w-3.5 h-3.5 text-text-muted"}),t.to?e.jsx(n,{to:t.to,className:"text-sm text-text-secondary hover:text-text-primary transition-colors",children:t.label}):e.jsx("span",{className:"text-sm text-text-tertiary",children:t.label})]},a))})]}),!s&&e.jsx("div",{className:"hidden sm:flex items-center gap-1",children:i.map(t=>{const a=o.pathname===t.to||t.to==="/deals"&&o.pathname.startsWith("/deals");return e.jsx(n,{to:t.to,className:`
                      px-3 py-1.5 rounded-md text-sm font-medium
                      transition-colors duration-200
                      ${a?"text-gold-500":"text-text-secondary hover:text-text-primary"}
                    `,children:t.label},t.to)})})]}),e.jsx("div",{className:"flex items-center gap-3",children:e.jsx("button",{className:`
              hidden sm:inline-flex items-center
              px-4 py-1.5
              text-sm font-medium text-gold-500
              border border-gold-500/50 rounded-md
              hover:bg-gold-500/10 hover:border-gold-500
              transition-all duration-200
            `,onClick:()=>{},children:"Sign In"})})]})})}export{c as T};
