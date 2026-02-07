import{j as e}from"./index-DxtHVOyo.js";import{r as l}from"./vendor-react-C-GM1j7h.js";import{X as x}from"./vendor-icons-SDImLkab.js";const y={sm:"max-w-md",md:"max-w-lg",lg:"max-w-2xl",xl:"max-w-4xl"};function p({isOpen:d,onClose:r,title:t,size:o="md",showCloseButton:a=!0,closeOnOverlayClick:m=!0,closeOnEscape:i=!0,children:c,footer:n}){const s=l.useCallback(u=>{u.key==="Escape"&&i&&r()},[i,r]);return l.useEffect(()=>(d&&(document.addEventListener("keydown",s),document.body.style.overflow="hidden"),()=>{document.removeEventListener("keydown",s),document.body.style.overflow=""}),[d,s]),d?e.jsxs("div",{className:"fixed inset-0 z-50 overflow-y-auto",children:[e.jsx("div",{className:"fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity",onClick:m?r:void 0,"aria-hidden":"true"}),e.jsx("div",{className:"flex min-h-full items-center justify-center p-4",children:e.jsxs("div",{className:`
            relative w-full ${y[o]}
            bg-industry-cardBg border border-industry-borderDefault
            rounded-xl shadow-2xl
            transform transition-all
          `,role:"dialog","aria-modal":"true","aria-labelledby":t?"modal-title":void 0,children:[(t||a)&&e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-industry-borderDefault",children:[t&&e.jsx("h2",{id:"modal-title",className:"text-lg font-semibold text-industry-textPrimary",children:t}),a&&e.jsx("button",{type:"button",className:`
                    p-1 rounded-lg
                    text-industry-textSecondary hover:text-industry-textPrimary
                    hover:bg-industry-cardBgHover
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-industry-primary
                  `,onClick:r,"aria-label":"Close modal",children:e.jsx(x,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"px-6 py-4",children:c}),n&&e.jsx("div",{className:"flex items-center justify-end gap-3 px-6 py-4 border-t border-industry-borderDefault",children:n})]})})]}):null}export{p as M};
