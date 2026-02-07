import{j as e}from"./index-BQHo3lY-.js";import{u as r,L as o}from"./vendor-react-C-GM1j7h.js";import{m as l,E as i}from"./vendor-icons-SDImLkab.js";const d=[{to:"/about",label:"About ProViso"},{to:"/deals",label:"Demo"}];function h({breadcrumbs:s}){const a=r();return e.jsx("nav",{className:`
        sticky top-0 z-30
        h-16
        bg-navy-900/95 backdrop-blur-md
        border-b border-border-DEFAULT
        shadow-sm
      `,children:e.jsxs("div",{className:"h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-8",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(o,{to:"/",className:"flex items-center gap-3 group","aria-label":"ProViso home",children:[e.jsx("div",{className:`
                  w-8 h-8 rounded-lg
                  bg-gradient-to-br from-gold-500 to-gold-600
                  flex items-center justify-center
                  font-serif font-semibold text-lg text-navy-900
                  group-hover:shadow-glow-gold-sm
                  transition-shadow duration-200
                `,children:"P"}),e.jsxs("span",{className:"text-lg font-semibold text-text-primary",children:["Pro",e.jsx("span",{className:"text-gold-500",children:"Viso"})]})]}),s&&s.length>0&&e.jsx("div",{className:"hidden sm:flex items-center gap-1.5 ml-2",children:s.map((t,n)=>e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(l,{className:"w-3.5 h-3.5 text-text-muted"}),t.to?e.jsx(o,{to:t.to,className:"text-sm text-text-secondary hover:text-text-primary transition-colors",children:t.label}):e.jsx("span",{className:"text-sm text-text-tertiary",children:t.label})]},n))})]}),!s&&e.jsxs("div",{className:"hidden sm:flex items-center gap-1",children:[d.map(t=>{const n=a.pathname===t.to||t.to==="/deals"&&a.pathname.startsWith("/deals");return e.jsx(o,{to:t.to,className:`
                      px-3 py-1.5 rounded-md text-sm font-medium
                      transition-colors duration-200
                      ${n?"text-gold-500":"text-text-secondary hover:text-text-primary"}
                    `,children:t.label},t.to)}),e.jsxs("a",{href:"https://github.com/haslun/proviso",target:"_blank",rel:"noopener noreferrer",className:`
                  px-3 py-1.5 rounded-md text-sm font-medium
                  text-text-secondary hover:text-text-primary
                  transition-colors duration-200
                  inline-flex items-center gap-1.5
                `,children:["GitHub",e.jsx(i,{className:"w-3 h-3"})]})]})]}),e.jsx("div",{className:"flex items-center gap-3",children:e.jsx("button",{className:`
              hidden sm:inline-flex items-center
              px-4 py-1.5
              text-sm font-medium text-gold-500
              border border-gold-500/50 rounded-md
              hover:bg-gold-500/10 hover:border-gold-500
              transition-all duration-200
            `,onClick:()=>{},children:"Sign In"})})]})})}export{h as T};
