import{j as e}from"./index-DWEbi0Ni.js";import{h as o,L as s}from"./vendor-react-C-GM1j7h.js";import{t as r}from"./analytics-CJOMXrsP.js";import{P as l,I as d,B as c,S as m,W as x,a as g,A as p,C as u,T as h,F as f,Z as b,b as y,c as v}from"./vendor-icons-BfZMwiYt.js";import{F as w}from"./Footer-DOQfSD_4.js";import{T as j}from"./TopNav-YDNqyyRV.js";const N=[{id:"abc-acquisition",icon:c,name:"ABC Acquisition",description:"$150M leveraged buyout facility"},{id:"solar",icon:m,name:"Solar Utility",description:"200MW utility-scale solar with ITC tax equity"},{id:"wind",icon:x,name:"Wind Onshore",description:"150MW wind farm with PTC credits"},{id:"corporate",icon:g,name:"Corporate Revolver",description:"$150M revolving credit facility"}];function k({onSelectIndustry:a}){const n=o();return e.jsxs("section",{className:`
        relative overflow-hidden
        bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800
        min-h-[80vh] flex items-center
        px-6 py-20
      `,children:[e.jsx("div",{className:`
          absolute inset-0 opacity-[0.03]
          pointer-events-none
        `,style:{backgroundImage:`
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,backgroundSize:"40px 40px"}}),e.jsx("div",{className:`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[800px] h-[800px]
          bg-gold-600/10 rounded-full blur-3xl
          pointer-events-none
        `}),e.jsxs("div",{className:"relative z-10 max-w-4xl mx-auto text-center",children:[e.jsx("div",{className:`
            inline-flex items-center gap-3 mb-8
            opacity-0 animate-fade-up
          `,style:{animationDelay:"0.1s",animationFillMode:"forwards"},children:e.jsxs("span",{className:"font-display text-3xl font-medium text-white tracking-tight",children:["Pro",e.jsx("span",{className:"text-blue-500 font-bold",children:"V"}),"iso"]})}),e.jsxs("h1",{className:`
            font-display text-4xl md:text-5xl lg:text-6xl font-medium text-white
            tracking-tight leading-tight mb-6
            opacity-0 animate-fade-up
          `,style:{animationDelay:"0.2s",animationFillMode:"forwards"},children:["Credit Agreements as"," ",e.jsx("span",{className:"text-gold-400",children:"Code"})]}),e.jsx("p",{className:`
            font-display text-lg md:text-xl text-white/70 italic mb-4
            opacity-0 animate-fade-up
          `,style:{animationDelay:"0.3s",animationFillMode:"forwards"},children:"Read like legal documents. Run like programs."}),e.jsx("p",{className:`
            text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-6 leading-relaxed
            opacity-0 animate-fade-up
          `,style:{animationDelay:"0.4s",animationFillMode:"forwards"},children:"Transform weeks of legal analysis into milliseconds of certainty. Compliance checking, basket tracking, and pro forma simulation — powered by your actual credit agreement."}),e.jsxs("div",{className:`
            flex items-center justify-center gap-4 mb-10
            opacity-0 animate-fade-up
          `,style:{animationDelay:"0.45s",animationFillMode:"forwards"},children:[e.jsxs("button",{onClick:()=>n("/demo"),className:`
              flex items-center gap-2 px-5 py-2.5
              bg-gold-600 hover:bg-gold-500
              text-navy-900 font-medium rounded-lg
              transition-all duration-200
              shadow-lg shadow-gold-600/25 hover:shadow-gold-500/30
            `,children:[e.jsx(l,{className:"w-4 h-4"}),"Explore a Live Deal"]}),e.jsxs(s,{to:"/about",className:`
              inline-flex items-center gap-2 px-4 py-2.5
              text-gold-400 hover:text-gold-300
              text-sm font-medium
              border border-gold-600/30 hover:border-gold-500/50
              rounded-lg transition-colors
            `,children:[e.jsx(d,{className:"w-4 h-4"}),"Learn more"]})]}),e.jsx("div",{className:`
            grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto
            opacity-0 animate-fade-up
          `,style:{animationDelay:"0.5s",animationFillMode:"forwards"},children:N.map(t=>{const i=t.icon;return e.jsx("button",{onClick:()=>{r(t.id),a(t.id)},className:`
                  group relative overflow-hidden text-left
                  bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl
                  p-5
                  hover:bg-white/10 hover:border-gold-500/50
                  focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-navy-700
                  transition-all duration-200
                `,children:e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:`
                      w-10 h-10 flex-shrink-0
                      bg-gold-600/20 border border-gold-600/30
                      rounded-lg flex items-center justify-center
                      group-hover:scale-110 group-hover:bg-gold-600/30
                      transition-all duration-200
                    `,children:e.jsx(i,{className:"w-5 h-5 text-gold-400"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("h3",{className:"font-medium text-white mb-1 flex items-center gap-2",children:[t.name,e.jsx(p,{className:"w-4 h-4 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity"})]}),e.jsx("p",{className:"text-sm text-white/60 leading-snug",children:t.description})]})]})},t.id)})})]})]})}function F({icon:a,title:n,description:t,delay:i=0}){return e.jsxs("div",{className:`
        group relative overflow-hidden
        bg-surface-1 border border-border-DEFAULT rounded-xl
        p-6 md:p-8
        shadow-sm hover:shadow-elevation-2
        transform hover:-translate-y-1
        transition-all duration-300
        opacity-0 animate-fade-up
      `,style:{animationDelay:`${i}ms`,animationFillMode:"forwards"},children:[e.jsx("div",{className:`
          absolute top-0 left-0 right-0 h-1
          bg-gradient-to-r from-gold-600 to-gold-400
          transform scale-x-0 origin-left
          group-hover:scale-x-100
          transition-transform duration-300
        `}),e.jsx("div",{className:`
          w-12 h-12 mb-4
          bg-gradient-to-br from-gold-600/20 to-gold-600/5
          border border-gold-600/20
          rounded-lg flex items-center justify-center
          group-hover:scale-110 group-hover:border-gold-600/40
          transition-all duration-300
        `,children:e.jsx(a,{className:"w-6 h-6 text-gold-500"})}),e.jsx("h3",{className:"font-display text-lg font-medium text-text-primary mb-2",children:n}),e.jsx("p",{className:"text-sm text-text-tertiary leading-relaxed",children:t})]})}const C=[{icon:u,title:"Instant Compliance",description:"Check covenant compliance in milliseconds, not weeks. Get definitive answers with citations to specific provisions."},{icon:h,title:"Basket Tracking",description:"Automatic utilization tracking with full audit trail. Know exactly how much capacity remains for investments, dividends, and debt."},{icon:f,title:"Plain English",description:"Source files read like the credit agreement. Lawyers can review and understand the logic without learning to code."},{icon:b,title:"Pro Forma Simulation",description:'"What if" analysis for proposed transactions. See instantly whether that acquisition or dividend would trip a covenant.'},{icon:y,title:"Cure Rights",description:"Built-in mechanics for covenant breaches. Track cure availability, equity contributions, and grace periods automatically."},{icon:v,title:"Project Finance",description:"Phases, milestones, waterfalls, and reserves. Full support for construction loans with draw conditions and CP checklists."}];function D(){return e.jsx("section",{className:"bg-surface-0 py-20 px-6",children:e.jsxs("div",{className:"max-w-6xl mx-auto",children:[e.jsxs("div",{className:"text-center mb-12 opacity-0 animate-fade-up",style:{animationDelay:"0.1s",animationFillMode:"forwards"},children:[e.jsx("h2",{className:"font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4",children:"What This Does"}),e.jsx("p",{className:"text-lg text-text-secondary max-w-2xl mx-auto",children:"Everything you need to make credit agreements executable"})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:C.map((a,n)=>e.jsx(F,{icon:a.icon,title:a.title,description:a.description,delay:100+n*50},a.title))})]})})}function A(){const a=o(),n=t=>{switch(t){case"abc-acquisition":a("/deals/abc-acquisition/negotiate");break;case"solar":a("/deals/solar-demo/monitor");break;case"wind":a("/deals/wind-demo/monitor");break;case"corporate":a("/deals/corporate-demo/monitor");break;default:a("/deals")}};return e.jsxs("div",{className:"min-h-screen bg-surface-0",children:[e.jsx(j,{}),e.jsx(k,{onSelectIndustry:n}),e.jsx(D,{}),e.jsx(w,{})]})}export{A as Landing,A as default};
