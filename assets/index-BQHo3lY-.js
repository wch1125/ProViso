const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Landing-BEkw5vSQ.js","assets/vendor-react-C-GM1j7h.js","assets/analytics-CJOMXrsP.js","assets/vendor-icons-SDImLkab.js","assets/Footer-CTDyV2Hc.js","assets/TopNav-x9KqDvYR.js","assets/About-B5A-kXZe.js","assets/GuidedDemo-DId8IQ2l.js","assets/DiffViewer-ypfMvfkr.js","assets/Modal-C3WxPkda.js","assets/DealList-DkT4_ifo.js","assets/Card--cjZKbmF.js","assets/vendor-charts-DE_Rm1Qj.js","assets/Select-Df4tb1h6.js","assets/ActivityFeed-B9be216U.js","assets/NegotiationStudio-CJo6WGCW.js","assets/Tabs-Bt6Z1YBU.js","assets/ConfirmationModal-BxWjRa8b.js","assets/versionDiff-k5R3RNXp.js","assets/ClosingDashboard-BbwRUgCc.js","assets/TextArea-Y-GFwIuB.js","assets/MonitoringDashboard-BLTwY7ga.js"])))=>i.map(i=>d[i]);
var Tt=Object.defineProperty;var Dt=(i,e,t)=>e in i?Tt(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var C=(i,e,t)=>Dt(i,typeof e!="symbol"?e+"":e,t);import{a as It,b as wt,r as l,u as _t,B as Rt,d as Pt,e as X,N as Nt,f as xt}from"./vendor-react-C-GM1j7h.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();var Se={exports:{}},oe={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Fe;function Mt(){if(Fe)return oe;Fe=1;var i=It(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,n=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,r={key:!0,ref:!0,__self:!0,__source:!0};function s(o,c,d){var f,h={},y=null,T=null;d!==void 0&&(y=""+d),c.key!==void 0&&(y=""+c.key),c.ref!==void 0&&(T=c.ref);for(f in c)a.call(c,f)&&!r.hasOwnProperty(f)&&(h[f]=c[f]);if(o&&o.defaultProps)for(f in c=o.defaultProps,c)h[f]===void 0&&(h[f]=c[f]);return{$$typeof:e,type:o,key:y,ref:T,props:h,_owner:n.current}}return oe.Fragment=t,oe.jsx=s,oe.jsxs=s,oe}var Ue;function Bt(){return Ue||(Ue=1,Se.exports=Mt()),Se.exports}var E=Bt(),ue={},$e;function Ot(){if($e)return ue;$e=1;var i=wt();return ue.createRoot=i.createRoot,ue.hydrateRoot=i.hydrateRoot,ue}var kt=Ot();const Lt="modulepreload",Ft=function(i){return"/"+i},Ve={},Z=function(e,t,a){let n=Promise.resolve();if(t&&t.length>0){let s=function(d){return Promise.all(d.map(f=>Promise.resolve(f).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));n=s(t.map(d=>{if(d=Ft(d),d in Ve)return;Ve[d]=!0;const f=d.endsWith(".css"),h=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${h}`))return;const y=document.createElement("link");if(y.rel=f?"stylesheet":Lt,f||(y.as="script"),y.crossOrigin="",y.href=d,c&&y.setAttribute("nonce",c),document.head.appendChild(y),f)return new Promise((T,R)=>{y.addEventListener("load",T),y.addEventListener("error",()=>R(new Error(`Unable to preload CSS for ${d}`)))})}))}function r(s){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=s,window.dispatchEvent(o),!o.defaultPrevented)throw s}return n.then(s=>{for(const o of s||[])o.status==="rejected"&&r(o.reason);return e().catch(r)})};let be=null;async function Ut(){if(be)return be;try{const i=await Z(()=>import("./parser.generated-BVYwSUdG.js"),[]);return be=i,i}catch{throw new Error('Parser not generated. Run "npm run build:grammar" first.')}}function $t(i){const e=new Set,t=[];for(const a of i){let n;switch(a.type){case"literal":n=a.text??"";break;case"class":n=a.description??"[character class]";break;case"any":n="any character";break;case"end":n="end of input";break;case"other":n=a.description??"unknown";break;default:n=a.description??a.text??"unknown"}n&&!e.has(n)&&(e.add(n),t.push(n))}return t}async function Je(i){try{return{success:!0,ast:(await Ut()).parse(i),source:i}}catch(e){const t=e,a={message:t.message};return t.location&&(a.location=t.location),t.expected&&(a.expected=$t(t.expected)),t.found!==void 0&&(a.found=t.found),{success:!1,error:a,source:i}}}function J(i){return i!==null&&typeof i=="object"}function Te(i){return J(i)&&i.type==="Comparison"}function Vt(i){return J(i)&&i.type==="FunctionCall"}function qe(i){return typeof i=="object"&&i!==null&&"periods"in i&&Array.isArray(i.periods)}function pe(i){return typeof i=="object"&&i!==null&&"type"in i&&i.type==="AllOf"}function me(i){return typeof i=="object"&&i!==null&&"type"in i&&i.type==="AnyOf"}class Y{constructor(e){C(this,"ast");C(this,"definitions",new Map);C(this,"covenants",new Map);C(this,"baskets",new Map);C(this,"conditions",new Map);C(this,"prohibitions",new Map);C(this,"events",new Map);C(this,"phases",new Map);C(this,"transitions",new Map);C(this,"currentPhase",null);C(this,"phaseHistory",[]);C(this,"satisfiedConditions",new Set);C(this,"milestones",new Map);C(this,"technicalMilestones",new Map);C(this,"technicalMilestoneAchievements",new Map);C(this,"regulatoryRequirements",new Map);C(this,"regulatoryStatuses",new Map);C(this,"performanceGuarantees",new Map);C(this,"degradationSchedules",new Map);C(this,"seasonalAdjustments",new Map);C(this,"taxEquityStructures",new Map);C(this,"taxCredits",new Map);C(this,"depreciationSchedules",new Map);C(this,"flipEvents",new Map);C(this,"triggeredFlips",new Map);C(this,"milestoneAchievements",new Map);C(this,"reserves",new Map);C(this,"reserveBalances",new Map);C(this,"waterfalls",new Map);C(this,"conditionsPrecedent",new Map);C(this,"cpStatuses",new Map);C(this,"simpleFinancialData",{});C(this,"multiPeriodData",null);C(this,"evaluationPeriod",null);C(this,"basketLedger",[]);C(this,"basketUtilization",new Map);C(this,"basketAccumulation",new Map);C(this,"eventDefaults",new Set);C(this,"appliedAmendments",[]);C(this,"cureStates",new Map);C(this,"cureUsage",new Map);C(this,"evaluationContext",{});C(this,"definitionEvalStack",new Set);C(this,"definitionEvalCache",new Map);this.ast=e,this.loadStatements()}loadStatements(){for(const e of this.ast.statements)this.loadStatement(e)}loadStatement(e){switch(e.type){case"Define":this.definitions.set(e.name,e);break;case"Covenant":this.covenants.set(e.name,e);break;case"Basket":this.baskets.set(e.name,e),this.basketUtilization.has(e.name)||this.basketUtilization.set(e.name,0);break;case"Condition":this.conditions.set(e.name,e);break;case"Prohibit":this.prohibitions.set(e.target,e);break;case"Event":this.events.set(e.name,e);break;case"Phase":this.phases.set(e.name,e),this.currentPhase===null&&e.from===null&&this.setCurrentPhase(e.name);break;case"Transition":this.transitions.set(e.name,e);break;case"Milestone":this.milestones.set(e.name,e);break;case"TechnicalMilestone":this.technicalMilestones.set(e.name,e);break;case"RegulatoryRequirement":if(this.regulatoryRequirements.set(e.name,e),this.regulatoryStatuses.set(e.name,e.status),e.status==="approved"){this.satisfiedConditions.add(e.name);for(const t of e.satisfies)this.satisfiedConditions.add(t)}break;case"PerformanceGuarantee":this.performanceGuarantees.set(e.name,e);break;case"DegradationSchedule":this.degradationSchedules.set(e.name,e);break;case"SeasonalAdjustment":this.seasonalAdjustments.set(e.name,e);break;case"TaxEquityStructure":this.taxEquityStructures.set(e.name,e);break;case"TaxCredit":this.taxCredits.set(e.name,e);for(const t of e.satisfies)this.satisfiedConditions.add(t);break;case"Depreciation":this.depreciationSchedules.set(e.name,e);break;case"FlipEvent":this.flipEvents.set(e.name,e);break;case"Reserve":this.reserves.set(e.name,e),this.reserveBalances.has(e.name)||this.reserveBalances.set(e.name,0);break;case"Waterfall":this.waterfalls.set(e.name,e);break;case"ConditionsPrecedent":{this.conditionsPrecedent.set(e.name,e);const t=new Map;for(const a of e.conditions)t.set(a.name,a.status);this.cpStatuses.set(e.name,t);break}case"Amendment":break;case"Load":e.source.type==="inline"&&e.source.data&&this.loadFinancials(e.source.data);break;case"Comment":break;default:throw new Error(`Unsupported statement type: ${e.type}`)}}loadFinancials(e){if(this.definitionEvalCache.clear(),qe(e)){if(this.multiPeriodData=e,this.evaluationPeriod===null&&e.periods.length>0){const t=this.sortPeriods(e.periods.map(a=>a.period));this.evaluationPeriod=t[t.length-1]??null}}else this.simpleFinancialData={...this.simpleFinancialData,...e}}loadFinancialsFromFile(e){if(qe(e)){this.loadFinancials(e);return}e.financials&&typeof e.financials=="object"&&(this.simpleFinancialData={...this.simpleFinancialData,...e.financials}),e.adjustments&&typeof e.adjustments=="object"&&(this.simpleFinancialData={...this.simpleFinancialData,...e.adjustments});for(const[t,a]of Object.entries(e))typeof a=="number"&&(this.simpleFinancialData[t]=a)}evaluate(e){if(typeof e=="string")return this.resolveIdentifier(e);if(typeof e=="number")return e;if(!J(e))throw new Error(`Cannot evaluate expression: ${JSON.stringify(e)}`);switch(e.type){case"Number":return e.value;case"Currency":return e.value;case"Percentage":return e.value/100;case"Ratio":return e.value;case"BinaryExpression":{const t=this.evaluate(e.left),a=this.evaluate(e.right);switch(e.operator){case"+":return t+a;case"-":return t-a;case"*":return t*a;case"/":{if(a===0)throw new Error(`Division by zero in expression (${t} / ${a})`);return t/a}default:throw new Error(`Unknown operator: ${e.operator}`)}}case"UnaryExpression":if(e.operator==="-")return-this.evaluate(e.argument);throw new Error(`Unknown unary operator: ${e.operator}`);case"FunctionCall":return this.evaluateFunction(e.name,e.arguments);case"Trailing":return this.evaluateTrailing(e);case"Comparison":throw new Error("Comparison expressions should be evaluated with evaluateBoolean")}}evaluateTrailing(e){if(!this.isMultiPeriodMode()||!this.multiPeriodData)return console.warn("TRAILING expression used without multi-period data. Evaluating expression once."),this.evaluate(e.expression);const t=this.getTrailingPeriods(e.count,e.period);if(t.length===0)throw new Error(`No periods available for TRAILING ${e.count} ${e.period.toUpperCase()}`);let a=0;const n=this.evaluationPeriod;for(const r of t)this.evaluationPeriod=r,a+=this.evaluate(e.expression);return this.evaluationPeriod=n,a}getTrailingPeriods(e,t){if(!this.multiPeriodData)return[];const a=this.multiPeriodData.periods.map(h=>h.period),n=this.sortPeriods(a),r=this.evaluationPeriod??n[n.length-1];if((r?n.indexOf(r):n.length-1)<0)return[];const o=this.multiPeriodData.periods,c=n.filter(h=>{const y=o.find(T=>T.period===h);return y?(t==="quarters"&&y.periodType==="quarterly"||t==="months"&&y.periodType==="monthly"||t==="years"&&y.periodType==="annual",!0):!1}),d=c.indexOf(r??"");if(d<0&&r)return c.slice(-e);const f=Math.max(0,d-e+1);return c.slice(f,d+1)}resolveIdentifier(e){if(this.evaluationContext.bindings&&e in this.evaluationContext.bindings)return this.evaluationContext.bindings[e];const t=this.definitions.get(e);if(t)return this.evaluateDefinition(t);const a=this.getFinancialValue(e);if(a!==void 0)return a;const r={EBITDA:"ebitda",TotalDebt:"total_debt",InterestExpense:"interest_expense",NetIncome:"net_income",TotalAssets:"total_assets"}[e];if(r){const s=this.getFinancialValue(r);if(s!==void 0)return s}throw new Error(`Undefined identifier: ${e}`)}getFinancialValue(e){if(this.isMultiPeriodMode()&&this.evaluationPeriod)return this.getValueForPeriod(e,this.evaluationPeriod);if(e in this.simpleFinancialData)return this.simpleFinancialData[e]}isMultiPeriodMode(){return this.multiPeriodData!==null}getValueForPeriod(e,t){if(!this.multiPeriodData)return;const a=this.multiPeriodData.periods.find(n=>n.period===t);if(a&&e in a.data)return a.data[e]}sortPeriods(e){return[...e].sort((t,a)=>{const n=r=>{const s=r.match(/^(\d{4})-Q(\d)$/i);if(s){const d=parseInt(s[1],10),f=parseInt(s[2],10);return d*100+f*25}const o=r.match(/^(\d{4})-(\d{2})$/);if(o){const d=parseInt(o[1],10),f=parseInt(o[2],10);return d*100+f}const c=r.match(/^(\d{4})$/);return c?parseInt(c[1],10)*100:0};return n(t)-n(a)})}evaluateDefinition(e){const t=this.definitionEvalCache.get(e.name);if(t!==void 0)return t;if(this.definitionEvalStack.has(e.name)){const a=[...this.definitionEvalStack,e.name].join(" → ");throw new Error(`Circular definition detected: ${a}`)}this.definitionEvalStack.add(e.name);try{let a=this.evaluate(e.expression);if(e.modifiers.excluding)for(const n of e.modifiers.excluding){const r=this.getFinancialValue(n);r!==void 0&&(a-=r)}if(e.modifiers.cap){const n=this.evaluate(e.modifiers.cap);a=Math.min(a,n)}return this.definitionEvalCache.set(e.name,a),a}finally{this.definitionEvalStack.delete(e.name)}}evaluateFunction(e,t){switch(e){case"AVAILABLE":if(t.length!==1||typeof t[0]!="string")throw new Error("AVAILABLE requires a basket name");return this.getBasketAvailable(t[0]);case"GreaterOf":if(t.length!==2)throw new Error("GreaterOf requires two arguments");return Math.max(this.evaluate(t[0]),this.evaluate(t[1]));case"LesserOf":if(t.length!==2)throw new Error("LesserOf requires two arguments");return Math.min(this.evaluate(t[0]),this.evaluate(t[1]));case"COMPLIANT":if(t.length!==1||typeof t[0]!="string")throw new Error("COMPLIANT requires a covenant name");return this.checkCovenant(t[0]).compliant?1:0;case"EXISTS":if(t.length!==1||typeof t[0]!="string")throw new Error("EXISTS requires an identifier");return this.eventDefaults.has(t[0])?1:0;case"NOT":if(t.length!==1)throw new Error("NOT requires one argument");return this.evaluateBoolean(t[0])?0:1;default:throw new Error(`Unknown function: ${e}`)}}evaluateBoolean(e){if(typeof e=="string"){const t=this.conditions.get(e);if(t)return this.evaluateBoolean(t.expression);try{return this.resolveIdentifier(e)!==0}catch{return!1}}if(!J(e))return!!e;switch(e.type){case"Comparison":{const t=this.evaluate(e.left),a=this.evaluate(e.right);switch(e.operator){case"<=":return t<=a;case">=":return t>=a;case"<":return t<a;case">":return t>a;case"=":return t===a;case"!=":return t!==a;default:return!1}}case"BinaryExpression":return e.operator==="AND"?this.evaluateBoolean(e.left)&&this.evaluateBoolean(e.right):e.operator==="OR"?this.evaluateBoolean(e.left)||this.evaluateBoolean(e.right):this.evaluate(e)!==0;case"UnaryExpression":return e.operator==="NOT"?!this.evaluateBoolean(e.argument):this.evaluate(e)!==0;case"FunctionCall":return this.evaluate(e)!==0;default:return this.evaluate(e)!==0}}getCalculationTree(e){const t=this.definitions.get(e);if(!t){const s=this.getFinancialValue(e);return s!==void 0?{name:e,value:s,source:"financial_data",rawDataKey:e,valueType:this.inferValueType(e,s)}:null}const a=this.evaluateDefinition(t),n=this.buildExpressionTree(t.expression),r=this.expressionToString(t.expression);return{name:e,value:a,formula:r,children:n?[n]:void 0,source:"definition",valueType:this.inferValueType(e,a)}}buildExpressionTree(e){if(typeof e=="string"){const t=this.definitions.get(e);if(t){const n=this.evaluateDefinition(t),r=this.buildExpressionTree(t.expression);return{name:e,value:n,formula:this.expressionToString(t.expression),children:r?[r]:void 0,source:"definition",valueType:this.inferValueType(e,n)}}const a=this.getFinancialValue(e);if(a!==void 0)return{name:e,value:a,source:"financial_data",rawDataKey:e,valueType:this.inferValueType(e,a)};try{const n=this.resolveIdentifier(e);return{name:e,value:n,source:"financial_data",rawDataKey:e,valueType:this.inferValueType(e,n)}}catch{return null}}if(typeof e=="number")return{name:String(e),value:e,source:"literal",valueType:"number"};if(!J(e))return null;switch(e.type){case"Number":return{name:String(e.value),value:e.value,source:"literal",valueType:"number"};case"Currency":return{name:`$${e.value.toLocaleString()}`,value:e.value,source:"literal",valueType:"currency"};case"Percentage":return{name:`${e.value}%`,value:e.value/100,source:"literal",valueType:"percentage"};case"Ratio":return{name:`${e.value}x`,value:e.value,source:"literal",valueType:"ratio"};case"BinaryExpression":{const t=this.buildExpressionTree(e.left),a=this.buildExpressionTree(e.right),n=this.evaluate(e),r=[];return t&&r.push(t),a&&r.push(a),{name:this.expressionToString(e),value:n,formula:`${(t==null?void 0:t.name)??"?"} ${e.operator} ${(a==null?void 0:a.name)??"?"}`,children:r.length>0?r:void 0,source:"computed",valueType:this.inferValueType("",n)}}case"FunctionCall":{const t=this.evaluateFunction(e.name,e.arguments),a=e.arguments.map(n=>this.buildExpressionTree(n)).filter(n=>n!==null);return{name:`${e.name}(...)`,value:t,formula:`${e.name}(${e.arguments.map(n=>this.expressionToString(n)).join(", ")})`,children:a.length>0?a:void 0,source:"computed",valueType:this.inferValueType("",t)}}default:return null}}expressionToString(e){if(typeof e=="string")return e;if(typeof e=="number"||!J(e))return String(e);switch(e.type){case"Number":return String(e.value);case"Currency":return`$${e.value.toLocaleString()}`;case"Percentage":return`${e.value}%`;case"Ratio":return`${e.value}x`;case"BinaryExpression":return`${this.expressionToString(e.left)} ${e.operator} ${this.expressionToString(e.right)}`;case"UnaryExpression":return`${e.operator}${this.expressionToString(e.argument)}`;case"FunctionCall":return`${e.name}(${e.arguments.map(t=>this.expressionToString(t)).join(", ")})`;case"Comparison":return`${this.expressionToString(e.left)} ${e.operator} ${this.expressionToString(e.right)}`;case"Trailing":return`TRAILING ${e.count} ${e.period.toUpperCase()} OF ${this.expressionToString(e.expression)}`;default:return"?"}}inferValueType(e,t){const a=e.toLowerCase();return a.includes("debt")||a.includes("revenue")||a.includes("income")||a.includes("expense")||a.includes("ebitda")||a.includes("amount")||a.includes("assets")||a.includes("funded")||a.includes("capacity")||a.includes("balance")?"currency":a.includes("ratio")||a.includes("leverage")||a.includes("coverage")||a.includes("multiple")||a.includes("dscr")?"ratio":a.includes("rate")||a.includes("percent")||a.includes("margin")||t>0&&t<1?"percentage":Math.abs(t)>1e4?"currency":Math.abs(t)<10?"ratio":"number"}getDefinitionNames(){return Array.from(this.definitions.keys())}getEffectiveDate(){return this.evaluationPeriod?this.periodToDate(this.evaluationPeriod):null}periodToDate(e){if(/^\d{4}-\d{2}-\d{2}$/.test(e))return e;if(/^\d{4}-\d{2}$/.test(e)){const a=e.split("-"),n=Number(a[0]),r=Number(a[1]),s=new Date(n,r,0).getDate();return`${n}-${String(r).padStart(2,"0")}-${String(s).padStart(2,"0")}`}const t=e.match(/^Q(\d)\s+(\d{4})$/);if(t&&t[1]&&t[2]){const a=parseInt(t[1]),n=parseInt(t[2]),r=a*3,s=new Date(n,r,0).getDate();return`${n}-${String(r).padStart(2,"0")}-${String(s).padStart(2,"0")}`}return/^\d{4}$/.test(e)?`${e}-12-31`:e}resolveStepDown(e,t){if(!e.stepDown||e.stepDown.length===0)return{effectiveThreshold:t};const a=this.getEffectiveDate(),r=[...e.stepDown].sort((c,d)=>c.afterDate.localeCompare(d.afterDate)).map(c=>({afterDate:c.afterDate,threshold:this.evaluate(c.threshold)}));if(!a){const c=r[r.length-1]??{afterDate:"",threshold:t};return{effectiveThreshold:c.threshold,activeStep:c}}let s,o;for(const c of r)a>=c.afterDate?s=c:o||(o=c);if(!s)o=r[0];else if(!o){const c=r.indexOf(s);c<r.length-1&&(o=r[c+1])}return{effectiveThreshold:s?s.threshold:t,activeStep:s,nextStep:o}}checkCovenant(e){const t=this.covenants.get(e);if(!t)throw new Error(`Unknown covenant: ${e}`);if(!t.requires)throw new Error(`Covenant ${e} has no REQUIRES clause`);if(!Te(t.requires)){const y=this.evaluateBoolean(t.requires);return{name:e,compliant:y,actual:y?1:0,threshold:1,operator:"="}}const a=this.evaluate(t.requires.left),n=this.evaluate(t.requires.right),{effectiveThreshold:r,activeStep:s,nextStep:o}=this.resolveStepDown(t,n),c=r;let d;switch(t.requires.operator){case"<=":d=a<=c;break;case">=":d=a>=c;break;case"<":d=a<c;break;case">":d=a>c;break;case"=":d=a===c;break;case"!=":d=a!==c;break;default:d=!1}let f;t.requires.operator==="<="?f=c-a:t.requires.operator===">="&&(f=a-c);const h={name:e,compliant:d,actual:a,threshold:c,operator:t.requires.operator,headroom:f};return t.stepDown&&t.stepDown.length>0&&(h.originalThreshold=n,s&&(h.activeStep=s),o&&(h.nextStep=o)),h}checkAllCovenants(){const e=[];for(const t of this.covenants.keys())e.push(this.checkCovenant(t));return e}checkActiveCovenants(){const e=[],t=this.getActiveCovenants();for(const n of t)e.push(this.checkCovenant(n));const a=this.getRequiredCovenants();for(const n of a)t.includes(n)||e.push(this.checkCovenant(n));return e}getBasketType(e){return e.buildsFrom?"builder":e.floor?"grower":"fixed"}getGrowerBasketCapacity(e){let t=0;e.capacity&&(t=this.evaluate(e.capacity));for(const r of e.plus)t+=this.evaluate(r);let a=t;const n=e.floor?this.evaluate(e.floor):void 0;return n!==void 0&&(a=Math.max(a,n)),{capacity:a,baseCapacity:t,floor:n}}getBuilderBasketCapacity(e){const t=e.starting?this.evaluate(e.starting):0,a=this.basketAccumulation.get(e.name)??0;let n=t+a;const r=e.maximum?this.evaluate(e.maximum):void 0;r!==void 0&&(n=Math.min(n,r));for(const s of e.plus)n+=this.evaluate(s);return{capacity:n,accumulated:a,maximum:r}}getBasketCapacity(e){const t=this.baskets.get(e);if(!t)throw new Error(`Unknown basket: ${e}`);switch(this.getBasketType(t)){case"builder":return this.getBuilderBasketCapacity(t).capacity;case"grower":return this.getGrowerBasketCapacity(t).capacity;default:{let n=0;t.capacity&&(n=this.evaluate(t.capacity));for(const r of t.plus)n+=this.evaluate(r);return n}}}getBasketUsed(e){return this.basketUtilization.get(e)??0}getBasketAvailable(e){return this.getBasketCapacity(e)-this.getBasketUsed(e)}getBasketStatus(e){const t=this.baskets.get(e);if(!t)throw new Error(`Unknown basket: ${e}`);const a=this.getBasketType(t),n=this.getBasketCapacity(e),r=this.getBasketUsed(e),s={name:e,capacity:n,used:r,available:n-r,basketType:a};if(a==="grower"){const o=this.getGrowerBasketCapacity(t);s.baseCapacity=o.baseCapacity,s.floor=o.floor}else if(a==="builder"){const o=this.getBuilderBasketCapacity(t);s.accumulated=o.accumulated,s.starting=t.starting?this.evaluate(t.starting):0,s.maximum=o.maximum}return s}getAllBasketStatuses(){const e=[];for(const t of this.baskets.keys())e.push(this.getBasketStatus(t));return e}useBasket(e,t,a){const n=this.getBasketAvailable(e);if(t>n)throw new Error(`Insufficient basket capacity: ${e} has $${n} available, requested $${t}`);const r=this.basketUtilization.get(e)??0;this.basketUtilization.set(e,r+t),this.basketLedger.push({timestamp:new Date,basket:e,amount:t,description:a,entryType:"usage"})}accumulateBuilderBasket(e,t){const a=this.baskets.get(e);if(!a)throw new Error(`Unknown basket: ${e}`);if(!a.buildsFrom)throw new Error(`Basket ${e} is not a builder basket (no BUILDS_FROM clause)`);const n=this.evaluate(a.buildsFrom);let s=(this.basketAccumulation.get(e)??0)+n;if(a.maximum){const o=a.starting?this.evaluate(a.starting):0,d=this.evaluate(a.maximum)-o;s=Math.min(s,d)}return this.basketAccumulation.set(e,s),this.basketLedger.push({timestamp:new Date,basket:e,amount:n,description:t,entryType:"accumulation"}),n}getBuilderBasketNames(){const e=[];for(const[t,a]of this.baskets)this.getBasketType(a)==="builder"&&e.push(t);return e}getGrowerBasketNames(){const e=[];for(const[t,a]of this.baskets)this.getBasketType(a)==="grower"&&e.push(t);return e}checkProhibition(e,t){const a=this.prohibitions.get(e),n=[],r=[];if(!a)return{permitted:!0,reasoning:[{rule:"Default",evaluation:`No prohibition found for ${e}`,passed:!0}],warnings:[]};t!==void 0&&(this.evaluationContext={bindings:{amount:t}});try{n.push({rule:`Prohibit ${e}`,evaluation:`${e} is generally prohibited`,passed:!1});for(const s of a.exceptions)if(s.type==="ExceptWhen"&&s.conditions){let o=!0;for(const c of s.conditions){const d=this.evaluateBoolean(c);n.push({rule:this.describeCondition(c),evaluation:d?"PASS":"FAIL",passed:d}),d||(o=!1)}if(o)return{permitted:!0,reasoning:n,warnings:r}}return{permitted:!1,reasoning:n,warnings:["All exception conditions must be satisfied"]}}finally{this.evaluationContext={}}}describeCondition(e){return typeof e=="string"?e:J(e)?Te(e)?`${this.describeExpr(e.left)} ${e.operator} ${this.describeExpr(e.right)}`:Vt(e)?`${e.name}(${e.arguments.map(t=>this.describeExpr(t)).join(", ")})`:JSON.stringify(e):String(e)}describeExpr(e){if(typeof e=="string")return e;if(typeof e=="number")return e.toString();if(!J(e))return"...";switch(e.type){case"Currency":return`$${e.value.toLocaleString()}`;case"Number":return e.value.toString();case"Ratio":return`${e.value}x`;case"Percentage":return`${e.value}%`;case"FunctionCall":return`${e.name}(...)`;default:return"..."}}simulate(e){if(this.isMultiPeriodMode()&&this.multiPeriodData&&this.evaluationPeriod){const r=this.multiPeriodData.periods.findIndex(s=>s.period===this.evaluationPeriod);if(r>=0){const s=this.multiPeriodData.periods[r],o={...s.data};for(const[f,h]of Object.entries(e))h!==void 0&&(s.data[f]=h);const c=this.checkAllCovenants(),d=this.getAllBasketStatuses();return s.data=o,{covenants:c,baskets:d}}}const t={...this.simpleFinancialData};for(const[r,s]of Object.entries(e))s!==void 0&&(this.simpleFinancialData[r]=s);const a=this.checkAllCovenants(),n=this.getAllBasketStatuses();return this.simpleFinancialData=t,{covenants:a,baskets:n}}getStatus(){const e=this.hasPhases()?this.checkActiveCovenants():this.checkAllCovenants(),t=this.getAllBasketStatuses(),a=e.every(r=>r.compliant),n={timestamp:new Date,covenants:e,baskets:t,overallCompliant:a};return this.hasPhases()&&(n.currentPhase=this.currentPhase??void 0,n.suspendedCovenants=this.getSuspendedCovenants()),n}setEvaluationPeriod(e){var t;if(!this.isMultiPeriodMode()){console.warn("setEvaluationPeriod called but not in multi-period mode");return}if(!((t=this.multiPeriodData)!=null&&t.periods.find(a=>a.period===e)))throw new Error(`Period '${e}' not found in financial data`);this.evaluationPeriod=e,this.definitionEvalCache.clear()}clearEvaluationPeriod(){if(this.multiPeriodData&&this.multiPeriodData.periods.length>0){const e=this.sortPeriods(this.multiPeriodData.periods.map(t=>t.period));this.evaluationPeriod=e[e.length-1]??null}else this.evaluationPeriod=null}getEvaluationPeriod(){return this.evaluationPeriod}getAvailablePeriods(){return this.multiPeriodData?this.sortPeriods(this.multiPeriodData.periods.map(e=>e.period)):[]}hasMultiPeriodData(){return this.isMultiPeriodMode()}getComplianceHistory(){if(!this.isMultiPeriodMode()||!this.multiPeriodData)return[{period:"current",periodEnd:new Date().toISOString().split("T")[0],covenants:this.checkAllCovenants(),overallCompliant:this.checkAllCovenants().every(n=>n.compliant)}];const e=this.evaluationPeriod,t=[],a=this.getAvailablePeriods();for(const n of a){this.evaluationPeriod=n,this.definitionEvalCache.clear();const r=this.multiPeriodData.periods.find(o=>o.period===n),s=this.checkAllCovenants();t.push({period:n,periodEnd:(r==null?void 0:r.periodEnd)??"",covenants:s,overallCompliant:s.every(o=>o.compliant)})}return this.evaluationPeriod=e,this.definitionEvalCache.clear(),t}getCurrentPhase(){return this.currentPhase}getCurrentPhaseStatement(){return this.currentPhase?this.phases.get(this.currentPhase)??null:null}setCurrentPhase(e,t=null){if(!this.phases.has(e))throw new Error(`Unknown phase: ${e}`);this.currentPhase=e,this.phaseHistory.push({phase:e,enteredAt:new Date,triggeredBy:t})}transitionTo(e){this.satisfiedConditions.add(e);for(const[t,a]of this.phases)if(a.from===e){this.setCurrentPhase(t,e);return}}satisfyCondition(e){this.satisfiedConditions.add(e)}isConditionSatisfied(e){return this.satisfiedConditions.has(e)}clearCondition(e){this.satisfiedConditions.delete(e)}checkPhaseTransitions(){const e=[];for(const[,t]of this.transitions){const a=this.evaluateTransition(t);e.push(a)}return e}evaluateTransition(e){const t=[];let a=!1;if(!e.when)return{name:e.name,triggered:!1,conditions:[]};if(pe(e.when)){a=!0;for(const r of e.when.conditions){const s=this.satisfiedConditions.has(r);t.push({name:r,met:s}),s||(a=!1)}}else if(me(e.when)){a=!1;for(const r of e.when.conditions){const s=this.satisfiedConditions.has(r);t.push({name:r,met:s}),s&&(a=!0)}}else try{a=this.evaluateBoolean(e.when),t.push({name:"expression",met:a})}catch{a=!1,t.push({name:"expression",met:!1})}let n;for(const[r,s]of this.phases)if(s.from===e.name){n=r;break}return{name:e.name,triggered:a,conditions:t,targetPhase:n}}getActiveCovenants(){const e=this.getCurrentPhaseStatement(),t=Array.from(this.covenants.keys());if(!e)return t;if(e.covenantsActive.length>0)return e.covenantsActive.filter(n=>this.covenants.has(n));const a=new Set(e.covenantsSuspended);return t.filter(n=>!a.has(n))}getSuspendedCovenants(){const e=this.getCurrentPhaseStatement();return e?e.covenantsSuspended.filter(t=>this.covenants.has(t)):[]}getRequiredCovenants(){const e=this.getCurrentPhaseStatement();return e?e.requiredCovenants.filter(t=>this.covenants.has(t)):[]}isCovenantActive(e){const t=this.getCurrentPhaseStatement();return t?t.covenantsSuspended.includes(e)?!1:t.covenantsActive.length>0?t.covenantsActive.includes(e):!0:!0}getPhaseHistory(){return[...this.phaseHistory]}getPhaseNames(){return Array.from(this.phases.keys())}getTransitionNames(){return Array.from(this.transitions.keys())}getPhase(e){return this.phases.get(e)}getTransition(e){return this.transitions.get(e)}hasPhases(){return this.phases.size>0}getMilestoneStatus(e,t){const a=this.milestones.get(e);if(!a)throw new Error(`Unknown milestone: ${e}`);const n=Y.toUTCDate(t??new Date),r=this.milestoneAchievements.get(e),s=a.targetDate?Y.parseUTCDate(a.targetDate):null,o=a.longstopDate?Y.parseUTCDate(a.longstopDate):null,c=1440*60*1e3,d=s?Math.ceil((s.getTime()-n.getTime())/c):0,f=o?Math.ceil((o.getTime()-n.getTime())/c):0,h=this.checkMilestonePrerequisites(a);let y;return r?y="achieved":o&&n>o?y="breached":s&&n>s?y="at_risk":y="pending",{name:e,status:y,targetDate:a.targetDate,longstopDate:a.longstopDate,achievedDate:r==null?void 0:r.toISOString().split("T")[0],daysToTarget:d,daysToLongstop:f,prerequisites:h}}checkMilestonePrerequisites(e){const t=[];if(!e.requires)return t;if(typeof e.requires=="string"){const a=this.isMilestoneAchieved(e.requires)||this.satisfiedConditions.has(e.requires);t.push({name:e.requires,met:a})}else if(pe(e.requires))for(const a of e.requires.conditions){const n=this.isMilestoneAchieved(a)||this.satisfiedConditions.has(a);t.push({name:a,met:n})}else if(me(e.requires))for(const a of e.requires.conditions){const n=this.isMilestoneAchieved(a)||this.satisfiedConditions.has(a);t.push({name:a,met:n})}return t}areMilestonePrerequisitesMet(e){const t=this.milestones.get(e);if(!t)return!1;if(!t.requires)return!0;const a=this.checkMilestonePrerequisites(t);return typeof t.requires=="string"?a.every(n=>n.met):pe(t.requires)?a.every(n=>n.met):me(t.requires)?a.some(n=>n.met):!0}achieveMilestone(e,t){const a=this.milestones.get(e);if(!a)throw new Error(`Unknown milestone: ${e}`);const n=t??new Date;this.milestoneAchievements.set(e,n),this.satisfiedConditions.add(e);for(const r of a.triggers)this.satisfiedConditions.add(r)}isMilestoneAchieved(e){return this.milestoneAchievements.has(e)}getAllMilestoneStatuses(e){const t=[];for(const a of this.milestones.keys())t.push(this.getMilestoneStatus(a,e));return t}getMilestoneNames(){return Array.from(this.milestones.keys())}hasMilestones(){return this.milestones.size>0}getTechnicalMilestoneStatus(e,t){const a=this.technicalMilestones.get(e);if(!a)throw new Error(`Unknown technical milestone: ${e}`);const n=Y.toUTCDate(t??new Date),r=this.technicalMilestoneAchievements.get(e),s=a.targetDate?Y.parseUTCDate(a.targetDate):null,o=a.longstopDate?Y.parseUTCDate(a.longstopDate):null,c=1440*60*1e3,d=s?Math.ceil((s.getTime()-n.getTime())/c):0,f=o?Math.ceil((o.getTime()-n.getTime())/c):0,h=a.targetValue?this.evaluate(a.targetValue):null,y=a.currentValue?this.evaluate(a.currentValue):null,T=a.progressMetric?this.evaluate(a.progressMetric):null;let R=null;h!==null&&y!==null&&h>0?R=y/h*100:T!==null&&(R=T*100);const B=this.checkTechnicalMilestonePrerequisites(a);let P;return r||y!==null&&h!==null&&y>=h?P="achieved":o&&n>o?P="breached":s&&n>s?P="at_risk":P="pending",{name:e,status:P,targetDate:a.targetDate,longstopDate:a.longstopDate,achievedDate:r==null?void 0:r.toISOString().split("T")[0],daysToTarget:d,daysToLongstop:f,measurement:a.measurement,targetValue:h,currentValue:y,completionPercent:R,progressMetric:T,prerequisites:B}}checkTechnicalMilestonePrerequisites(e){const t=[];if(!e.requires)return t;if(typeof e.requires=="string"){const a=this.isTechnicalMilestoneAchieved(e.requires)||this.isMilestoneAchieved(e.requires)||this.satisfiedConditions.has(e.requires);t.push({name:e.requires,met:a})}else if(pe(e.requires))for(const a of e.requires.conditions){const n=this.isTechnicalMilestoneAchieved(a)||this.isMilestoneAchieved(a)||this.satisfiedConditions.has(a);t.push({name:a,met:n})}else if(me(e.requires))for(const a of e.requires.conditions){const n=this.isTechnicalMilestoneAchieved(a)||this.isMilestoneAchieved(a)||this.satisfiedConditions.has(a);t.push({name:a,met:n})}return t}achieveTechnicalMilestone(e,t){const a=this.technicalMilestones.get(e);if(!a)throw new Error(`Unknown technical milestone: ${e}`);const n=t??new Date;this.technicalMilestoneAchievements.set(e,n),this.satisfiedConditions.add(e);for(const r of a.triggers)this.satisfiedConditions.add(r)}isTechnicalMilestoneAchieved(e){if(this.technicalMilestoneAchievements.has(e))return!0;const t=this.technicalMilestones.get(e);if(t&&t.targetValue&&t.currentValue){const a=this.evaluate(t.targetValue);if(this.evaluate(t.currentValue)>=a){this.satisfiedConditions.add(e);for(const r of t.triggers)this.satisfiedConditions.add(r);return!0}}return!1}getAllTechnicalMilestoneStatuses(e){const t=[];for(const a of this.technicalMilestones.keys())t.push(this.getTechnicalMilestoneStatus(a,e));return t}getTechnicalMilestoneNames(){return Array.from(this.technicalMilestones.keys())}hasTechnicalMilestones(){return this.technicalMilestones.size>0}getRegulatoryRequirementStatus(e){const t=this.regulatoryRequirements.get(e);if(!t)throw new Error(`Unknown regulatory requirement: ${e}`);const a=this.regulatoryStatuses.get(e)??t.status,n=t.requiredFor!==null&&a!=="approved";return{name:t.name,agency:t.agency,requirementType:t.requirementType,description:t.description,requiredFor:t.requiredFor,status:a,approvalDate:t.approvalDate,blocking:n,satisfies:t.satisfies}}updateRegulatoryStatus(e,t,a){const n=this.regulatoryRequirements.get(e);if(!n)throw new Error(`Unknown regulatory requirement: ${e}`);if(this.regulatoryStatuses.set(e,t),t==="approved"){this.satisfiedConditions.add(e);for(const r of n.satisfies)this.satisfiedConditions.add(r)}a&&t==="approved"&&(n.approvalDate=a)}getAllRegulatoryRequirementStatuses(){const e=[];for(const t of this.regulatoryRequirements.keys())e.push(this.getRegulatoryRequirementStatus(t));return e}getRegulatoryChecklist(){const e=this.getAllRegulatoryRequirementStatuses();let t=0,a=0,n=0,r=0;const s={};for(const c of e){switch(c.status){case"approved":t++;break;case"submitted":a++;break;case"pending":n++;break;case"denied":r++;break}if(c.requiredFor){const d=c.requiredFor;s[d]||(s[d]={total:0,approved:0});const f=s[d];f&&(f.total++,c.status==="approved"&&f.approved++)}}const o={};for(const[c,d]of Object.entries(s))o[c]=d.approved===d.total;return{totalRequirements:e.length,approved:t,submitted:a,pending:n,denied:r,phaseReady:o,requirements:e}}isPhaseRegulatoryReady(e){return this.getRegulatoryChecklist().phaseReady[e]??!0}getRegulatoryRequirementNames(){return Array.from(this.regulatoryRequirements.keys())}hasRegulatoryRequirements(){return this.regulatoryRequirements.size>0}getPerformanceGuaranteeStatus(e){const t=this.performanceGuarantees.get(e);if(!t)throw new Error(`Unknown performance guarantee: ${e}`);const a=t.p50?this.evaluate(t.p50):null,n=t.p75?this.evaluate(t.p75):null,r=t.p90?this.evaluate(t.p90):null,s=t.p99?this.evaluate(t.p99):null;let o=null;t.actualValue?o=this.evaluate(t.actualValue):t.metric&&(o=this.getFinancialValue(t.metric)??null);let c=null;o!==null&&(a!==null&&o>=a?c="p50":n!==null&&o>=n?c="p75":r!==null&&o>=r?c="p90":s!==null&&o>=s?c="p99":c="below_p99");let d=0;o!==null&&s!==null&&o<s&&(d=s-o);let f=0;if(d>0&&t.shortfallRate){const y=this.evaluate(t.shortfallRate);f=d*y}const h=c!=="below_p99"&&c!==null;return{name:t.name,metric:t.metric,p50:a,p75:n,p90:r,p99:s,actual:o,performanceLevel:c,meetsGuarantee:h,shortfall:d,shortfallPayment:f,guaranteePeriod:t.guaranteePeriod}}getAllPerformanceGuaranteeStatuses(){const e=[];for(const t of this.performanceGuarantees.keys())e.push(this.getPerformanceGuaranteeStatus(t));return e}getPerformanceGuaranteeNames(){return Array.from(this.performanceGuarantees.keys())}hasPerformanceGuarantees(){return this.performanceGuarantees.size>0}getDegradedCapacity(e,t){const a=this.degradationSchedules.get(e);if(!a)throw new Error(`Unknown degradation schedule: ${e}`);const n=a.initialCapacity?this.evaluate(a.initialCapacity):0,r=a.minimumCapacity?this.evaluate(a.minimumCapacity):0;let s=0;if(a.schedule&&a.schedule.length>0)for(const f of a.schedule)f.year<=t&&(s+=this.evaluate(f.rate));else{const f=a.year1Degradation?this.evaluate(a.year1Degradation):0,h=a.annualDegradation?this.evaluate(a.annualDegradation):0;t>=1&&(s=f),t>1&&(s+=(t-1)*h)}const o=s/100;let c=n*(1-o);const d=c<r;return d&&(c=r),{name:a.name,assetType:a.assetType,initialCapacity:n,year:t,cumulativeDegradation:s,effectiveCapacity:c,capacityPercent:n>0?c/n*100:0,atMinimum:d,affects:a.affects}}getDegradationProjection(e,t){const a=[];for(let n=1;n<=t;n++)a.push(this.getDegradedCapacity(e,n));return a}getDegradationScheduleNames(){return Array.from(this.degradationSchedules.keys())}hasDegradationSchedules(){return this.degradationSchedules.size>0}applySeasonalAdjustments(e,t,a){for(const[n,r]of this.seasonalAdjustments)if(r.metric===e){const s=r.adjustmentFactor?this.evaluate(r.adjustmentFactor):1;let o=!1;return a&&r.season.length>0&&(o=r.season.includes(a)),{name:n,metric:r.metric,baseValue:t,adjustmentFactor:s,adjustedValue:o?t*s:t,active:o,seasons:r.season,reason:r.reason}}return null}getSeasonalAdjustmentStatus(e,t){const a=this.seasonalAdjustments.get(e);if(!a)throw new Error(`Unknown seasonal adjustment: ${e}`);const n=a.adjustmentFactor?this.evaluate(a.adjustmentFactor):1;let r=0;a.metric&&(r=this.getFinancialValue(a.metric)??0);let s=!1;return t&&a.season.length>0&&(s=a.season.includes(t)),{name:e,metric:a.metric,baseValue:r,adjustmentFactor:n,adjustedValue:s?r*n:r,active:s,seasons:a.season,reason:a.reason}}getAllSeasonalAdjustmentStatuses(e){const t=[];for(const a of this.seasonalAdjustments.keys())t.push(this.getSeasonalAdjustmentStatus(a,e));return t}getSeasonalAdjustmentNames(){return Array.from(this.seasonalAdjustments.keys())}hasSeasonalAdjustments(){return this.seasonalAdjustments.size>0}getTaxEquityStructureStatus(e){var o;const t=this.taxEquityStructures.get(e);if(!t)throw new Error(`Unknown tax equity structure: ${e}`);const a=t.targetReturn?this.evaluate(t.targetReturn):null,n=t.buyoutPrice?this.evaluate(t.buyoutPrice):null;let r=!1,s=null;for(const c of this.triggeredFlips.keys()){const d=this.flipEvents.get(c);if(d&&(d.structure===null||d.structure===e)){r=!0,s=c;break}}return{name:e,structureType:t.structureType,taxInvestor:t.taxInvestor,sponsor:t.sponsor,taxCreditAllocation:t.taxCreditAllocation,depreciationAllocation:t.depreciationAllocation,cashAllocation:t.cashAllocation,flipDate:((o=t.flipDate)==null?void 0:o.value)??null,targetReturn:a,buyoutPrice:n,hasFlipped:r,flipEventName:s}}getTaxEquityStructureNames(){return Array.from(this.taxEquityStructures.keys())}hasTaxEquityStructures(){return this.taxEquityStructures.size>0}getTaxCreditStatus(e){const t=this.taxCredits.get(e);if(!t)throw new Error(`Unknown tax credit: ${e}`);const a=t.rate?this.evaluate(t.rate):null,n=t.eligibleBasis?this.evaluate(t.eligibleBasis):null,r=[];let s=0;for(const d of t.adders){const f=this.evaluate(d.bonus);r.push({name:d.name,bonus:f}),s+=f}const o=a!==null?a+s:null;let c=null;return t.creditAmount?c=this.evaluate(t.creditAmount):o!==null&&n!==null&&(c=n*(o/100)),{name:e,creditType:t.creditType,baseRate:a,effectiveRate:o,eligibleBasis:n,creditAmount:c,adders:r,vestingPeriod:t.vestingPeriod,recaptureRisk:t.recaptureRisk,isVested:!0}}getTaxCreditNames(){return Array.from(this.taxCredits.keys())}hasTaxCredits(){return this.taxCredits.size>0}getDepreciationForYear(e,t){const a=this.depreciationSchedules.get(e);if(!a)throw new Error(`Unknown depreciation schedule: ${e}`);const n=a.depreciableBasis?this.evaluate(a.depreciableBasis):null,r=a.bonusDepreciation?this.evaluate(a.bonusDepreciation):0,s=t===1&&n!==null?n*(r/100):0,o=n!==null?n-n*(r/100):null;let c=null;if(a.schedule&&a.schedule.length>0){const T=a.schedule.find(R=>R.year===t);T&&(c=this.evaluate(T.percentage))}else a.method&&(c=this.getMACRSPercentage(a.method,t));const d=o!==null&&c!==null?o*(c/100):null,f=(s??0)+(d??0);let h=0;for(let T=1;T<=t;T++){const R=T===t?{bonusAmount:s,regularAmount:d??0}:this.getDepreciationForYearInternal(a,T,n,r,o);h+=(R.bonusAmount??0)+(R.regularAmount??0)}const y=n!==null?n-h:null;return{name:e,method:a.method,depreciableBasis:n,bonusDepreciation:r,bonusAmount:t===1?s:0,remainingBasis:o,year:t,regularPercentage:c,regularAmount:d,totalDepreciation:f,cumulativeDepreciation:h,remainingBookValue:y}}getDepreciationForYearInternal(e,t,a,n,r){const s=t===1&&a!==null?a*(n/100):0;let o=null;if(e.schedule&&e.schedule.length>0){const d=e.schedule.find(f=>f.year===t);d&&(o=this.evaluate(d.percentage))}else e.method&&(o=this.getMACRSPercentage(e.method,t));const c=r!==null&&o!==null?r*(o/100):0;return{bonusAmount:s,regularAmount:c}}getMACRSPercentage(e,t){const n={macrs_5yr:[20,32,19.2,11.52,11.52,5.76],macrs_7yr:[14.29,24.49,17.49,12.49,8.93,8.92,8.93,4.46],macrs_15yr:[5,9.5,8.55,7.7,6.93,6.23,5.9,5.9,5.91,5.9,5.91,5.9,5.91,5.9,5.91,2.95],macrs_20yr:[3.75,7.219,6.677,6.177,5.713,5.285,4.888,4.522,4.462,4.461,4.462,4.461,4.462,4.461,4.462,4.461,4.462,4.461,4.462,4.461,2.231],straight_line:[]}[e];return!n||t<1||t>n.length?null:n[t-1]??null}getDepreciationScheduleNames(){return Array.from(this.depreciationSchedules.keys())}hasDepreciationSchedules(){return this.depreciationSchedules.size>0}getFlipEventStatus(e){const t=this.flipEvents.get(e);if(!t)throw new Error(`Unknown flip event: ${e}`);const a=this.triggeredFlips.get(e),n=!!a;let r=null;t.triggerValue&&typeof t.triggerValue=="object"&&"type"in t.triggerValue&&(t.triggerValue.type==="Date"?r=t.triggerValue.value:r=this.evaluate(t.triggerValue));const s=n?t.postFlipAllocation:t.preFlipAllocation;let o=null;return n&&t.buyoutOption&&(t.buyoutOption.type==="fixed"?o=this.evaluate(t.buyoutOption.price):t.buyoutOption.type==="formula"&&(o=this.evaluate(t.buyoutOption.formula))),{name:e,trigger:t.trigger,triggerValue:r,preFlipAllocation:t.preFlipAllocation,postFlipAllocation:t.postFlipAllocation,hasTriggered:n,triggerDate:(a==null?void 0:a.date.toISOString().split("T")[0])??null,currentAllocation:s,buyoutPrice:o}}triggerFlip(e,t=new Date,a){const n=this.flipEvents.get(e);if(!n)throw new Error(`Unknown flip event: ${e}`);if(this.triggeredFlips.has(e))throw new Error(`Flip event ${e} has already been triggered`);this.triggeredFlips.set(e,{date:t,triggerValue:a??"manual"});for(const r of n.satisfies)this.satisfiedConditions.add(r)}isFlipTriggered(e){return this.triggeredFlips.has(e)}getFlipEventNames(){return Array.from(this.flipEvents.keys())}hasFlipEvents(){return this.flipEvents.size>0}getTriggeredFlips(){return Array.from(this.triggeredFlips.keys())}getReserveStatus(e){const t=this.reserves.get(e);if(!t)throw new Error(`Unknown reserve: ${e}`);const a=this.reserveBalances.get(e)??0,n=t.target?this.evaluate(t.target):0,r=t.minimum?this.evaluate(t.minimum):0,s=n>0?a/n*100:100,o=a<r,c=Math.max(0,a-r);return{name:e,balance:a,target:n,minimum:r,fundedPercent:s,belowMinimum:o,availableForRelease:c}}getAllReserveStatuses(){const e=[];for(const t of this.reserves.keys())e.push(this.getReserveStatus(t));return e}fundReserve(e,t,a){if(!this.reserves.get(e))throw new Error(`Unknown reserve: ${e}`);const r=this.reserveBalances.get(e)??0;this.reserveBalances.set(e,r+t)}drawFromReserve(e,t){if(!this.reserves.get(e))throw new Error(`Unknown reserve: ${e}`);const r=this.getReserveStatus(e).availableForRelease,s=Math.min(t,r);if(s>0){const o=this.reserveBalances.get(e)??0;this.reserveBalances.set(e,o-s)}return s}setReserveBalance(e,t){if(!this.reserves.has(e))throw new Error(`Unknown reserve: ${e}`);this.reserveBalances.set(e,t)}getReserveNames(){return Array.from(this.reserves.keys())}hasReserves(){return this.reserves.size>0}executeWaterfall(e,t){const a=this.waterfalls.get(e);if(!a)throw new Error(`Unknown waterfall: ${e}`);let n=t;const r=[],s=[...a.tiers].sort((c,d)=>c.priority-d.priority);for(const c of s){const d=this.executeTier(c,n);r.push(d),n-=d.paid}const o=t-n;return{name:e,totalRevenue:t,totalDistributed:o,remainder:n,tiers:r}}executeTier(e,t){if(e.payTo&&e.shortfall&&e.payTo===e.shortfall)return{priority:e.priority,name:e.name,requested:0,paid:0,shortfall:0,reserveDrawn:0,blocked:!0,blockReason:`Circular reserve: tier both funds and draws from ${e.payTo}`};if(e.condition&&!this.evaluateBoolean(e.condition))return{priority:e.priority,name:e.name,requested:0,paid:0,shortfall:0,reserveDrawn:0,blocked:!0,blockReason:"Condition not met"};let a=0;if(e.payAmount)a=this.evaluate(e.payAmount);else if(e.payTo){const o=this.getReserveStatus(e.payTo);if(e.until)if(Te(e.until)){const c=this.evaluate(e.until.right);a=Math.max(0,c-o.balance)}else{const c=this.evaluate(e.until);a=Math.max(0,c-o.balance)}else a=Math.max(0,o.target-o.balance)}let n=Math.min(a,t),r=0,s=a-n;return s>0&&e.shortfall&&(r=this.drawFromReserve(e.shortfall,s),n+=r,s=a-n),e.payTo&&n>0&&this.fundReserve(e.payTo,n),{priority:e.priority,name:e.name,requested:a,paid:n,shortfall:s,reserveDrawn:r,blocked:!1}}getWaterfallNames(){return Array.from(this.waterfalls.keys())}getWaterfall(e){return this.waterfalls.get(e)}hasWaterfalls(){return this.waterfalls.size>0}getCPChecklist(e){const t=this.conditionsPrecedent.get(e);if(!t)throw new Error(`Unknown conditions precedent checklist: ${e}`);const a=this.cpStatuses.get(e)??new Map,n=[];let r=0,s=0,o=0;for(const d of t.conditions){const f=a.get(d.name)??d.status;n.push({name:d.name,description:d.description,responsible:d.responsible,status:f,satisfies:d.satisfies}),f==="satisfied"?r++:f==="pending"?s++:f==="waived"&&o++}const c=s===0;return{name:e,section:t.section,totalConditions:t.conditions.length,satisfied:r,pending:s,waived:o,complete:c,conditions:n}}updateCPStatus(e,t,a){const n=this.conditionsPrecedent.get(e);if(!n)throw new Error(`Unknown conditions precedent checklist: ${e}`);const r=n.conditions.find(o=>o.name===t);if(!r)throw new Error(`Unknown CP '${t}' in checklist '${e}'`);let s=this.cpStatuses.get(e);if(s||(s=new Map,this.cpStatuses.set(e,s)),s.set(t,a),a==="satisfied")for(const o of r.satisfies)this.satisfiedConditions.add(o)}getCPChecklistNames(){return Array.from(this.conditionsPrecedent.keys())}hasConditionsPrecedent(){return this.conditionsPrecedent.size>0}isDrawAllowed(e){return this.getCPChecklist(e).complete}getDefinedTerms(){return Array.from(this.definitions.keys())}getCovenantNames(){return Array.from(this.covenants.keys())}getBasketNames(){return Array.from(this.baskets.keys())}getConditionNames(){return Array.from(this.conditions.keys())}getProhibitionTargets(){return Array.from(this.prohibitions.keys())}setEventDefault(e){this.eventDefaults.add(e)}clearEventDefault(e){this.eventDefaults.delete(e)}hasEventDefault(e){return this.eventDefaults.has(e)}getBasketLedger(){return[...this.basketLedger]}checkCovenantWithCure(e){const t=this.checkCovenant(e),a=this.covenants.get(e);return!t.compliant&&(a!=null&&a.cure)&&(t.cureAvailable=this.canApplyCure(e),t.shortfall=this.calculateShortfall(t),t.cureState=this.cureStates.get(e),t.cureMechanism=a.cure),t}checkAllCovenantsWithCure(){const e=[];for(const t of this.covenants.keys())e.push(this.checkCovenantWithCure(t));return e}canApplyCure(e){var r;const t=this.covenants.get(e);if(!(t!=null&&t.cure))return!1;const a=(r=t.cure.details)==null?void 0:r.maxUses;return a===void 0?!0:(this.cureUsage.get(t.cure.type)??0)<a}applyCure(e,t){var c;const a=this.covenants.get(e);if(!a)return{success:!1,reason:`Unknown covenant: ${e}`};if(!a.cure)return{success:!1,reason:`Covenant ${e} has no cure mechanism`};if(!this.canApplyCure(e))return{success:!1,reason:"No cure uses remaining"};if((c=a.cure.details)!=null&&c.maxAmount){const d=this.evaluate(a.cure.details.maxAmount);if(t>d)return{success:!1,reason:`Amount exceeds maximum cure of $${d.toLocaleString()}`}}const n=this.checkCovenant(e);if(n.compliant)return{success:!1,reason:"Covenant is already compliant, no cure needed"};const r=this.calculateShortfall(n);if(t<r)return{success:!1,reason:`Cure amount ($${t.toLocaleString()}) is less than shortfall ($${r.toLocaleString()})`};const s=this.cureUsage.get(a.cure.type)??0;this.cureUsage.set(a.cure.type,s+1);let o=this.cureStates.get(e);return o||(o={covenantName:e,breachDate:new Date,cureDeadline:this.calculateCureDeadline(a),status:"breach",cureAttempts:[]},this.cureStates.set(e,o)),o.status="cured",o.cureAttempts.push({date:new Date,mechanism:a.cure.type,amount:t,successful:!0}),{success:!0,curedAmount:t}}calculateCureDeadline(e){var n,r;const t=new Date,a=(r=(n=e.cure)==null?void 0:n.details)==null?void 0:r.curePeriod;if(a)switch(a.unit){case"days":t.setDate(t.getDate()+a.amount);break;case"months":t.setMonth(t.getMonth()+a.amount);break;case"years":t.setFullYear(t.getFullYear()+a.amount);break}else t.setDate(t.getDate()+30);return t}calculateShortfall(e){return e.compliant?0:e.operator==="<="?e.actual-e.threshold:e.operator===">="?e.threshold-e.actual:Math.abs(e.actual-e.threshold)}getCureUsage(){var t,a;const e=new Map;for(const[,n]of this.covenants)if(n.cure){const r=n.cure.type,s=((t=n.cure.details)==null?void 0:t.maxUses)??1/0;if(!e.has(r)){const o=this.cureUsage.get(r)??0;e.set(r,{mechanism:r,usesRemaining:s===1/0?1/0:s-o,totalUses:o,maxUses:s,period:((a=n.cure.details)==null?void 0:a.overPeriod)??"unlimited"})}}return Array.from(e.values())}getCureState(e){return this.cureStates.get(e)}recordBreach(e){const t=this.covenants.get(e);if(!t)throw new Error(`Unknown covenant: ${e}`);this.cureStates.has(e)||this.cureStates.set(e,{covenantName:e,breachDate:new Date,cureDeadline:this.calculateCureDeadline(t),status:"breach",cureAttempts:[]})}getCovenantsWithCure(){const e=[];for(const[t,a]of this.covenants)a.cure&&e.push(t);return e}applyAmendment(e){this.definitionEvalCache.clear();for(const t of e.directives)this.applyDirective(t);this.appliedAmendments.push(e)}applyDirective(e){switch(e.directive){case"replace":this.replaceStatement(e.targetType,e.targetName,e.replacement);break;case"add":this.loadStatement(e.statement);break;case"delete":this.deleteStatement(e.targetType,e.targetName);break;case"modify":this.modifyStatement(e.targetType,e.targetName,e.modifications);break}}replaceStatement(e,t,a){this.deleteStatement(e,t),this.loadStatement(a)}deleteStatement(e,t){switch(e){case"Define":if(!this.definitions.has(t))throw new Error(`Cannot delete: DEFINE ${t} not found`);this.definitions.delete(t);break;case"Covenant":if(!this.covenants.has(t))throw new Error(`Cannot delete: COVENANT ${t} not found`);this.covenants.delete(t);break;case"Basket":if(!this.baskets.has(t))throw new Error(`Cannot delete: BASKET ${t} not found`);this.baskets.delete(t),this.basketUtilization.delete(t),this.basketAccumulation.delete(t);break;case"Condition":if(!this.conditions.has(t))throw new Error(`Cannot delete: CONDITION ${t} not found`);this.conditions.delete(t);break;case"Prohibit":if(!this.prohibitions.has(t))throw new Error(`Cannot delete: PROHIBIT ${t} not found`);this.prohibitions.delete(t);break;case"Event":if(!this.events.has(t))throw new Error(`Cannot delete: EVENT ${t} not found`);this.events.delete(t);break;case"Phase":if(!this.phases.has(t))throw new Error(`Cannot delete: PHASE ${t} not found`);this.phases.delete(t),this.currentPhase===t&&(this.currentPhase=null);break;case"Transition":if(!this.transitions.has(t))throw new Error(`Cannot delete: TRANSITION ${t} not found`);this.transitions.delete(t);break}}modifyStatement(e,t,a){switch(e){case"Basket":{const n=this.baskets.get(t);if(!n)throw new Error(`Cannot modify: BASKET ${t} not found`);for(const r of a)switch(r.type){case"capacity":n.capacity=r.value;break;case"floor":n.floor=r.value;break;case"maximum":n.maximum=r.value;break}break}case"Covenant":{const n=this.covenants.get(t);if(!n)throw new Error(`Cannot modify: COVENANT ${t} not found`);for(const r of a)switch(r.type){case"requires":n.requires=r.value;break;case"tested":n.tested=r.value;break}break}default:throw new Error(`Modification not supported for ${e}`)}}getAppliedAmendments(){return[...this.appliedAmendments]}getEventNames(){return Array.from(this.events.keys())}static parseUTCDate(e){const[t,a,n]=e.split("-").map(Number);return new Date(Date.UTC(t,a-1,n))}static toUTCDate(e){return new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()))}}function qt(i,e=!1){const t={name:i.name,actual:i.actual,required:i.threshold,operator:i.operator,compliant:i.compliant,headroom:i.headroom,suspended:e};return i.originalThreshold!==void 0&&(t.originalThreshold=i.originalThreshold),i.activeStep&&(t.activeStep=i.activeStep),i.nextStep&&(t.nextStep=i.nextStep),t}function Gt(i){return{name:i.name,target:i.targetDate??"",longstop:i.longstopDate??"",status:i.status,achievedDate:i.achievedDate,percentComplete:void 0}}function jt(i){return{name:i.name,balance:i.balance,target:i.target,minimum:i.minimum}}function Ge(i){return{revenue:i.totalRevenue,tiers:i.tiers.map(e=>({name:e.name,amount:e.paid,blocked:e.blocked,reason:e.blockReason}))}}function Qt(i){return{name:i.name,section:i.section??"",conditions:i.conditions.map(e=>({name:e.name,description:e.description??"",responsible:e.responsible??"",status:e.status}))}}function Yt(i){return{name:i.name,target:i.targetDate??"",longstop:i.longstopDate??"",measurement:i.measurement??"",targetValue:i.targetValue??0,currentValue:i.currentValue??0,status:i.status,percentComplete:i.completionPercent??0}}function Wt(i){return{name:i.name,agency:i.agency??"",type:i.requirementType??"",requiredFor:i.requiredFor??"",status:i.status,approvalDate:i.approvalDate??void 0,dueDate:void 0}}function Ht(i){return{name:i.name,metric:i.metric??"",p50:i.p50??0,p75:i.p75??void 0,p90:i.p90??void 0,p99:i.p99??0,actual:i.actual??0,performanceLevel:i.performanceLevel??"below_p99",meetsGuarantee:i.meetsGuarantee,shortfall:i.shortfall,unit:void 0}}function zt(i){return{name:i.name,assetType:i.assetType??"",initialCapacity:i.initialCapacity,currentYear:i.year,cumulativeDegradation:i.cumulativeDegradation,effectiveCapacity:i.effectiveCapacity,minimumCapacity:i.atMinimum?i.effectiveCapacity:0}}function Kt(i){return{name:i.name,metric:i.metric??"",currentSeason:i.seasons.join(", "),adjustmentFactor:i.adjustmentFactor,active:i.active,reason:i.reason??void 0}}function Xt(i){return{name:i.name,structureType:i.structureType??"partnership_flip",taxInvestor:i.taxInvestor??"",sponsor:i.sponsor??"",taxCreditAllocation:i.taxCreditAllocation??{investor:0,sponsor:0},cashAllocation:i.cashAllocation??{investor:0,sponsor:0},targetReturn:i.targetReturn??0,currentIRR:void 0,hasFlipped:i.hasFlipped,flipDate:i.flipDate??void 0,buyoutPrice:i.buyoutPrice??void 0}}function Jt(i){return{name:i.name,creditType:i.creditType??"itc",baseRate:i.baseRate??0,effectiveRate:i.effectiveRate??0,eligibleBasis:i.eligibleBasis??void 0,creditAmount:i.creditAmount??0,adders:i.adders,vestingPeriod:void 0,percentVested:i.isVested?100:void 0}}function Zt(i){return{name:i.name,method:i.method??"",depreciableBasis:i.depreciableBasis??0,bonusDepreciation:i.bonusDepreciation??0,currentYear:i.year,yearlyDepreciation:i.totalDepreciation??0,cumulativeDepreciation:i.cumulativeDepreciation??0,remainingBasis:i.remainingBasis??0}}function ea(i){const e=typeof i.triggerValue=="number"?i.triggerValue:void 0;return{name:i.name,trigger:i.trigger??"target_return",targetValue:e,currentValue:void 0,projectedFlipDate:void 0,hasTriggered:i.hasTriggered,triggerDate:i.triggerDate??void 0,preFlipAllocation:i.preFlipAllocation??{investor:0,sponsor:0},postFlipAllocation:i.postFlipAllocation??{investor:0,sponsor:0}}}const ta={isLoaded:!1,isLoading:!1,error:null,interpreter:null,code:"",financials:{},covenants:[],baskets:[],milestones:[],reserves:[],waterfall:null,conditionsPrecedent:[],industry:null,isMultiPeriod:!1,complianceHistory:{},projectName:"",currentPhase:null,loadFromCode:async(i,e,t)=>!1,loadFinancials:()=>{},updateFinancial:()=>{},refresh:()=>{},executeWaterfall:()=>null,getCalculationTree:()=>null,getDefinitionNames:()=>[],getConditionsPrecedentRaw:()=>[],dashboardData:null},Ze=l.createContext(ta);function aa({children:i,initialCode:e,initialFinancials:t}){const[a,n]=l.useState(null),[r,s]=l.useState(!1),[o,c]=l.useState(!1),[d,f]=l.useState(null),[h,y]=l.useState(""),[T,R]=l.useState(t??{}),[B,P]=l.useState([]),[$,w]=l.useState([]),[V,W]=l.useState([]),[L,q]=l.useState([]),[G,H]=l.useState(null),[j,ee]=l.useState([]),[Q,z]=l.useState(null),[te,v]=l.useState(!1),[b,g]=l.useState({}),[p,u]=l.useState(""),[m,S]=l.useState(null),A=l.useCallback(()=>{if(a)try{const D=new Set(a.getSuspendedCovenants());try{const x=a.checkAllCovenants();P(x.map(I=>qt(I,D.has(I.name))))}catch(x){console.warn("Error checking covenants:",x),P([])}w(a.getAllBasketStatuses());const M=a.getAllMilestoneStatuses();W(M.map(Gt));const k=a.getAllReserveStatuses();q(k.map(jt));const K=a.getCPChecklistNames().map(x=>a.getCPChecklist(x));ee(K.map(Qt)),S(a.getCurrentPhase());const ae=a.getTechnicalMilestoneNames(),ie=a.getRegulatoryRequirementNames(),U=a.getPerformanceGuaranteeNames(),Me=a.getDegradationScheduleNames(),Be=a.getSeasonalAdjustmentNames(),de=a.getTaxEquityStructureNames(),Ee=a.getTaxCreditNames(),Ce=a.getDepreciationScheduleNames(),Ae=a.getFlipEventNames();if(ae.length>0||ie.length>0||U.length>0||de.length>0){const x={};if(ae.length>0&&(x.technicalMilestones=ae.map(I=>a.getTechnicalMilestoneStatus(I)).map(Yt)),ie.length>0&&(x.regulatoryRequirements=ie.map(I=>a.getRegulatoryRequirementStatus(I)).map(Wt)),U.length>0&&(x.performanceGuarantees=U.map(I=>a.getPerformanceGuaranteeStatus(I)).map(Ht)),Me.length>0&&(x.degradation=Me.map(I=>a.getDegradedCapacity(I,1)).map(zt)),Be.length>0&&(x.seasonalAdjustments=Be.map(I=>a.getSeasonalAdjustmentStatus(I)).map(Kt)),de.length>0||Ee.length>0||Ce.length>0||Ae.length>0){if(x.taxEquity={},de.length>0){const I=a.getTaxEquityStructureStatus(de[0]);x.taxEquity.structure=Xt(I)}Ee.length>0&&(x.taxEquity.credits=Ee.map(I=>a.getTaxCreditStatus(I)).map(Jt)),Ce.length>0&&(x.taxEquity.depreciation=Ce.map(I=>a.getDepreciationForYear(I,1)).map(Zt)),Ae.length>0&&(x.taxEquity.flipEvents=Ae.map(I=>a.getFlipEventStatus(I)).map(ea))}z(x)}else z(null);const Oe=a.getWaterfallNames();if(Oe.length>0)try{const x=a.evaluate("Revenue")??a.evaluate("revenue")??0,I=a.executeWaterfall(Oe[0],x);H(Ge(I))}catch{}const ke=a.hasMultiPeriodData();if(v(ke),ke){const x=a.getComplianceHistory(),I={};for(const Le of x)for(const re of Le.covenants)I[re.name]||(I[re.name]=[]),I[re.name].push({period:Le.period,actual:re.actual,threshold:re.threshold,compliant:re.compliant});g(I)}else g({})}catch(D){console.error("Error refreshing ProViso state:",D)}},[a]),N=l.useCallback(async(D,M,k)=>{var ne;c(!0),f(null);try{const K=await Je(D);if(!K.success||!K.ast){const U=((ne=K.error)==null?void 0:ne.message)??"Parse failed";return f(U),c(!1),!1}const ae=new Y(K.ast);if(k)ae.loadFinancials(k),M&&R(M);else{const U=M??(Object.keys(T).length>0?T:null);U&&(ae.loadFinancials(U),M&&R(M))}n(ae),y(D),s(!0),c(!1);const ie=D.split(`
`).find(U=>U.trim().startsWith("//"));return ie&&u(ie.replace("//","").trim()),!0}catch(K){return f(K.message),c(!1),!1}},[T]),O=l.useCallback(D=>{R(D),a&&(a.loadFinancials(D),A())},[a,A]),F=l.useCallback((D,M)=>{const k={...T,[D]:M};R(k),a&&(a.loadFinancials(k),A())},[T,a,A]),_=l.useCallback((D,M)=>{if(!a)return null;try{const k=a.executeWaterfall(D,M),ne=Ge(k);return H(ne),ne}catch(k){return console.error("Error executing waterfall:",k),null}},[a]),ve=l.useCallback(D=>{if(!a)return null;try{return a.getCalculationTree(D)}catch(M){return console.error("Error getting calculation tree:",M),null}},[a]),Ct=l.useCallback(()=>a?a.getDefinitionNames():[],[a]),At=l.useCallback(()=>{if(!a)return[];try{return a.getCPChecklistNames().map(M=>a.getCPChecklist(M))}catch(D){return console.error("Error getting CP checklists:",D),[]}},[a]);l.useEffect(()=>{a&&A()},[a,A]);const St=l.useMemo(()=>r?{project:{name:p||"Untitled Project",facility:"",sponsor:"",borrower:""},phase:{current:m??"Unknown",constructionStart:"",codTarget:"",maturity:""},financials:T,covenants:B,baskets:$.map(D=>({name:D.name,capacity:D.capacity,used:D.used,available:D.capacity-D.used,utilization:D.capacity>0?D.used/D.capacity*100:0})),milestones:V,reserves:L,waterfall:G??{revenue:0,tiers:[]},conditionsPrecedent:j,industry:Q??void 0}:null,[r,p,m,T,B,$,V,L,G,j,Q]);l.useEffect(()=>{e&&!r&&!o&&N(e)},[e,r,o,N]);const bt={isLoaded:r,isLoading:o,error:d,interpreter:a,code:h,financials:T,covenants:B,baskets:$,milestones:V,reserves:L,waterfall:G,conditionsPrecedent:j,industry:Q,isMultiPeriod:te,complianceHistory:b,projectName:p,currentPhase:m,loadFromCode:N,loadFinancials:O,updateFinancial:F,refresh:A,executeWaterfall:_,getCalculationTree:ve,getDefinitionNames:Ct,getConditionsPrecedentRaw:At,dashboardData:St};return E.jsx(Ze.Provider,{value:bt,children:i})}function na(){const i=l.useContext(Ze);if(!i)throw new Error("useProViso must be used within a ProVisoProvider");return i}const et=`// Desert Sun Solar Project
// $280M Construction + Term Loan
// ProViso v2.1

// ==================== PHASES ====================

PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED TotalLeverage, MinDSCR
  REQUIRED MinEquityContribution

PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE TotalLeverage, SeniorLeverage, InterestCoverage, MinDSCR

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    GridSynchronization,
    FinalInspection
  )

// ==================== MILESTONES ====================

MILESTONE SitePrepComplete
  TARGET 2025-03-15
  LONGSTOP 2025-05-15
  TRIGGERS Draw2Available

MILESTONE PileInstallation
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  REQUIRES SitePrepComplete
  TRIGGERS Draw3Available

MILESTONE TrackerInstallation
  TARGET 2025-09-30
  LONGSTOP 2025-12-31
  REQUIRES PileInstallation

MILESTONE ModuleInstallation
  TARGET 2025-12-15
  LONGSTOP 2026-03-15
  REQUIRES TrackerInstallation
  TRIGGERS Draw4Available

MILESTONE InverterCommissioning
  TARGET 2026-02-28
  LONGSTOP 2026-05-31
  REQUIRES ModuleInstallation

// AT-RISK: Only 5 days until longstop!
MILESTONE SubstationComplete
  TARGET 2026-01-31
  LONGSTOP 2026-02-10
  REQUIRES TrackerInstallation
  TRIGGERS SubstationCertification

MILESTONE GridSynchronization
  TARGET 2026-04-15
  LONGSTOP 2026-07-15
  REQUIRES ALL_OF(InverterCommissioning, SubstationComplete)

MILESTONE SubstantialCompletion
  TARGET 2026-04-30
  LONGSTOP 2026-07-31
  REQUIRES ALL_OF(GridSynchronization, FinalInspection)
  TRIGGERS COD_Achieved

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization

DEFINE TotalDebt AS
  senior_debt + subordinated_debt

DEFINE SeniorDebt AS
  senior_debt

DEFINE DebtService AS
  senior_interest + senior_principal

DEFINE DSCR AS
  EBITDA / DebtService

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE SeniorLeverage AS
  SeniorDebt / EBITDA

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at 4.35x vs 4.50x threshold (97%)
COVENANT TotalLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

COVENANT SeniorLeverage
  REQUIRES SeniorLeverage <= 3.50
  TESTED QUARTERLY

COVENANT InterestCoverage
  REQUIRES EBITDA / interest_expense >= 2.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility

COVENANT MinDSCR
  REQUIRES DSCR >= 1.25
  TESTED QUARTERLY

COVENANT MinEquityContribution
  REQUIRES equity_contributed >= 0.30 * total_project_cost
  TESTED MONTHLY

// ==================== RESERVES ====================

RESERVE DebtServiceReserve
  TARGET 6 * monthly_debt_service
  MINIMUM 3 * monthly_debt_service
  FUNDED_BY Waterfall, EquityContribution
  RELEASED_TO Waterfall

RESERVE MaintenanceReserve
  TARGET annual_capex_budget
  MINIMUM 0.5 * annual_capex_budget
  FUNDED_BY Waterfall
  RELEASED_FOR PermittedCapEx

// ==================== WATERFALL ====================

WATERFALL OperatingWaterfall
  FREQUENCY monthly

  TIER 1 "Operating Expenses"
    PAY operating_expenses
    FROM Revenue

  TIER 2 "Senior Debt Service"
    PAY senior_interest + senior_principal
    FROM REMAINDER
    SHORTFALL -> DebtServiceReserve

  TIER 3 "DSRA Replenishment"
    PAY TO DebtServiceReserve
    UNTIL DebtServiceReserve >= 6 * monthly_debt_service
    FROM REMAINDER

  TIER 4 "Maintenance Reserve"
    PAY TO MaintenanceReserve
    UNTIL MaintenanceReserve >= annual_capex_budget
    FROM REMAINDER

  TIER 5 "Distributions"
    IF DSCR >= 1.50
    PAY distributions
    FROM REMAINDER

// ==================== TAX EQUITY ====================

TAX_EQUITY_STRUCTURE SolarPartnership
  STRUCTURE_TYPE partnership_flip
  TAX_INVESTOR "Tax Equity Fund LP"
  SPONSOR "Desert Sun Holdings LLC"
  TAX_CREDIT_ALLOCATION 99/1
  DEPRECIATION_ALLOCATION 99/1
  CASH_ALLOCATION 10/90
  TARGET_RETURN 8.0
  BUYOUT_PRICE $5_000_000

TAX_CREDIT SolarITC
  CREDIT_TYPE itc
  RATE 30
  ADDER domestic_content + 10
  ADDER energy_community + 10
  ELIGIBLE_BASIS $240_000_000
  VESTING_PERIOD "5 YEARS"
  RECAPTURE_RISK "20"

DEPRECIATION_SCHEDULE SolarMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $240_000_000
  BONUS_DEPRECIATION 60

FLIP_EVENT TargetReturnFlip
  TRIGGER target_return 8.0
  PRE_FLIP_ALLOCATION 99/1
  POST_FLIP_ALLOCATION 5/95
  BUYOUT_OPTION fair_market_value

// ==================== TECHNICAL MILESTONES ====================

TECHNICAL_MILESTONE PileProgress
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  MEASUREMENT "piles driven"
  TARGET_VALUE 45000
  CURRENT_VALUE 38500
  PROGRESS_METRIC 85.6

TECHNICAL_MILESTONE ModuleProgress
  TARGET 2025-12-15
  LONGSTOP 2026-03-15
  MEASUREMENT "MW installed"
  TARGET_VALUE 200
  CURRENT_VALUE 140
  PROGRESS_METRIC 70

// ==================== PERFORMANCE GUARANTEES ====================

PERFORMANCE_GUARANTEE AnnualProduction
  METRIC annual_gwh
  P50 520
  P75 495
  P90 470
  P99 440
  GUARANTEE_PERIOD "10 YEARS"
  SHORTFALL_RATE $50

PERFORMANCE_GUARANTEE AvailabilityGuarantee
  METRIC availability_pct
  P50 99.0
  P75 98.5
  P90 97.5
  P99 96.0
  GUARANTEE_PERIOD "25 YEARS"

// ==================== DEGRADATION ====================

DEGRADATION_SCHEDULE PanelDegradation
  ASSET_TYPE bifacial_mono_perc
  INITIAL_CAPACITY 200
  YEAR_1_DEGRADATION 2.0
  ANNUAL_DEGRADATION 0.4
  MINIMUM_CAPACITY 80
  AFFECTS annual_gwh

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP PPAExecuted
    DESCRIPTION "Executed Power Purchase Agreement with utility"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP InterconnectionAgreement
    DESCRIPTION "Executed Large Generator Interconnection Agreement"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP EPCContract
    DESCRIPTION "Executed EPC contract with creditworthy contractor"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TaxEquityCommitment
    DESCRIPTION "Executed Tax Equity Partnership Agreement"
    RESPONSIBLE TaxCounsel
    STATUS pending

  CP EnvironmentalPermits
    DESCRIPTION "All required environmental permits obtained"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP ALTASurvey
    DESCRIPTION "ALTA/NSPS Land Title Survey"
    RESPONSIBLE Borrower
    STATUS pending

  CP InsuranceCertificates
    DESCRIPTION "Builder's risk and liability insurance"
    RESPONSIBLE Borrower
    STATUS satisfied
`,tt={net_income:16e6,interest_expense:14e6,tax_expense:45e5,depreciation:26e6,amortization:25e5,senior_debt:19e7,subordinated_debt:28e6,senior_interest:95e5,senior_principal:6e6,total_project_cost:28e7,equity_contributed:84e6,monthly_debt_service:13e5,annual_capex_budget:26e5,operating_expenses:52e5,distributions:6e6,Revenue:38e6,total_assets:295e6,annual_gwh:475,availability_pct:98.2},ia=[{period:"Q4 2024",periodEnd:"2024-12-31",data:{net_income:145e5,interest_expense:138e5,tax_expense:42e5,depreciation:255e5,amortization:24e5,senior_debt:195e6,subordinated_debt:3e7,senior_interest:98e5,senior_principal:58e5,total_project_cost:28e7,equity_contributed:84e6,monthly_debt_service:13e5,annual_capex_budget:26e5,operating_expenses:51e5,distributions:55e5,Revenue:365e5,total_assets:298e6,annual_gwh:460,availability_pct:97.8},complianceStatus:"compliant"},{period:"Q1 2025",periodEnd:"2025-03-31",data:{net_income:152e5,interest_expense:139e5,tax_expense:44e5,depreciation:258e5,amortization:245e4,senior_debt:193e6,subordinated_debt:29e6,senior_interest:965e4,senior_principal:59e5,total_project_cost:28e7,equity_contributed:84e6,monthly_debt_service:13e5,annual_capex_budget:26e5,operating_expenses:515e4,distributions:58e5,Revenue:372e5,total_assets:297e6,annual_gwh:465,availability_pct:98},complianceStatus:"compliant"},{period:"Q2 2025",periodEnd:"2025-06-30",data:{net_income:128e5,interest_expense:141e5,tax_expense:38e5,depreciation:26e6,amortization:25e5,senior_debt:192e6,subordinated_debt:285e5,senior_interest:96e5,senior_principal:6e6,total_project_cost:28e7,equity_contributed:84e6,monthly_debt_service:13e5,annual_capex_budget:26e5,operating_expenses:52e5,distributions:55e5,Revenue:36e6,total_assets:296e6,annual_gwh:450,availability_pct:97.5},complianceStatus:"cured",cureUsed:"InterestCoverage - $3M equity cure applied"},{period:"Q3 2025",periodEnd:"2025-09-30",data:{net_income:158e5,interest_expense:14e6,tax_expense:46e5,depreciation:26e6,amortization:25e5,senior_debt:191e6,subordinated_debt:282e5,senior_interest:955e4,senior_principal:6e6,total_project_cost:28e7,equity_contributed:84e6,monthly_debt_service:13e5,annual_capex_budget:26e5,operating_expenses:52e5,distributions:6e6,Revenue:378e5,total_assets:296e6,annual_gwh:470,availability_pct:98.1},complianceStatus:"compliant"},{period:"Q4 2025",periodEnd:"2025-12-31",data:{net_income:162e5,interest_expense:14e6,tax_expense:47e5,depreciation:26e6,amortization:25e5,senior_debt:1905e5,subordinated_debt:28e6,senior_interest:95e5,senior_principal:6e6,total_project_cost:28e7,equity_contributed:84e6,monthly_debt_service:13e5,annual_capex_budget:26e5,operating_expenses:52e5,distributions:6e6,Revenue:38e6,total_assets:2955e5,annual_gwh:473,availability_pct:98.2},complianceStatus:"compliant"},{period:"Q1 2026",periodEnd:"2026-01-31",data:tt,complianceStatus:"compliant"}],ra={industry:"solar",tensionPoints:[{type:"near_breach",element:"TotalLeverage",description:"Leverage at 4.35x vs 4.50x threshold (97%)",severity:"warning"},{type:"at_risk_milestone",element:"SubstationComplete",description:"5 days until longstop date",severity:"danger"},{type:"cure_used",element:"InterestCoverage",description:"$3M equity cure applied in Q2 2025 (1 of 3 uses)",severity:"warning"}],currentDate:"2026-02-05",phaseInfo:{current:"Construction",startDate:"2025-01-15",targetDate:"2026-04-30",maturity:"2046-06-30"}},at=`// Prairie Wind Farm
// $200M Construction + Term Loan
// ProViso v2.1

// ==================== PHASES ====================

PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED TotalLeverage, MinDSCR
  REQUIRED MinEquityContribution

PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE TotalLeverage, SeniorLeverage, InterestCoverage, MinDSCR, CurtailmentLimit

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    GridConnection,
    TurbineCommissioning
  )

// ==================== MILESTONES ====================

MILESTONE FoundationPours
  TARGET 2025-04-30
  LONGSTOP 2025-07-31
  TRIGGERS Draw2Available

MILESTONE TowerErection
  TARGET 2025-07-31
  LONGSTOP 2025-10-31
  REQUIRES FoundationPours
  TRIGGERS Draw3Available

MILESTONE NacelleInstallation
  TARGET 2025-09-30
  LONGSTOP 2025-12-31
  REQUIRES TowerErection

// AT-RISK: Only 7 days to longstop
MILESTONE BladeInstallation
  TARGET 2025-12-31
  LONGSTOP 2026-02-12
  REQUIRES NacelleInstallation
  TRIGGERS TurbineCommissioning

MILESTONE CollectorSystem
  TARGET 2026-01-15
  LONGSTOP 2026-03-15
  REQUIRES TowerErection

MILESTONE GridConnection
  TARGET 2026-02-28
  LONGSTOP 2026-05-31
  REQUIRES ALL_OF(CollectorSystem, SubstationComplete)

MILESTONE SubstantialCompletion
  TARGET 2026-03-31
  LONGSTOP 2026-06-30
  REQUIRES ALL_OF(GridConnection, TurbineCommissioning)
  TRIGGERS COD_Achieved

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization

DEFINE TotalDebt AS
  senior_debt + subordinated_debt

DEFINE SeniorDebt AS
  senior_debt

DEFINE DebtService AS
  senior_interest + senior_principal

DEFINE DSCR AS
  EBITDA / DebtService

DEFINE Leverage AS
  TotalDebt / EBITDA

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at 4.28x vs 4.50x threshold (95%)
COVENANT TotalLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER life_of_facility MAX_AMOUNT $15_000_000

COVENANT SeniorLeverage
  REQUIRES SeniorDebt / EBITDA <= 3.25
  TESTED QUARTERLY

COVENANT InterestCoverage
  REQUIRES EBITDA / interest_expense >= 2.75
  TESTED QUARTERLY

COVENANT MinDSCR
  REQUIRES DSCR >= 1.30
  TESTED QUARTERLY

COVENANT MinEquityContribution
  REQUIRES equity_contributed >= 0.30 * total_project_cost
  TESTED MONTHLY

COVENANT CurtailmentLimit
  REQUIRES curtailment_pct <= 5.0
  TESTED MONTHLY

// ==================== RESERVES ====================

RESERVE DebtServiceReserve
  TARGET 6 * monthly_debt_service
  MINIMUM 3 * monthly_debt_service
  FUNDED_BY Waterfall, EquityContribution
  RELEASED_TO Waterfall

RESERVE GearboxReserve
  TARGET gearbox_replacement_cost
  MINIMUM 0.5 * gearbox_replacement_cost
  FUNDED_BY Waterfall
  RELEASED_FOR GearboxReplacement

// ==================== WATERFALL ====================

WATERFALL OperatingWaterfall
  FREQUENCY monthly

  TIER 1 "Operating Expenses"
    PAY operating_expenses
    FROM Revenue

  TIER 2 "Senior Debt Service"
    PAY senior_interest + senior_principal
    FROM REMAINDER
    SHORTFALL -> DebtServiceReserve

  TIER 3 "DSRA Replenishment"
    PAY TO DebtServiceReserve
    UNTIL DebtServiceReserve >= 6 * monthly_debt_service
    FROM REMAINDER

  TIER 4 "Gearbox Reserve"
    PAY TO GearboxReserve
    UNTIL GearboxReserve >= gearbox_replacement_cost
    FROM REMAINDER

  TIER 5 "Distributions"
    IF DSCR >= 1.50
    PAY distributions
    FROM REMAINDER

// ==================== TAX EQUITY ====================

TAX_CREDIT WindPTC
  CREDIT_TYPE ptc
  RATE 2.75
  ADDER domestic_content + 10
  VESTING_PERIOD "10 YEARS"

DEPRECIATION_SCHEDULE WindMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $160_000_000
  BONUS_DEPRECIATION 60

// ==================== PERFORMANCE GUARANTEES ====================

PERFORMANCE_GUARANTEE NetCapacityFactor
  METRIC capacity_factor_pct
  P50 42.0
  P75 40.5
  P90 38.5
  P99 36.0
  GUARANTEE_PERIOD "15 YEARS"
  SHORTFALL_RATE $45

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP TurbineSupplyAgreement
    DESCRIPTION "Executed TSA with Vestas"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP WindResourceStudy
    DESCRIPTION "Independent wind resource assessment"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP FAA_Determination
    DESCRIPTION "FAA No Hazard Determination for all turbines"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TribalConsultation
    DESCRIPTION "Completed tribal consultation process"
    RESPONSIBLE Borrower
    STATUS pending

  CP HedgeAgreement
    DESCRIPTION "Revenue hedge with investment grade counterparty"
    RESPONSIBLE Borrower
    STATUS satisfied
`,nt={net_income:12e6,interest_expense:105e5,tax_expense:34e5,depreciation:18e6,amortization:18e5,senior_debt:14e7,subordinated_debt:15e6,senior_interest:7e6,senior_principal:45e5,total_project_cost:2e8,equity_contributed:6e7,monthly_debt_service:96e4,gearbox_replacement_cost:8e6,operating_expenses:38e5,distributions:45e5,Revenue:28e6,capacity_factor_pct:39.2,curtailment_pct:3.8,total_assets:215e6},sa=[{period:"Q4 2024",periodEnd:"2024-12-31",data:{net_income:112e5,interest_expense:108e5,tax_expense:32e5,depreciation:175e5,amortization:17e5,senior_debt:145e6,subordinated_debt:16e6,senior_interest:72e5,senior_principal:43e5,total_project_cost:2e8,equity_contributed:6e7,monthly_debt_service:96e4,gearbox_replacement_cost:8e6,operating_expenses:37e5,distributions:42e5,Revenue:265e5,total_assets:218e6,capacity_factor_pct:38.5,curtailment_pct:3.5},complianceStatus:"compliant"},{period:"Q1 2025",periodEnd:"2025-03-31",data:{net_income:108e5,interest_expense:107e5,tax_expense:31e5,depreciation:178e5,amortization:175e4,senior_debt:143e6,subordinated_debt:155e5,senior_interest:715e4,senior_principal:44e5,total_project_cost:2e8,equity_contributed:6e7,monthly_debt_service:96e4,gearbox_replacement_cost:8e6,operating_expenses:375e4,distributions:43e5,Revenue:27e6,total_assets:217e6,capacity_factor_pct:38.8,curtailment_pct:3.6},complianceStatus:"compliant"},{period:"Q2 2025",periodEnd:"2025-06-30",data:{net_income:115e5,interest_expense:106e5,tax_expense:33e5,depreciation:179e5,amortization:178e4,senior_debt:142e6,subordinated_debt:152e5,senior_interest:71e5,senior_principal:445e4,total_project_cost:2e8,equity_contributed:6e7,monthly_debt_service:96e4,gearbox_replacement_cost:8e6,operating_expenses:378e4,distributions:44e5,Revenue:275e5,total_assets:216e6,capacity_factor_pct:39,curtailment_pct:3.7},complianceStatus:"compliant"},{period:"Q3 2025",periodEnd:"2025-09-30",data:{net_income:102e5,interest_expense:106e5,tax_expense:29e5,depreciation:1795e4,amortization:179e4,senior_debt:141e6,subordinated_debt:151e5,senior_interest:705e4,senior_principal:45e5,total_project_cost:2e8,equity_contributed:6e7,monthly_debt_service:96e4,gearbox_replacement_cost:8e6,operating_expenses:38e5,distributions:42e5,Revenue:26e6,total_assets:2155e5,capacity_factor_pct:37.5,curtailment_pct:4.8},complianceStatus:"cured",cureUsed:"TotalLeverage - $2M equity cure applied (1 of 2 uses)"},{period:"Q4 2025",periodEnd:"2025-12-31",data:{net_income:118e5,interest_expense:105e5,tax_expense:335e4,depreciation:18e6,amortization:18e5,senior_debt:1405e5,subordinated_debt:15e6,senior_interest:7e6,senior_principal:45e5,total_project_cost:2e8,equity_contributed:6e7,monthly_debt_service:96e4,gearbox_replacement_cost:8e6,operating_expenses:38e5,distributions:45e5,Revenue:278e5,total_assets:215e6,capacity_factor_pct:39,curtailment_pct:3.9},complianceStatus:"compliant"},{period:"Q1 2026",periodEnd:"2026-01-31",data:nt,complianceStatus:"compliant"}],oa={industry:"wind",tensionPoints:[{type:"near_breach",element:"TotalLeverage",description:"Leverage at 4.28x vs 4.50x threshold (95%)",severity:"warning"},{type:"at_risk_milestone",element:"BladeInstallation",description:"7 days until longstop date",severity:"danger"},{type:"cure_used",element:"TotalLeverage",description:"$2M equity cure applied in Q3 2025 (1 of 2 uses)",severity:"warning"}],currentDate:"2026-02-05",phaseInfo:{current:"Construction",startDate:"2025-01-01",targetDate:"2026-03-31",maturity:"2041-03-31"}},it=`// Apex Industries Credit Facility
// $150M Revolving Credit Facility
// ProViso v2.0

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization
  EXCLUDING extraordinary_items

DEFINE TotalDebt AS
  funded_debt + capital_leases

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE InterestCoverage AS
  EBITDA / interest_expense

DEFINE FixedChargeCoverage AS
  EBITDA / (interest_expense + principal_payments + capital_leases)

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at 4.38x vs 4.50x threshold (97%)
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility MAX_AMOUNT $20_000_000
  BREACH -> UnmaturedDefault

COVENANT MinInterestCoverage
  REQUIRES InterestCoverage >= 2.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility
  BREACH -> UnmaturedDefault

COVENANT MinFixedCharge
  REQUIRES FixedChargeCoverage >= 1.10
  TESTED QUARTERLY
  BREACH -> UnmaturedDefault

COVENANT MinLiquidity
  REQUIRES cash >= 15_000_000
  TESTED QUARTERLY

// ==================== BASKETS ====================

BASKET GeneralInvestments
  CAPACITY $25_000_000

BASKET RestrictedPayments
  CAPACITY GreaterOf($10_000_000, 0.05 * total_assets)

BASKET CapEx
  CAPACITY $20_000_000

BASKET PermittedAcquisitions
  CAPACITY $75_000_000
  SUBJECT TO NoDefault, ProFormaCompliance

// ==================== GROWER BASKETS ====================

BASKET EBITDAInvestments
  CAPACITY 0.15 * EBITDA
  FLOOR $15_000_000
  SUBJECT TO NoDefault

BASKET AssetBasedBasket
  CAPACITY 0.05 * total_assets
  FLOOR $5_000_000

// ==================== BUILDER BASKETS ====================

// Shows accumulation over time - currently at $18.5M
BASKET RetainedEarningsBasket
  BUILDS_FROM 0.50 * net_income
  STARTING $10_000_000
  MAXIMUM $75_000_000
  SUBJECT TO NoDefault

BASKET AssetSaleProceeds
  BUILDS_FROM asset_sale_reinvestment
  STARTING $0
  MAXIMUM $50_000_000

// ==================== CONDITIONS ====================

CONDITION NoDefault AS
  NOT EXISTS(EventOfDefault) AND NOT EXISTS(UnmaturedDefault)

CONDITION ProFormaCompliance AS
  COMPLIANT(MaxLeverage) AND COMPLIANT(MinInterestCoverage)

// ==================== PROHIBITIONS ====================

PROHIBIT Investments
  EXCEPT WHEN
    | amount <= AVAILABLE(GeneralInvestments)
    | AND NoDefault

PROHIBIT Dividends
  EXCEPT WHEN
    | amount <= AVAILABLE(RestrictedPayments)
    | AND NoDefault
    | AND COMPLIANT(MaxLeverage)

PROHIBIT CapitalExpenditures
  EXCEPT WHEN
    | amount <= AVAILABLE(CapEx)

// ==================== EVENTS OF DEFAULT ====================

EVENT PaymentDefault
  TRIGGERS WHEN payment_due AND NOT payment_received
  GRACE_PERIOD 5 DAYS
  CONSEQUENCE EventOfDefault

EVENT CovenantDefault
  TRIGGERS WHEN NOT COMPLIANT(MaxLeverage) OR NOT COMPLIANT(MinInterestCoverage)
  GRACE_PERIOD 30 DAYS
  CONSEQUENCE EventOfDefault

EVENT CrossDefault
  TRIGGERS WHEN external_debt_default > 10_000_000
  CONSEQUENCE EventOfDefault

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialClosing
  SECTION "4.01"

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP CorporateDocuments
    DESCRIPTION "Charter, bylaws, and resolutions"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP SecurityAgreement
    DESCRIPTION "Security Agreement and UCC filings"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP LegalOpinions
    DESCRIPTION "Borrower counsel and local counsel opinions"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP SolvencyCertificate
    DESCRIPTION "CFO solvency certificate"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP FinancialStatements
    DESCRIPTION "Audited financials and compliance certificate"
    RESPONSIBLE Borrower
    STATUS satisfied
`,rt={net_income:17e6,interest_expense:88e5,tax_expense:58e5,depreciation:52e5,amortization:24e5,extraordinary_items:0,funded_debt:167e6,capital_leases:45e5,principal_payments:32e5,cash:185e5,total_assets:365e6,asset_sale_reinvestment:25e5,payment_due:0,payment_received:1,external_debt_default:0},ca=[{period:"Q4 2024",periodEnd:"2024-12-31",data:{net_income:155e5,interest_expense:92e5,tax_expense:53e5,depreciation:5e6,amortization:23e5,extraordinary_items:0,funded_debt:175e6,capital_leases:5e6,principal_payments:34e5,cash:22e6,total_assets:355e6,asset_sale_reinvestment:0,payment_due:0,payment_received:1,external_debt_default:0},complianceStatus:"compliant"},{period:"Q1 2025",periodEnd:"2025-03-31",data:{net_income:142e5,interest_expense:91e5,tax_expense:48e5,depreciation:51e5,amortization:235e4,extraordinary_items:0,funded_debt:173e6,capital_leases:48e5,principal_payments:33e5,cash:195e5,total_assets:358e6,asset_sale_reinvestment:12e5,payment_due:0,payment_received:1,external_debt_default:0},complianceStatus:"compliant"},{period:"Q2 2025",periodEnd:"2025-06-30",data:{net_income:118e5,interest_expense:9e6,tax_expense:4e6,depreciation:515e4,amortization:238e4,extraordinary_items:0,funded_debt:172e6,capital_leases:47e5,principal_payments:325e4,cash:162e5,total_assets:36e7,asset_sale_reinvestment:8e5,payment_due:0,payment_received:1,external_debt_default:0},complianceStatus:"cured",cureUsed:"MaxLeverage - $5M equity cure applied (1 of 3 uses)"},{period:"Q3 2025",periodEnd:"2025-09-30",data:{net_income:162e5,interest_expense:89e5,tax_expense:55e5,depreciation:518e4,amortization:239e4,extraordinary_items:0,funded_debt:17e7,capital_leases:46e5,principal_payments:32e5,cash:178e5,total_assets:362e6,asset_sale_reinvestment:18e5,payment_due:0,payment_received:1,external_debt_default:0},complianceStatus:"compliant"},{period:"Q4 2025",periodEnd:"2025-12-31",data:{net_income:168e5,interest_expense:885e4,tax_expense:57e5,depreciation:519e4,amortization:2395e3,extraordinary_items:0,funded_debt:168e6,capital_leases:455e4,principal_payments:32e5,cash:182e5,total_assets:364e6,asset_sale_reinvestment:21e5,payment_due:0,payment_received:1,external_debt_default:0},complianceStatus:"compliant"},{period:"Q1 2026",periodEnd:"2026-01-31",data:rt,complianceStatus:"compliant"}],la={industry:"corporate",tensionPoints:[{type:"near_breach",element:"MaxLeverage",description:"Leverage at 4.38x vs 4.50x threshold (97%)",severity:"warning"},{type:"cure_used",element:"MaxLeverage",description:"$5M equity cure applied in Q2 2025 (1 of 3 uses)",severity:"warning"},{type:"reserve_low",element:"RetainedEarningsBasket",description:"Builder basket at $18.5M, approaching maximum",severity:"warning"}],currentDate:"2026-02-05",phaseInfo:{current:"Operating",startDate:"2024-06-15",targetDate:"N/A",maturity:"2029-06-15"}},st=`// ABC Acquisition Facility - Lender's Counter
// Version 3.0 - Simpson Thacher

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp
) EXCLUDING extraordinary_items
  CAPPED AT $5_000_000

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 4.75
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $20_000_000

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $60_000_000
  SUBJECT TO ProFormaCompliance

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialClosing
  SECTION "4.01"

  CP CertificateOfIncorporation
    DESCRIPTION "Certified copy of the Certificate of Incorporation"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP Bylaws
    DESCRIPTION "Certified copy of the Bylaws"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP BoardResolutions
    DESCRIPTION "Board resolutions authorizing the Loan Documents"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP GoodStandingCertificate
    DESCRIPTION "Certificate of Good Standing from Delaware"
    RESPONSIBLE Borrower
    STATUS pending

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP SecurityAgreement
    DESCRIPTION "Security Agreement granting security interest"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP PledgeAgreement
    DESCRIPTION "Pledge Agreement covering equity interests"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP UCC1FinancingStatement
    DESCRIPTION "UCC-1 filed with Delaware Secretary of State"
    RESPONSIBLE AgentCounsel
    STATUS pending

  CP BorrowerCounselOpinion
    DESCRIPTION "Legal opinion of Davis Polk"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP OfficersCertificate
    DESCRIPTION "Certificate certifying conditions precedent"
    RESPONSIBLE Borrower
    STATUS pending

  CP SolvencyCertificate
    DESCRIPTION "Solvency Certificate from the CFO"
    RESPONSIBLE Borrower
    STATUS pending

  CP InsuranceCertificate
    DESCRIPTION "Certificate of insurance with Agent as loss payee"
    RESPONSIBLE Borrower
    STATUS pending

  CP KYCDocumentation
    DESCRIPTION "KYC documentation for all Lenders"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP FinancialStatements
    DESCRIPTION "Audited financial statements for FY 2025"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP ProFormaFinancialModel
    DESCRIPTION "Pro forma model showing projected compliance"
    RESPONSIBLE Borrower
    STATUS satisfied
`,Ie={net_income:15e6,interest_expense:75e5,tax_expense:5e6,depreciation:4e6,amortization:2e6,senior_debt:12e7,subordinated_debt:3e7,total_assets:3e8,cash:2e7},da=[{period:"Q4 2025",periodEnd:"2025-12-31",data:Ie,complianceStatus:"compliant"},{period:"Q1 2026",periodEnd:"2026-01-31",data:Ie,complianceStatus:"compliant"}],ua={industry:"corporate",tensionPoints:[{type:"near_breach",element:"MaxLeverage",description:"Leverage at 4.49x vs 5.00x threshold (90%)",severity:"warning"}],currentDate:"2026-02-05",phaseInfo:{current:"Operating",startDate:"2026-01-10",targetDate:"2026-03-15",maturity:"2031-03-15"}},ot=[{id:"abc-party-borrower",dealId:"abc-acquisition",name:"ABC Holdings, Inc.",shortName:"ABC",role:"borrower",partyType:"borrower",primaryContact:{name:"Jennifer Chen",email:"jchen@abcholdings.com",phone:"+1 (212) 555-0101",title:"CFO"},additionalContacts:[{name:"Michael Rodriguez",email:"mrodriguez@abcholdings.com",phone:"+1 (212) 555-0102",title:"Treasurer"}],counselPartyId:"abc-party-davis-polk"},{id:"abc-party-agent",dealId:"abc-acquisition",name:"First National Bank",shortName:"FNB",role:"administrative_agent",partyType:"agent",primaryContact:{name:"Sarah Thompson",email:"sthompson@fnb.com",phone:"+1 (212) 555-0201",title:"Managing Director"},additionalContacts:[],counselPartyId:"abc-party-simpson-thacher"},{id:"abc-party-davis-polk",dealId:"abc-acquisition",name:"Davis Polk & Wardwell LLP",shortName:"Davis Polk",role:"borrower",partyType:"law_firm",primaryContact:{name:"Elizabeth Warren",email:"elizabeth.warren@davispolk.com",phone:"+1 (212) 555-0401",title:"Partner"},additionalContacts:[],counselPartyId:null},{id:"abc-party-simpson-thacher",dealId:"abc-acquisition",name:"Simpson Thacher & Bartlett LLP",shortName:"Simpson Thacher",role:"administrative_agent",partyType:"law_firm",primaryContact:{name:"William Harris",email:"wharris@stblaw.com",phone:"+1 (212) 555-0501",title:"Partner"},additionalContacts:[],counselPartyId:null}],pa=[{id:"abc-version-1",dealId:"abc-acquisition",versionNumber:1,versionLabel:"Lender's Initial Draft",creditLangCode:`// ABC Acquisition Facility - Lender's Initial Draft
DEFINE EBITDA AS (NetIncome + InterestExpense + TaxExpense + DepreciationAmortization) EXCLUDING extraordinary_items
DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt
DEFINE Leverage AS TotalDebt / EBITDA
COVENANT MaxLeverage REQUIRES Leverage <= 5.00 TESTED QUARTERLY
COVENANT MinInterestCoverage REQUIRES EBITDA / InterestExpense >= 2.50 TESTED QUARTERLY
BASKET GeneralInvestments CAPACITY GreaterOf($25_000_000, 10% * EBITDA)
BASKET PermittedAcquisitions CAPACITY $50_000_000 SUBJECT TO ProFormaCompliance`,createdBy:"wharris@stblaw.com",authorParty:"Simpson Thacher",createdAt:new Date("2026-01-10T09:00:00Z"),parentVersionId:null,status:"superseded",generatedWordDoc:null,changeSummary:null},{id:"abc-version-2",dealId:"abc-acquisition",versionNumber:2,versionLabel:"Borrower's Markup",creditLangCode:`// ABC Acquisition Facility - Borrower's Markup
DEFINE EBITDA AS (NetIncome + InterestExpense + TaxExpense + DepreciationAmortization + StockBasedComp) EXCLUDING extraordinary_items
DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt
DEFINE Leverage AS TotalDebt / EBITDA
COVENANT MaxLeverage REQUIRES Leverage <= 5.25 TESTED QUARTERLY CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000
COVENANT MinInterestCoverage REQUIRES EBITDA / InterestExpense >= 2.25 TESTED QUARTERLY
BASKET GeneralInvestments CAPACITY GreaterOf($35_000_000, 15% * EBITDA)
BASKET PermittedAcquisitions CAPACITY $75_000_000 SUBJECT TO ProFormaCompliance`,createdBy:"elizabeth.warren@davispolk.com",authorParty:"Davis Polk",createdAt:new Date("2026-01-15T14:30:00Z"),parentVersionId:"abc-version-1",status:"superseded",generatedWordDoc:null,changeSummary:{versionFrom:1,versionTo:2,authorParty:"Davis Polk",createdAt:new Date("2026-01-15T14:30:00Z"),totalChanges:5,covenantChanges:2,definitionChanges:1,basketChanges:2,otherChanges:0,borrowerFavorable:5,lenderFavorable:0,neutral:0,changes:[{id:"abc-c1",changeType:"modified",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Leverage ratio threshold increased",description:"Maximum leverage ratio increased from 5.00x to 5.25x",rationale:"Provides additional headroom for acquisition integration",beforeCode:"REQUIRES Leverage <= 5.00",afterCode:"REQUIRES Leverage <= 5.25",beforeValue:"5.00x",afterValue:"5.25x",impact:"borrower_favorable",impactDescription:"+0.25x headroom at closing",sourceForm:"covenant-simple",isManualEdit:!1},{id:"abc-c2",changeType:"added",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Equity cure right added",description:"Added equity cure mechanism with 2 uses over rolling 4 quarters, max $25M",rationale:"Standard borrower protection",beforeCode:null,afterCode:"CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000",beforeValue:null,afterValue:"2 uses / $25M max",impact:"borrower_favorable",impactDescription:"Provides cure rights for leverage covenant breaches",sourceForm:"covenant-cure",isManualEdit:!1},{id:"abc-c3",changeType:"modified",elementType:"covenant",sectionReference:"7.11(b)",elementName:"MinInterestCoverage",title:"Interest coverage threshold decreased",description:"Minimum interest coverage reduced from 2.50x to 2.25x",rationale:null,beforeCode:"REQUIRES EBITDA / InterestExpense >= 2.50",afterCode:"REQUIRES EBITDA / InterestExpense >= 2.25",beforeValue:"2.50x",afterValue:"2.25x",impact:"borrower_favorable",impactDescription:"-0.25x requirement provides more operational flexibility",sourceForm:"covenant-simple",isManualEdit:!1},{id:"abc-c4",changeType:"modified",elementType:"basket",sectionReference:"7.02(f)",elementName:"GeneralInvestments",title:"General investment basket increased",description:"Capacity increased from $25M/10% to $35M/15%",rationale:null,beforeCode:"CAPACITY GreaterOf($25_000_000, 10% * EBITDA)",afterCode:"CAPACITY GreaterOf($35_000_000, 15% * EBITDA)",beforeValue:"$25M / 10%",afterValue:"$35M / 15%",impact:"borrower_favorable",impactDescription:"+$10M fixed capacity, +5% grower component",sourceForm:"basket-grower",isManualEdit:!1},{id:"abc-c5",changeType:"modified",elementType:"basket",sectionReference:"7.02(g)",elementName:"PermittedAcquisitions",title:"Acquisition basket increased",description:"Capacity increased from $50M to $75M",rationale:null,beforeCode:"CAPACITY $50_000_000",afterCode:"CAPACITY $75_000_000",beforeValue:"$50M",afterValue:"$75M",impact:"borrower_favorable",impactDescription:"+$25M additional acquisition capacity",sourceForm:"basket-fixed",isManualEdit:!1}]}},{id:"abc-version-3",dealId:"abc-acquisition",versionNumber:3,versionLabel:"Lender's Counter",creditLangCode:st,createdBy:"wharris@stblaw.com",authorParty:"Simpson Thacher",createdAt:new Date("2026-01-20T10:15:00Z"),parentVersionId:"abc-version-2",status:"draft",generatedWordDoc:null,changeSummary:{versionFrom:2,versionTo:3,authorParty:"Simpson Thacher",createdAt:new Date("2026-01-20T10:15:00Z"),totalChanges:4,covenantChanges:2,definitionChanges:1,basketChanges:1,otherChanges:0,borrowerFavorable:0,lenderFavorable:3,neutral:1,changes:[{id:"abc-c6",changeType:"modified",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Leverage ratio tightened",description:"Ratio tightened from 5.25x to 4.75x",rationale:"Compromise — accepted SBC add-back but tightened covenant",beforeCode:"REQUIRES Leverage <= 5.25",afterCode:"REQUIRES Leverage <= 4.75",beforeValue:"5.25x",afterValue:"4.75x",impact:"lender_favorable",impactDescription:"Tightened from borrower markup, compromise on EBITDA definition",sourceForm:"covenant-simple",isManualEdit:!1},{id:"abc-c7",changeType:"modified",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Cure maximum reduced",description:"Maximum cure amount reduced from $25M to $20M",rationale:null,beforeCode:"MAX_AMOUNT $25_000_000",afterCode:"MAX_AMOUNT $20_000_000",beforeValue:"$25M",afterValue:"$20M",impact:"lender_favorable",impactDescription:"-$5M cure capacity",sourceForm:"covenant-cure",isManualEdit:!1},{id:"abc-c8",changeType:"modified",elementType:"definition",sectionReference:"1.01",elementName:"EBITDA",title:"Stock-based comp add-back capped",description:"Accepted SBC add-back but with $5M annual cap",rationale:"Compromise: accept add-back but limit exposure",beforeCode:"+ StockBasedComp",afterCode:`+ StockBasedComp
  CAPPED AT $5_000_000`,beforeValue:"Unlimited",afterValue:"$5M cap",impact:"lender_favorable",impactDescription:"Limits EBITDA benefit to $5M annually",sourceForm:"definition-ebitda",isManualEdit:!1},{id:"abc-c9",changeType:"modified",elementType:"basket",sectionReference:"7.02(f)",elementName:"GeneralInvestments",title:"Investment basket compromise",description:"Capacity set to $30M/12.5%",rationale:null,beforeCode:"CAPACITY GreaterOf($35_000_000, 15% * EBITDA)",afterCode:"CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)",beforeValue:"$35M / 15%",afterValue:"$30M / 12.5%",impact:"neutral",impactDescription:"Split the difference on basket sizing",sourceForm:"basket-grower",isManualEdit:!1}]}}],ma={id:"abc-acquisition",name:"ABC Acquisition Facility",dealType:"corporate",facilityAmount:15e7,currency:"USD",status:"negotiation",currentVersionId:"abc-version-3",parties:ot,targetClosingDate:new Date("2026-03-15"),actualClosingDate:null,maturityDate:new Date("2031-03-15"),createdAt:new Date("2026-01-08T10:00:00Z"),updatedAt:new Date("2026-01-20T10:15:00Z"),createdBy:"sthompson@fnb.com"},fa=[{id:"abc-cp-1",dealId:"abc-acquisition",name:"ABC Holdings, Inc.",shortName:"Borrower",role:"borrower",partyType:"borrower"},{id:"abc-cp-2",dealId:"abc-acquisition",name:"First National Bank",shortName:"Agent",role:"administrative_agent",partyType:"agent"},{id:"abc-cp-3",dealId:"abc-acquisition",name:"Regional Capital Partners",shortName:"Lender 1",role:"lender",partyType:"lender"},{id:"abc-cp-4",dealId:"abc-acquisition",name:"Midwest Credit Fund",shortName:"Lender 2",role:"lender",partyType:"lender"},{id:"abc-cp-5",dealId:"abc-acquisition",name:"Davis Polk & Wardwell",shortName:"Borrower Counsel",role:"counsel",partyType:"law_firm"},{id:"abc-cp-6",dealId:"abc-acquisition",name:"Simpson Thacher & Bartlett",shortName:"Agent Counsel",role:"counsel",partyType:"law_firm"}],ha=[{id:"abc-cond-1",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(a)(i)",category:"corporate_documents",title:"Certificate of Incorporation",description:"Certified copy of the Certificate of Incorporation",responsiblePartyId:"abc-cp-1",status:"satisfied",dueDate:new Date("2026-02-10"),satisfiedAt:new Date("2026-01-28"),satisfiedByDocumentIds:["abc-doc-1"],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-2",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(a)(ii)",category:"corporate_documents",title:"Bylaws",description:"Certified copy of the Bylaws",responsiblePartyId:"abc-cp-1",status:"satisfied",dueDate:new Date("2026-02-10"),satisfiedAt:new Date("2026-01-28"),satisfiedByDocumentIds:["abc-doc-2"],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-3",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(a)(iii)",category:"corporate_documents",title:"Board Resolutions",description:"Board resolutions authorizing the Loan Documents",responsiblePartyId:"abc-cp-1",status:"satisfied",dueDate:new Date("2026-02-12"),satisfiedAt:new Date("2026-01-30"),satisfiedByDocumentIds:["abc-doc-3"],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-4",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(a)(iv)",category:"corporate_documents",title:"Good Standing Certificate",description:"Certificate of Good Standing from Delaware",responsiblePartyId:"abc-cp-1",status:"pending",dueDate:new Date("2026-02-14"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"Requested from Delaware Secretary of State"},{id:"abc-cond-5",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(b)(i)",category:"credit_agreement",title:"Credit Agreement Execution",description:"Fully executed Credit Agreement",responsiblePartyId:"abc-cp-5",status:"pending",dueDate:new Date("2026-02-15"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"Final signatures pending"},{id:"abc-cond-6",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(c)(i)",category:"security_documents",title:"Security Agreement",description:"Security Agreement granting security interest",responsiblePartyId:"abc-cp-5",status:"satisfied",dueDate:new Date("2026-02-12"),satisfiedAt:new Date("2026-01-31"),satisfiedByDocumentIds:["abc-doc-5"],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-7",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(c)(ii)",category:"security_documents",title:"Pledge Agreement",description:"Pledge Agreement covering equity interests",responsiblePartyId:"abc-cp-5",status:"satisfied",dueDate:new Date("2026-02-12"),satisfiedAt:new Date("2026-01-31"),satisfiedByDocumentIds:["abc-doc-6"],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-8",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(d)(i)",category:"ucc_filings",title:"UCC-1 Financing Statement",description:"UCC-1 filed with Delaware Secretary of State",responsiblePartyId:"abc-cp-6",status:"pending",dueDate:new Date("2026-02-15"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"Will file on closing date"},{id:"abc-cond-9",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(e)(i)",category:"legal_opinions",title:"Borrower Counsel Opinion",description:"Legal opinion of Davis Polk",responsiblePartyId:"abc-cp-5",status:"pending",dueDate:new Date("2026-02-14"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"Draft under review"},{id:"abc-cond-10",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(f)(i)",category:"certificates",title:"Officer's Certificate",description:"Certificate certifying conditions precedent",responsiblePartyId:"abc-cp-1",status:"pending",dueDate:new Date("2026-02-15"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-11",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(f)(ii)",category:"certificates",title:"Solvency Certificate",description:"Solvency Certificate from the CFO",responsiblePartyId:"abc-cp-1",status:"pending",dueDate:new Date("2026-02-14"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-12",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(g)(i)",category:"insurance",title:"Insurance Certificate",description:"Certificate of insurance with Agent as loss payee",responsiblePartyId:"abc-cp-1",status:"pending",dueDate:new Date("2026-02-01"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"OVERDUE - Awaiting from insurance broker"},{id:"abc-cond-13",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(h)(i)",category:"kyc_aml",title:"KYC Documentation",description:"KYC documentation for all Lenders",responsiblePartyId:"abc-cp-1",status:"satisfied",dueDate:new Date("2026-02-05"),satisfiedAt:new Date("2026-01-25"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-14",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(i)(i)",category:"financial",title:"Financial Statements",description:"Audited financial statements for FY 2025",responsiblePartyId:"abc-cp-1",status:"satisfied",dueDate:new Date("2026-02-01"),satisfiedAt:new Date("2026-01-20"),satisfiedByDocumentIds:["abc-doc-10"],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"abc-cond-15",dealId:"abc-acquisition",versionId:"abc-version-3",sectionReference:"4.01(i)(ii)",category:"financial",title:"Pro Forma Financial Model",description:"Pro forma model showing projected compliance",responsiblePartyId:"abc-cp-1",status:"satisfied",dueDate:new Date("2026-02-05"),satisfiedAt:new Date("2026-01-22"),satisfiedByDocumentIds:["abc-doc-11"],waivedAt:null,waiverApprovedBy:null,notes:""}],ga=[{id:"abc-doc-1",dealId:"abc-acquisition",documentType:"corporate",title:"Certificate of Incorporation",fileName:"ABC_Certificate_of_Incorporation.pdf",fileType:"application/pdf",storagePath:"/documents/abc-doc-1.pdf",status:"uploaded",responsiblePartyId:"abc-cp-1",uploadedAt:new Date("2026-01-28"),uploadedBy:"john.smith@abcholdings.com",dueDate:new Date("2026-02-10"),signatures:[],satisfiesConditionIds:["abc-cond-1"]},{id:"abc-doc-2",dealId:"abc-acquisition",documentType:"corporate",title:"Bylaws",fileName:"ABC_Bylaws.pdf",fileType:"application/pdf",storagePath:"/documents/abc-doc-2.pdf",status:"uploaded",responsiblePartyId:"abc-cp-1",uploadedAt:new Date("2026-01-28"),uploadedBy:"john.smith@abcholdings.com",dueDate:new Date("2026-02-10"),signatures:[],satisfiesConditionIds:["abc-cond-2"]},{id:"abc-doc-3",dealId:"abc-acquisition",documentType:"corporate",title:"Board Resolutions",fileName:"ABC_Board_Resolutions.pdf",fileType:"application/pdf",storagePath:"/documents/abc-doc-3.pdf",status:"uploaded",responsiblePartyId:"abc-cp-1",uploadedAt:new Date("2026-01-30"),uploadedBy:"john.smith@abcholdings.com",dueDate:new Date("2026-02-12"),signatures:[],satisfiesConditionIds:["abc-cond-3"]},{id:"abc-doc-4",dealId:"abc-acquisition",documentType:"credit_agreement",title:"Credit Agreement",fileName:"ABC_Credit_Agreement.pdf",fileType:"application/pdf",storagePath:"/documents/abc-doc-4.pdf",status:"pending",responsiblePartyId:"abc-cp-5",uploadedAt:new Date("2026-01-31"),uploadedBy:"partner@davispolk.com",dueDate:new Date("2026-02-15"),signatures:[{id:"abc-sig-1",documentId:"abc-doc-4",partyId:"abc-cp-1",signatoryName:"John Smith",signatoryTitle:"CEO",status:"signed",signedAt:new Date("2026-01-31")},{id:"abc-sig-2",documentId:"abc-doc-4",partyId:"abc-cp-2",signatoryName:"Sarah Johnson",signatoryTitle:"Managing Director",status:"signed",signedAt:new Date("2026-02-01")},{id:"abc-sig-3",documentId:"abc-doc-4",partyId:"abc-cp-3",signatoryName:"Michael Brown",signatoryTitle:"Partner",status:"requested",signedAt:null},{id:"abc-sig-4",documentId:"abc-doc-4",partyId:"abc-cp-4",signatoryName:"Emily Davis",signatoryTitle:"Senior VP",status:"pending",signedAt:null}],satisfiesConditionIds:["abc-cond-5"]},{id:"abc-doc-5",dealId:"abc-acquisition",documentType:"security",title:"Security Agreement",fileName:"ABC_Security_Agreement.pdf",fileType:"application/pdf",storagePath:"/documents/abc-doc-5.pdf",status:"executed",responsiblePartyId:"abc-cp-5",uploadedAt:new Date("2026-01-31"),uploadedBy:"partner@davispolk.com",dueDate:new Date("2026-02-12"),signatures:[{id:"abc-sig-5",documentId:"abc-doc-5",partyId:"abc-cp-1",signatoryName:"John Smith",signatoryTitle:"CEO",status:"signed",signedAt:new Date("2026-01-31")},{id:"abc-sig-6",documentId:"abc-doc-5",partyId:"abc-cp-2",signatoryName:"Sarah Johnson",signatoryTitle:"Managing Director",status:"signed",signedAt:new Date("2026-01-31")}],satisfiesConditionIds:["abc-cond-6"]},{id:"abc-doc-6",dealId:"abc-acquisition",documentType:"security",title:"Pledge Agreement",fileName:"ABC_Pledge_Agreement.pdf",fileType:"application/pdf",storagePath:"/documents/abc-doc-6.pdf",status:"executed",responsiblePartyId:"abc-cp-5",uploadedAt:new Date("2026-01-31"),uploadedBy:"partner@davispolk.com",dueDate:new Date("2026-02-12"),signatures:[{id:"abc-sig-7",documentId:"abc-doc-6",partyId:"abc-cp-1",signatoryName:"John Smith",signatoryTitle:"CEO",status:"signed",signedAt:new Date("2026-01-31")}],satisfiesConditionIds:["abc-cond-7"]},{id:"abc-doc-10",dealId:"abc-acquisition",documentType:"financial",title:"2025 Audited Financial Statements",fileName:"ABC_2025_Audited_Financials.pdf",fileType:"application/pdf",storagePath:"/documents/abc-doc-10.pdf",status:"uploaded",responsiblePartyId:"abc-cp-1",uploadedAt:new Date("2026-01-20"),uploadedBy:"cfo@abcholdings.com",dueDate:new Date("2026-02-01"),signatures:[],satisfiesConditionIds:["abc-cond-14"]},{id:"abc-doc-11",dealId:"abc-acquisition",documentType:"financial",title:"Pro Forma Financial Model",fileName:"ABC_ProForma_Model.xlsx",fileType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",storagePath:"/documents/abc-doc-11.xlsx",status:"uploaded",responsiblePartyId:"abc-cp-1",uploadedAt:new Date("2026-01-22"),uploadedBy:"cfo@abcholdings.com",dueDate:new Date("2026-02-05"),signatures:[],satisfiesConditionIds:["abc-cond-15"]}],ya={id:"abc-acquisition",name:"ABC Acquisition Facility",facilityAmount:15e7,currency:"USD",targetClosingDate:new Date("2026-02-15"),status:"closing"},ct={id:"abc-acquisition",name:"ABC Acquisition Facility",facility:"$150M Acquisition Facility",sponsor:"First National Bank",borrower:"ABC Holdings, Inc.",code:st,financials:Ie,historicalData:da,metadata:ua,negotiation:{deal:ma,parties:ot,versions:pa},closing:{deal:ya,parties:fa,conditions:ha,documents:ga}},lt=[{id:"solar-party-borrower",dealId:"solar-demo",name:"Desert Sun Project Co LLC",shortName:"Borrower",role:"borrower",partyType:"borrower",primaryContact:{name:"Robert Martinez",email:"rmartinez@desertsun.com",phone:"+1 (602) 555-0100",title:"Project Director"},additionalContacts:[],counselPartyId:"solar-party-latham"},{id:"solar-party-sponsor",dealId:"solar-demo",name:"Desert Sun Holdings LLC",shortName:"Sponsor",role:"borrower",partyType:"borrower",primaryContact:{name:"Amanda Lee",email:"alee@desertsun.com",phone:"+1 (602) 555-0101",title:"CFO"},additionalContacts:[],counselPartyId:"solar-party-latham"},{id:"solar-party-agent",dealId:"solar-demo",name:"CoBank",shortName:"Agent",role:"administrative_agent",partyType:"agent",primaryContact:{name:"Thomas White",email:"twhite@cobank.com",phone:"+1 (303) 555-0200",title:"Managing Director"},additionalContacts:[],counselPartyId:"solar-party-milbank"},{id:"solar-party-taxequity",dealId:"solar-demo",name:"Tax Equity Fund LP",shortName:"Tax Equity",role:"lender",partyType:"tax_equity",primaryContact:{name:"Katherine Chen",email:"kchen@taxequityfund.com",phone:"+1 (212) 555-0300",title:"Partner"},additionalContacts:[],counselPartyId:null},{id:"solar-party-latham",dealId:"solar-demo",name:"Latham & Watkins LLP",shortName:"Latham",role:"borrower",partyType:"law_firm",primaryContact:{name:"David Kim",email:"david.kim@lw.com",phone:"+1 (213) 555-0400",title:"Partner"},additionalContacts:[],counselPartyId:null},{id:"solar-party-milbank",dealId:"solar-demo",name:"Milbank LLP",shortName:"Milbank",role:"administrative_agent",partyType:"law_firm",primaryContact:{name:"Jennifer Walsh",email:"jwalsh@milbank.com",phone:"+1 (212) 555-0500",title:"Partner"},additionalContacts:[],counselPartyId:null}],va=[{id:"solar-version-1",dealId:"solar-demo",versionNumber:1,versionLabel:"Lender's Initial Draft",creditLangCode:`// Solar - Lender Initial
COVENANT MinDSCR REQUIRES DSCR >= 1.35 TESTED QUARTERLY`,createdBy:"jwalsh@milbank.com",authorParty:"Milbank",createdAt:new Date("2025-11-01"),parentVersionId:null,status:"superseded",generatedWordDoc:null,changeSummary:null},{id:"solar-version-2",dealId:"solar-demo",versionNumber:2,versionLabel:"Sponsor's Markup",creditLangCode:`// Solar - Sponsor Markup
COVENANT MinDSCR REQUIRES DSCR >= 1.20 TESTED QUARTERLY
DEGRADATION_SCHEDULE PanelDegradation ANNUAL_DEGRADATION 0.5`,createdBy:"david.kim@lw.com",authorParty:"Latham",createdAt:new Date("2025-11-15"),parentVersionId:"solar-version-1",status:"superseded",generatedWordDoc:null,changeSummary:{versionFrom:1,versionTo:2,authorParty:"Latham",createdAt:new Date("2025-11-15"),totalChanges:2,covenantChanges:1,definitionChanges:0,basketChanges:0,otherChanges:1,borrowerFavorable:2,lenderFavorable:0,neutral:0,changes:[{id:"solar-c1",changeType:"modified",elementType:"covenant",sectionReference:"7.01",elementName:"MinDSCR",title:"DSCR threshold reduced",description:"Minimum DSCR reduced from 1.35x to 1.20x",rationale:"Standard project finance threshold",beforeCode:"REQUIRES DSCR >= 1.35",afterCode:"REQUIRES DSCR >= 1.20",beforeValue:"1.35x",afterValue:"1.20x",impact:"borrower_favorable",impactDescription:"More operational flexibility during ramp-up",sourceForm:"covenant-simple",isManualEdit:!1},{id:"solar-c2",changeType:"modified",elementType:"other",sectionReference:"6.05",elementName:"PanelDegradation",title:"Higher degradation allowance",description:"Annual degradation increased from 0.4% to 0.5%",rationale:"Reflects actual panel performance",beforeCode:"ANNUAL_DEGRADATION 0.4",afterCode:"ANNUAL_DEGRADATION 0.5",beforeValue:"0.4%",afterValue:"0.5%",impact:"borrower_favorable",impactDescription:"More conservative production assumptions",sourceForm:"degradation",isManualEdit:!1}]}},{id:"solar-version-3",dealId:"solar-demo",versionNumber:3,versionLabel:"Agreed Terms",creditLangCode:et,createdBy:"jwalsh@milbank.com",authorParty:"Milbank",createdAt:new Date("2025-12-01"),parentVersionId:"solar-version-2",status:"draft",generatedWordDoc:null,changeSummary:{versionFrom:2,versionTo:3,authorParty:"Milbank",createdAt:new Date("2025-12-01"),totalChanges:1,covenantChanges:1,definitionChanges:0,basketChanges:0,otherChanges:0,borrowerFavorable:0,lenderFavorable:1,neutral:0,changes:[{id:"solar-c3",changeType:"modified",elementType:"covenant",sectionReference:"7.01",elementName:"MinDSCR",title:"DSCR compromise",description:"DSCR set at 1.25x as compromise",rationale:"Split the difference",beforeCode:"REQUIRES DSCR >= 1.20",afterCode:"REQUIRES DSCR >= 1.25",beforeValue:"1.20x",afterValue:"1.25x",impact:"lender_favorable",impactDescription:"Compromise between 1.35x and 1.20x",sourceForm:"covenant-simple",isManualEdit:!1}]}}],Ea={id:"solar-demo",name:"Desert Sun Solar Project",dealType:"project_finance",facilityAmount:28e7,currency:"USD",status:"negotiation",currentVersionId:"solar-version-3",parties:lt,targetClosingDate:new Date("2026-03-01"),actualClosingDate:null,maturityDate:new Date("2046-06-30"),createdAt:new Date("2025-10-15"),updatedAt:new Date("2025-12-01"),createdBy:"twhite@cobank.com"},Ca=[{id:"solar-cp-1",dealId:"solar-demo",name:"Desert Sun Project Co LLC",shortName:"Borrower",role:"borrower",partyType:"borrower"},{id:"solar-cp-2",dealId:"solar-demo",name:"CoBank",shortName:"Agent",role:"administrative_agent",partyType:"agent"},{id:"solar-cp-3",dealId:"solar-demo",name:"Tax Equity Fund LP",shortName:"Tax Equity",role:"lender",partyType:"tax_equity"},{id:"solar-cp-4",dealId:"solar-demo",name:"Latham & Watkins",shortName:"Borrower Counsel",role:"counsel",partyType:"law_firm"},{id:"solar-cp-5",dealId:"solar-demo",name:"Milbank",shortName:"Agent Counsel",role:"counsel",partyType:"law_firm"}],Aa=[{id:"solar-cond-1",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(a)",category:"credit_agreement",title:"Credit Agreement Execution",description:"Fully executed Credit Agreement",responsiblePartyId:"solar-cp-4",status:"pending",dueDate:new Date("2026-03-01"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"solar-cond-2",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(b)",category:"offtake",title:"PPA Executed",description:"Executed Power Purchase Agreement with utility",responsiblePartyId:"solar-cp-1",status:"satisfied",dueDate:new Date("2026-02-15"),satisfiedAt:new Date("2026-01-20"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"25-year PPA with APS"},{id:"solar-cond-3",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(c)",category:"permits",title:"Interconnection Agreement",description:"Executed Large Generator Interconnection Agreement",responsiblePartyId:"solar-cp-1",status:"satisfied",dueDate:new Date("2026-02-20"),satisfiedAt:new Date("2026-01-25"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"solar-cond-4",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(d)",category:"technical",title:"EPC Contract",description:"Executed EPC contract with creditworthy contractor",responsiblePartyId:"solar-cp-1",status:"satisfied",dueDate:new Date("2026-02-15"),satisfiedAt:new Date("2026-01-15"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"First Solar as EPC"},{id:"solar-cond-5",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(e)",category:"tax_equity",title:"Tax Equity Commitment",description:"Executed Tax Equity Partnership Agreement",responsiblePartyId:"solar-cp-3",status:"pending",dueDate:new Date("2026-02-28"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"Final diligence ongoing"},{id:"solar-cond-6",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(f)",category:"permits",title:"Environmental Permits",description:"All required environmental permits obtained",responsiblePartyId:"solar-cp-1",status:"satisfied",dueDate:new Date("2026-02-01"),satisfiedAt:new Date("2026-01-10"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"NEPA complete"},{id:"solar-cond-7",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(g)",category:"permits",title:"ALTA Survey",description:"ALTA/NSPS Land Title Survey",responsiblePartyId:"solar-cp-1",status:"pending",dueDate:new Date("2026-02-25"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"Survey in progress"},{id:"solar-cond-8",dealId:"solar-demo",versionId:"solar-version-3",sectionReference:"4.01(h)",category:"insurance",title:"Insurance Certificates",description:"Builder's risk and liability insurance",responsiblePartyId:"solar-cp-1",status:"satisfied",dueDate:new Date("2026-02-15"),satisfiedAt:new Date("2026-02-01"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""}],Sa=[{id:"solar-doc-1",dealId:"solar-demo",documentType:"credit_agreement",title:"Credit Agreement",fileName:"DesertSun_Credit_Agreement.pdf",fileType:"application/pdf",storagePath:"/documents/solar-doc-1.pdf",status:"pending",responsiblePartyId:"solar-cp-4",uploadedAt:new Date("2026-02-01"),uploadedBy:"david.kim@lw.com",dueDate:new Date("2026-03-01"),signatures:[],satisfiesConditionIds:["solar-cond-1"]}],ba={id:"solar-demo",name:"Desert Sun Solar Project",facilityAmount:28e7,currency:"USD",targetClosingDate:new Date("2026-03-01"),status:"closing"},dt=[{id:"wind-party-borrower",dealId:"wind-demo",name:"Prairie Wind Holdings LLC",shortName:"Borrower",role:"borrower",partyType:"borrower",primaryContact:{name:"James Cooper",email:"jcooper@prairiewind.com",phone:"+1 (405) 555-0100",title:"CEO"},additionalContacts:[],counselPartyId:"wind-party-kirkland"},{id:"wind-party-agent",dealId:"wind-demo",name:"MUFG",shortName:"Agent",role:"administrative_agent",partyType:"agent",primaryContact:{name:"Lisa Yamamoto",email:"lyamamoto@mufg.com",phone:"+1 (212) 555-0200",title:"Director"},additionalContacts:[],counselPartyId:"wind-party-paulweiss"},{id:"wind-party-kirkland",dealId:"wind-demo",name:"Kirkland & Ellis LLP",shortName:"Kirkland",role:"borrower",partyType:"law_firm",primaryContact:{name:"Mark Stevens",email:"mstevens@kirkland.com",phone:"+1 (312) 555-0400",title:"Partner"},additionalContacts:[],counselPartyId:null},{id:"wind-party-paulweiss",dealId:"wind-demo",name:"Paul, Weiss LLP",shortName:"Paul Weiss",role:"administrative_agent",partyType:"law_firm",primaryContact:{name:"Rachel Green",email:"rgreen@paulweiss.com",phone:"+1 (212) 555-0500",title:"Partner"},additionalContacts:[],counselPartyId:null}],Ta=[{id:"wind-version-1",dealId:"wind-demo",versionNumber:1,versionLabel:"Lender's Initial Draft",creditLangCode:`// Wind - Lender Initial
COVENANT MinDSCR REQUIRES DSCR >= 1.40`,createdBy:"rgreen@paulweiss.com",authorParty:"Paul Weiss",createdAt:new Date("2025-10-01"),parentVersionId:null,status:"superseded",generatedWordDoc:null,changeSummary:null},{id:"wind-version-2",dealId:"wind-demo",versionNumber:2,versionLabel:"Sponsor's Markup",creditLangCode:`// Wind - Sponsor Markup
COVENANT MinDSCR REQUIRES DSCR >= 1.25
COVENANT CurtailmentLimit REQUIRES curtailment_pct <= 7.0`,createdBy:"mstevens@kirkland.com",authorParty:"Kirkland",createdAt:new Date("2025-10-20"),parentVersionId:"wind-version-1",status:"superseded",generatedWordDoc:null,changeSummary:{versionFrom:1,versionTo:2,authorParty:"Kirkland",createdAt:new Date("2025-10-20"),totalChanges:2,covenantChanges:2,definitionChanges:0,basketChanges:0,otherChanges:0,borrowerFavorable:2,lenderFavorable:0,neutral:0,changes:[{id:"wind-c1",changeType:"modified",elementType:"covenant",sectionReference:"7.01",elementName:"MinDSCR",title:"DSCR threshold reduced",description:"Minimum DSCR reduced from 1.40x to 1.25x",rationale:"Wind variability requires flexibility",beforeCode:"REQUIRES DSCR >= 1.40",afterCode:"REQUIRES DSCR >= 1.25",beforeValue:"1.40x",afterValue:"1.25x",impact:"borrower_favorable",impactDescription:"More operational flexibility",sourceForm:"covenant-simple",isManualEdit:!1},{id:"wind-c2",changeType:"modified",elementType:"covenant",sectionReference:"7.02",elementName:"CurtailmentLimit",title:"Higher curtailment allowance",description:"Curtailment limit increased from 5% to 7%",rationale:"Grid constraints in region",beforeCode:"REQUIRES curtailment_pct <= 5.0",afterCode:"REQUIRES curtailment_pct <= 7.0",beforeValue:"5.0%",afterValue:"7.0%",impact:"borrower_favorable",impactDescription:"Accounts for expected grid curtailment",sourceForm:"covenant-simple",isManualEdit:!1}]}},{id:"wind-version-3",dealId:"wind-demo",versionNumber:3,versionLabel:"Agreed Terms",creditLangCode:at,createdBy:"rgreen@paulweiss.com",authorParty:"Paul Weiss",createdAt:new Date("2025-11-15"),parentVersionId:"wind-version-2",status:"draft",generatedWordDoc:null,changeSummary:{versionFrom:2,versionTo:3,authorParty:"Paul Weiss",createdAt:new Date("2025-11-15"),totalChanges:1,covenantChanges:1,definitionChanges:0,basketChanges:0,otherChanges:0,borrowerFavorable:0,lenderFavorable:1,neutral:0,changes:[{id:"wind-c3",changeType:"modified",elementType:"covenant",sectionReference:"7.01",elementName:"MinDSCR",title:"DSCR compromise",description:"DSCR set at 1.30x as compromise",rationale:"Split the difference",beforeCode:"REQUIRES DSCR >= 1.25",afterCode:"REQUIRES DSCR >= 1.30",beforeValue:"1.25x",afterValue:"1.30x",impact:"lender_favorable",impactDescription:"Compromise between 1.40x and 1.25x",sourceForm:"covenant-simple",isManualEdit:!1}]}}],Da={id:"wind-demo",name:"Prairie Wind Farm",dealType:"project_finance",facilityAmount:2e8,currency:"USD",status:"negotiation",currentVersionId:"wind-version-3",parties:dt,targetClosingDate:new Date("2026-02-20"),actualClosingDate:null,maturityDate:new Date("2041-03-31"),createdAt:new Date("2025-09-15"),updatedAt:new Date("2025-11-15"),createdBy:"lyamamoto@mufg.com"},Ia=[{id:"wind-cp-1",dealId:"wind-demo",name:"Prairie Wind Holdings LLC",shortName:"Borrower",role:"borrower",partyType:"borrower"},{id:"wind-cp-2",dealId:"wind-demo",name:"MUFG",shortName:"Agent",role:"administrative_agent",partyType:"agent"},{id:"wind-cp-3",dealId:"wind-demo",name:"Kirkland & Ellis",shortName:"Borrower Counsel",role:"counsel",partyType:"law_firm"},{id:"wind-cp-4",dealId:"wind-demo",name:"Paul, Weiss",shortName:"Agent Counsel",role:"counsel",partyType:"law_firm"}],wa=[{id:"wind-cond-1",dealId:"wind-demo",versionId:"wind-version-3",sectionReference:"4.01(a)",category:"credit_agreement",title:"Credit Agreement Execution",description:"Fully executed Credit Agreement",responsiblePartyId:"wind-cp-3",status:"pending",dueDate:new Date("2026-02-20"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"wind-cond-2",dealId:"wind-demo",versionId:"wind-version-3",sectionReference:"4.01(b)",category:"technical",title:"Turbine Supply Agreement",description:"Executed TSA with Vestas",responsiblePartyId:"wind-cp-1",status:"satisfied",dueDate:new Date("2026-02-01"),satisfiedAt:new Date("2026-01-15"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"V150 4.2MW turbines"},{id:"wind-cond-3",dealId:"wind-demo",versionId:"wind-version-3",sectionReference:"4.01(c)",category:"technical",title:"Wind Resource Study",description:"Independent wind resource assessment",responsiblePartyId:"wind-cp-1",status:"satisfied",dueDate:new Date("2026-01-15"),satisfiedAt:new Date("2025-12-20"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"DNV completed P50/P90 analysis"},{id:"wind-cond-4",dealId:"wind-demo",versionId:"wind-version-3",sectionReference:"4.01(d)",category:"permits",title:"FAA Determination",description:"FAA No Hazard Determination for all turbines",responsiblePartyId:"wind-cp-1",status:"satisfied",dueDate:new Date("2026-02-01"),satisfiedAt:new Date("2026-01-10"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"wind-cond-5",dealId:"wind-demo",versionId:"wind-version-3",sectionReference:"4.01(e)",category:"permits",title:"Tribal Consultation",description:"Completed tribal consultation process",responsiblePartyId:"wind-cp-1",status:"pending",dueDate:new Date("2026-02-15"),satisfiedAt:null,satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"Final meeting scheduled"},{id:"wind-cond-6",dealId:"wind-demo",versionId:"wind-version-3",sectionReference:"4.01(f)",category:"offtake",title:"Hedge Agreement",description:"Revenue hedge with investment grade counterparty",responsiblePartyId:"wind-cp-1",status:"satisfied",dueDate:new Date("2026-02-10"),satisfiedAt:new Date("2026-01-25"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:"10-year fixed price hedge"}],_a=[{id:"wind-doc-1",dealId:"wind-demo",documentType:"credit_agreement",title:"Credit Agreement",fileName:"PrairieWind_Credit_Agreement.pdf",fileType:"application/pdf",storagePath:"/documents/wind-doc-1.pdf",status:"pending",responsiblePartyId:"wind-cp-3",uploadedAt:new Date("2026-02-01"),uploadedBy:"mstevens@kirkland.com",dueDate:new Date("2026-02-20"),signatures:[],satisfiesConditionIds:["wind-cond-1"]}],Ra={id:"wind-demo",name:"Prairie Wind Farm",facilityAmount:2e8,currency:"USD",targetClosingDate:new Date("2026-02-20"),status:"closing"},ut=[{id:"corp-party-borrower",dealId:"corporate-demo",name:"Apex Industries Inc.",shortName:"Borrower",role:"borrower",partyType:"borrower",primaryContact:{name:"Patricia Reynolds",email:"preynolds@apexind.com",phone:"+1 (312) 555-0100",title:"CFO"},additionalContacts:[],counselPartyId:"corp-party-simpson"},{id:"corp-party-agent",dealId:"corporate-demo",name:"JPMorgan Chase",shortName:"Agent",role:"administrative_agent",partyType:"agent",primaryContact:{name:"Brian Mitchell",email:"bmitchell@jpmorgan.com",phone:"+1 (212) 555-0200",title:"Managing Director"},additionalContacts:[],counselPartyId:"corp-party-cahill"},{id:"corp-party-simpson",dealId:"corporate-demo",name:"Simpson Thacher & Bartlett",shortName:"Simpson Thacher",role:"borrower",partyType:"law_firm",primaryContact:{name:"Andrew Blake",email:"ablake@stblaw.com",phone:"+1 (212) 555-0400",title:"Partner"},additionalContacts:[],counselPartyId:null},{id:"corp-party-cahill",dealId:"corporate-demo",name:"Cahill Gordon & Reindel",shortName:"Cahill",role:"administrative_agent",partyType:"law_firm",primaryContact:{name:"Susan Clark",email:"sclark@cahill.com",phone:"+1 (212) 555-0500",title:"Partner"},additionalContacts:[],counselPartyId:null}],Pa=[{id:"corp-version-1",dealId:"corporate-demo",versionNumber:1,versionLabel:"Lender's Initial Draft",creditLangCode:`// Corporate - Lender Initial
COVENANT MaxLeverage REQUIRES Leverage <= 4.25
BASKET GeneralInvestments CAPACITY $20_000_000`,createdBy:"sclark@cahill.com",authorParty:"Cahill",createdAt:new Date("2024-05-01"),parentVersionId:null,status:"superseded",generatedWordDoc:null,changeSummary:null},{id:"corp-version-2",dealId:"corporate-demo",versionNumber:2,versionLabel:"Borrower's Markup",creditLangCode:`// Corporate - Borrower Markup
COVENANT MaxLeverage REQUIRES Leverage <= 4.75 CURE EquityCure MAX_USES 3
BASKET GeneralInvestments CAPACITY $30_000_000
BASKET EBITDAInvestments CAPACITY 0.20 * EBITDA FLOOR $20_000_000`,createdBy:"ablake@stblaw.com",authorParty:"Simpson Thacher",createdAt:new Date("2024-05-15"),parentVersionId:"corp-version-1",status:"superseded",generatedWordDoc:null,changeSummary:{versionFrom:1,versionTo:2,authorParty:"Simpson Thacher",createdAt:new Date("2024-05-15"),totalChanges:3,covenantChanges:1,definitionChanges:0,basketChanges:2,otherChanges:0,borrowerFavorable:3,lenderFavorable:0,neutral:0,changes:[{id:"corp-c1",changeType:"modified",elementType:"covenant",sectionReference:"7.11",elementName:"MaxLeverage",title:"Leverage threshold increased",description:"Maximum leverage increased from 4.25x to 4.75x with cure rights",rationale:"Need M&A flexibility",beforeCode:"REQUIRES Leverage <= 4.25",afterCode:"REQUIRES Leverage <= 4.75 CURE EquityCure MAX_USES 3",beforeValue:"4.25x",afterValue:"4.75x + cure",impact:"borrower_favorable",impactDescription:"+0.50x headroom plus cure protection",sourceForm:"covenant-simple",isManualEdit:!1},{id:"corp-c2",changeType:"modified",elementType:"basket",sectionReference:"7.02(f)",elementName:"GeneralInvestments",title:"Fixed basket increased",description:"General investments increased from $20M to $30M",rationale:null,beforeCode:"CAPACITY $20_000_000",afterCode:"CAPACITY $30_000_000",beforeValue:"$20M",afterValue:"$30M",impact:"borrower_favorable",impactDescription:"+$10M investment capacity",sourceForm:"basket-fixed",isManualEdit:!1},{id:"corp-c3",changeType:"added",elementType:"basket",sectionReference:"7.02(g)",elementName:"EBITDAInvestments",title:"Grower basket added",description:"New 20% EBITDA grower basket with $20M floor",rationale:"Scale with company growth",beforeCode:null,afterCode:"CAPACITY 0.20 * EBITDA FLOOR $20_000_000",beforeValue:null,afterValue:"20% EBITDA / $20M floor",impact:"borrower_favorable",impactDescription:"Capacity grows with earnings",sourceForm:"basket-grower",isManualEdit:!1}]}},{id:"corp-version-3",dealId:"corporate-demo",versionNumber:3,versionLabel:"Agreed Terms",creditLangCode:it,createdBy:"sclark@cahill.com",authorParty:"Cahill",createdAt:new Date("2024-06-01"),parentVersionId:"corp-version-2",status:"executed",generatedWordDoc:null,changeSummary:{versionFrom:2,versionTo:3,authorParty:"Cahill",createdAt:new Date("2024-06-01"),totalChanges:2,covenantChanges:1,definitionChanges:0,basketChanges:1,otherChanges:0,borrowerFavorable:0,lenderFavorable:1,neutral:1,changes:[{id:"corp-c4",changeType:"modified",elementType:"covenant",sectionReference:"7.11",elementName:"MaxLeverage",title:"Leverage compromise",description:"Final leverage at 4.50x with cure",rationale:"Split the difference",beforeCode:"REQUIRES Leverage <= 4.75",afterCode:"REQUIRES Leverage <= 4.50",beforeValue:"4.75x",afterValue:"4.50x",impact:"lender_favorable",impactDescription:"Compromise between 4.25x and 4.75x",sourceForm:"covenant-simple",isManualEdit:!1},{id:"corp-c5",changeType:"modified",elementType:"basket",sectionReference:"7.02(g)",elementName:"EBITDAInvestments",title:"Grower basket adjusted",description:"Grower reduced to 15% with $15M floor",rationale:null,beforeCode:"CAPACITY 0.20 * EBITDA FLOOR $20_000_000",afterCode:"CAPACITY 0.15 * EBITDA FLOOR $15_000_000",beforeValue:"20% / $20M",afterValue:"15% / $15M",impact:"neutral",impactDescription:"Compromise on grower sizing",sourceForm:"basket-grower",isManualEdit:!1}]}}],Na={id:"corporate-demo",name:"Apex Industries Credit Facility",dealType:"corporate",facilityAmount:15e7,currency:"USD",status:"active",currentVersionId:"corp-version-3",parties:ut,targetClosingDate:new Date("2024-06-15"),actualClosingDate:new Date("2024-06-15"),maturityDate:new Date("2029-06-15"),createdAt:new Date("2024-04-15"),updatedAt:new Date("2024-06-15"),createdBy:"bmitchell@jpmorgan.com"},xa=[{id:"corp-cp-1",dealId:"corporate-demo",name:"Apex Industries Inc.",shortName:"Borrower",role:"borrower",partyType:"borrower"},{id:"corp-cp-2",dealId:"corporate-demo",name:"JPMorgan Chase",shortName:"Agent",role:"administrative_agent",partyType:"agent"},{id:"corp-cp-3",dealId:"corporate-demo",name:"Simpson Thacher",shortName:"Borrower Counsel",role:"counsel",partyType:"law_firm"},{id:"corp-cp-4",dealId:"corporate-demo",name:"Cahill Gordon",shortName:"Agent Counsel",role:"counsel",partyType:"law_firm"}],Ma=[{id:"corp-cond-1",dealId:"corporate-demo",versionId:"corp-version-3",sectionReference:"4.01(a)",category:"credit_agreement",title:"Credit Agreement Execution",description:"Fully executed Credit Agreement",responsiblePartyId:"corp-cp-3",status:"satisfied",dueDate:new Date("2024-06-15"),satisfiedAt:new Date("2024-06-15"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"corp-cond-2",dealId:"corporate-demo",versionId:"corp-version-3",sectionReference:"4.01(b)",category:"corporate_documents",title:"Corporate Documents",description:"Charter, bylaws, and resolutions",responsiblePartyId:"corp-cp-1",status:"satisfied",dueDate:new Date("2024-06-10"),satisfiedAt:new Date("2024-06-08"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"corp-cond-3",dealId:"corporate-demo",versionId:"corp-version-3",sectionReference:"4.01(c)",category:"security_documents",title:"Security Agreement",description:"Security Agreement and UCC filings",responsiblePartyId:"corp-cp-3",status:"satisfied",dueDate:new Date("2024-06-15"),satisfiedAt:new Date("2024-06-15"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"corp-cond-4",dealId:"corporate-demo",versionId:"corp-version-3",sectionReference:"4.01(d)",category:"legal_opinions",title:"Legal Opinions",description:"Borrower counsel and local counsel opinions",responsiblePartyId:"corp-cp-3",status:"satisfied",dueDate:new Date("2024-06-15"),satisfiedAt:new Date("2024-06-14"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"corp-cond-5",dealId:"corporate-demo",versionId:"corp-version-3",sectionReference:"4.01(e)",category:"certificates",title:"Solvency Certificate",description:"CFO solvency certificate",responsiblePartyId:"corp-cp-1",status:"satisfied",dueDate:new Date("2024-06-15"),satisfiedAt:new Date("2024-06-15"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""},{id:"corp-cond-6",dealId:"corporate-demo",versionId:"corp-version-3",sectionReference:"4.01(f)",category:"financial",title:"Financial Statements",description:"Audited financials and compliance certificate",responsiblePartyId:"corp-cp-1",status:"satisfied",dueDate:new Date("2024-06-10"),satisfiedAt:new Date("2024-06-05"),satisfiedByDocumentIds:[],waivedAt:null,waiverApprovedBy:null,notes:""}],Ba=[{id:"corp-doc-1",dealId:"corporate-demo",documentType:"credit_agreement",title:"Credit Agreement",fileName:"Apex_Credit_Agreement.pdf",fileType:"application/pdf",storagePath:"/documents/corp-doc-1.pdf",status:"executed",responsiblePartyId:"corp-cp-3",uploadedAt:new Date("2024-06-15"),uploadedBy:"ablake@stblaw.com",dueDate:new Date("2024-06-15"),signatures:[],satisfiesConditionIds:["corp-cond-1"]}],Oa={id:"corporate-demo",name:"Apex Industries Credit Facility",facilityAmount:15e7,currency:"USD",targetClosingDate:new Date("2024-06-15"),status:"active"},ka={id:"solar-demo",name:"Desert Sun Solar Project",facility:"$280M Construction + Term Loan",sponsor:"Desert Sun Holdings LLC",borrower:"Desert Sun Project Co LLC",code:et,financials:tt,historicalData:ia,metadata:ra,negotiation:{deal:Ea,parties:lt,versions:va},closing:{deal:ba,parties:Ca,conditions:Aa,documents:Sa}},La={id:"wind-demo",name:"Prairie Wind Farm",facility:"$200M Construction + Term Loan",sponsor:"Prairie Energy Partners",borrower:"Prairie Wind Holdings LLC",code:at,financials:nt,historicalData:sa,metadata:oa,negotiation:{deal:Da,parties:dt,versions:Ta},closing:{deal:Ra,parties:Ia,conditions:wa,documents:_a}},Fa={id:"corporate-demo",name:"Apex Industries Credit Facility",facility:"$150M Revolving Credit Facility",sponsor:"Apex Industries Inc.",borrower:"Apex Industries Inc.",code:it,financials:rt,historicalData:ca,metadata:la,negotiation:{deal:Na,parties:ut,versions:Pa},closing:{deal:Oa,parties:xa,conditions:Ma,documents:Ba}},pt={"abc-acquisition":ct,"solar-demo":ka,"wind-demo":La,"corporate-demo":Fa};function ge(i){return pt[i]}const ye=ct.closing,je=ye.deal,Qe=ye.conditions,Ye=ye.documents,We=ye.parties,mt=l.createContext(null);function He(i,e){return e?`${i}:${e}`:i}const Ua="proviso_closing_conditions",$a="proviso_closing_documents";function Va(){return`toast-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function qa(i,e){const t=new Date,a={total:i.length,satisfied:0,pending:0,waived:0,overdue:0};for(const s of i)s.status==="satisfied"?a.satisfied++:s.status==="waived"?a.waived++:(a.pending++,s.dueDate&&new Date(s.dueDate)<t&&a.overdue++);const n={total:e.length,uploaded:0,executed:0,pending:0};for(const s of e)s.status==="executed"?n.executed++:s.status==="uploaded"?n.uploaded++:n.pending++;const r={total:0,signed:0,requested:0,pending:0,declined:0};for(const s of e)for(const o of s.signatures)r.total++,o.status==="signed"?r.signed++:o.status==="requested"?r.requested++:o.status==="declined"?r.declined++:r.pending++;return{conditions:a,documents:n,signatures:r}}function Ga(i){const e=i.conditions.total+i.documents.total+i.signatures.total,t=i.conditions.satisfied+i.conditions.waived+i.documents.uploaded+i.documents.executed+i.signatures.signed;return e>0?Math.round(t/e*100):0}function ja(i){const e=new Date,t=new Date(i).getTime()-e.getTime();return Math.ceil(t/(1e3*60*60*24))}function ce(i){return i.map(e=>({...e,dueDate:e.dueDate?new Date(e.dueDate):null,satisfiedAt:e.satisfiedAt?new Date(e.satisfiedAt):null,waivedAt:e.waivedAt?new Date(e.waivedAt):null,satisfiedByDocumentIds:[...e.satisfiedByDocumentIds]}))}function De(i){return i.map(e=>({...e,uploadedAt:new Date(e.uploadedAt),dueDate:e.dueDate?new Date(e.dueDate):null,signatures:e.signatures.map(t=>({...t,signedAt:t.signedAt?new Date(t.signedAt):null})),satisfiesConditionIds:[...e.satisfiesConditionIds]}))}function Qa({children:i,dealId:e,interpreterConditions:t}){const a=He(Ua,e),n=He($a,e),[r,s]=l.useState(je),[o,c]=l.useState(We),[d,f]=l.useState(()=>{if(t&&t.length>0)return ce(t);try{const v=localStorage.getItem(a);if(v)return JSON.parse(v).map(g=>({...g,dueDate:g.dueDate?new Date(g.dueDate):null,satisfiedAt:g.satisfiedAt?new Date(g.satisfiedAt):null,waivedAt:g.waivedAt?new Date(g.waivedAt):null}))}catch(v){console.warn("Failed to load conditions from localStorage:",v)}return ce(Qe)}),[h,y]=l.useState(()=>{try{const v=localStorage.getItem(n);if(v)return JSON.parse(v).map(g=>({...g,uploadedAt:new Date(g.uploadedAt),dueDate:g.dueDate?new Date(g.dueDate):null,signatures:g.signatures.map(p=>({...p,signedAt:p.signedAt?new Date(p.signedAt):null}))}))}catch(v){console.warn("Failed to load documents from localStorage:",v)}return De(Ye)}),[T,R]=l.useState([]);l.useEffect(()=>{t&&t.length>0&&(f(ce(t)),localStorage.removeItem(a))},[t]),l.useEffect(()=>{localStorage.setItem(a,JSON.stringify(d))},[d]),l.useEffect(()=>{localStorage.setItem(n,JSON.stringify(h))},[h]),l.useEffect(()=>{if(T.length===0)return;const v=setTimeout(()=>{R(b=>b.slice(1))},5e3);return()=>clearTimeout(v)},[T]);const B=qa(d,h),P=Ga(B),$=ja(r.targetClosingDate),w=l.useCallback(v=>{R(b=>[...b,{...v,id:Va()}])},[]),V=l.useCallback(v=>{R(b=>b.filter(g=>g.id!==v))},[]),W=l.useCallback((v,b)=>{f(p=>p.map(u=>u.id!==v?u:{...u,status:"satisfied",satisfiedAt:new Date,notes:b||u.notes}));const g=d.find(p=>p.id===v);w({type:"success",title:"Condition Satisfied",message:g==null?void 0:g.title})},[d,w]),L=l.useCallback((v,b,g)=>{f(u=>u.map(m=>m.id!==v?m:{...m,status:"waived",waivedAt:new Date,waiverApprovedBy:g,notes:b}));const p=d.find(u=>u.id===v);w({type:"info",title:"Condition Waived",message:p==null?void 0:p.title})},[d,w]),q=l.useCallback((v,b)=>{y(u=>u.map(m=>m.id!==v?m:{...m,status:"uploaded",fileName:b,uploadedAt:new Date}));const g=h.find(u=>u.id===v);w({type:"success",title:"Document Uploaded",message:g==null?void 0:g.title});const p=h.find(u=>u.id===v);p!=null&&p.satisfiesConditionIds.length&&f(u=>u.map(m=>!p.satisfiesConditionIds.includes(m.id)||m.status!=="pending"?m:{...m,status:"satisfied",satisfiedAt:new Date,satisfiedByDocumentIds:[...m.satisfiedByDocumentIds,v]}))},[h,w]),G=l.useCallback(v=>{y(g=>g.map(p=>p.id!==v?p:{...p,status:"executed"}));const b=h.find(g=>g.id===v);w({type:"success",title:"Document Fully Executed",message:b==null?void 0:b.title})},[h,w]),H=l.useCallback((v,b)=>{y(m=>m.map(S=>S.id!==v?S:{...S,signatures:S.signatures.map(A=>A.id!==b?A:{...A,status:"requested"})}));const g=h.find(m=>m.id===v),p=g==null?void 0:g.signatures.find(m=>m.id===b),u=o.find(m=>m.id===(p==null?void 0:p.partyId));w({type:"info",title:"Signature Requested",message:`Request sent to ${(u==null?void 0:u.shortName)||"party"}`})},[h,w]),j=l.useCallback((v,b)=>{y(A=>A.map(N=>{if(N.id!==v)return N;const O=N.signatures.map(_=>_.id!==b?_:{..._,status:"signed",signedAt:new Date}),F=O.every(_=>_.status==="signed");return{...N,signatures:O,status:F?"executed":N.status}}));const g=h.find(A=>A.id===v),p=g==null?void 0:g.signatures.find(A=>A.id===b),u=o.find(A=>A.id===(p==null?void 0:p.partyId)),m=h.find(A=>A.id===v),S=(m==null?void 0:m.signatures.filter(A=>A.id!==b&&A.status!=="signed").length)===0;w(S?{type:"success",title:"Document Fully Executed",message:g==null?void 0:g.title}:{type:"success",title:"Signature Received",message:`${(u==null?void 0:u.shortName)||"Party"} signed ${g==null?void 0:g.title}`})},[h,w]),ee=l.useCallback((v,b)=>{y(m=>m.map(S=>S.id!==v?S:{...S,signatures:S.signatures.map(A=>A.id!==b?A:{...A,status:"declined"})}));const g=h.find(m=>m.id===v),p=g==null?void 0:g.signatures.find(m=>m.id===b),u=o.find(m=>m.id===(p==null?void 0:p.partyId));w({type:"error",title:"Signature Declined",message:`${(u==null?void 0:u.shortName)||"Party"} declined to sign ${g==null?void 0:g.title}`})},[h,w]),Q=l.useCallback(v=>{const b=ge(v);if(b!=null&&b.closing){const g=b.closing;s(g.deal),c(g.parties),f(ce(g.conditions)),y(De(g.documents)),localStorage.removeItem(a),localStorage.removeItem(n)}},[]),z=l.useCallback(()=>{s(je),c(We),f(ce(Qe)),y(De(Ye)),localStorage.removeItem(a),localStorage.removeItem(n),w({type:"info",title:"Reset Complete",message:"All closing data has been reset to defaults"})},[w]),te={deal:r,conditions:d,documents:h,parties:o,stats:B,readinessPercentage:P,daysUntilClosing:$,satisfyCondition:W,waiveCondition:L,uploadDocument:q,markDocumentExecuted:G,requestSignature:H,markSigned:j,declineSignature:ee,toasts:T,addToast:w,removeToast:V,loadScenario:Q,resetToDefaults:z};return E.jsx(mt.Provider,{value:te,children:i})}function xn(){const i=l.useContext(mt);if(!i)throw new Error("useClosing must be used within a ClosingProvider");return i}const Ya=`// ABC Acquisition Facility - Lender's Initial Draft
// Version 1.0 - Simpson Thacher

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
) EXCLUDING extraordinary_items

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED QUARTERLY

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.50
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY GreaterOf($25_000_000, 10% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $50_000_000
  SUBJECT TO ProFormaCompliance
`,Wa=`// ABC Acquisition Facility - Borrower's Markup
// Version 2.0 - Davis Polk

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp        // Added per Borrower
) EXCLUDING extraordinary_items

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.25      // Increased from 5.00
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25    // Decreased from 2.50
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY GreaterOf($35_000_000, 15% * EBITDA)   // Increased from $25M/10%

BASKET PermittedAcquisitions
  CAPACITY $75_000_000    // Increased from $50M
  SUBJECT TO ProFormaCompliance
`,Ha=`// ABC Acquisition Facility - Lender's Counter
// Version 3.0 - Simpson Thacher

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp        // Accepted
) EXCLUDING extraordinary_items
  CAPPED AT $5_000_000   // Added cap on StockBasedComp

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 4.75   // Tightened from 5.00 (was step-down, now flat)
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $20_000_000  // Reduced max

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25    // Accepted
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)   // Compromise

BASKET PermittedAcquisitions
  CAPACITY $60_000_000    // Compromise from $50M/$75M
  SUBJECT TO ProFormaCompliance
`,za={versionFrom:1,versionTo:2,authorParty:"Davis Polk",createdAt:new Date("2026-01-15T14:30:00Z"),totalChanges:5,covenantChanges:2,definitionChanges:1,basketChanges:2,otherChanges:0,borrowerFavorable:5,lenderFavorable:0,neutral:0,changes:[{id:"change-1",changeType:"modified",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Leverage ratio threshold increased",description:"Maximum leverage ratio increased from 5.00x to 5.25x",rationale:"Provides additional headroom for acquisition integration",beforeCode:"REQUIRES Leverage <= 5.00",afterCode:"REQUIRES Leverage <= 5.25",beforeValue:"5.00x",afterValue:"5.25x",impact:"borrower_favorable",impactDescription:"+0.25x headroom at closing (~$11M additional debt capacity)",sourceForm:"covenant-simple",isManualEdit:!1},{id:"change-2",changeType:"added",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Equity cure right added",description:"Added equity cure mechanism with 2 uses over rolling 4 quarters, max $25M",rationale:"Standard borrower protection for covenant breach scenarios",beforeCode:null,afterCode:"CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000",beforeValue:null,afterValue:"2 uses / $25M max",impact:"borrower_favorable",impactDescription:"Provides cure rights for leverage covenant breaches",sourceForm:"covenant-cure",isManualEdit:!1},{id:"change-3",changeType:"modified",elementType:"covenant",sectionReference:"7.11(b)",elementName:"MinInterestCoverage",title:"Interest coverage threshold decreased",description:"Minimum interest coverage reduced from 2.50x to 2.25x",rationale:null,beforeCode:"REQUIRES EBITDA / InterestExpense >= 2.50",afterCode:"REQUIRES EBITDA / InterestExpense >= 2.25",beforeValue:"2.50x",afterValue:"2.25x",impact:"borrower_favorable",impactDescription:"-0.25x requirement provides more operational flexibility",sourceForm:"covenant-simple",isManualEdit:!1},{id:"change-4",changeType:"modified",elementType:"basket",sectionReference:"7.02(f)",elementName:"GeneralInvestments",title:"General investment basket increased",description:"Capacity increased from $25M/10% to $35M/15%",rationale:null,beforeCode:"CAPACITY GreaterOf($25_000_000, 10% * EBITDA)",afterCode:"CAPACITY GreaterOf($35_000_000, 15% * EBITDA)",beforeValue:"$25M / 10%",afterValue:"$35M / 15%",impact:"borrower_favorable",impactDescription:"+$10M fixed capacity, +5% grower component",sourceForm:"basket-grower",isManualEdit:!1},{id:"change-5",changeType:"modified",elementType:"basket",sectionReference:"7.02(g)",elementName:"PermittedAcquisitions",title:"Acquisition basket increased",description:"Capacity increased from $50M to $75M",rationale:null,beforeCode:"CAPACITY $50_000_000",afterCode:"CAPACITY $75_000_000",beforeValue:"$50M",afterValue:"$75M",impact:"borrower_favorable",impactDescription:"+$25M additional acquisition capacity",sourceForm:"basket-fixed",isManualEdit:!1}]},Ka={versionFrom:2,versionTo:3,authorParty:"Simpson Thacher",createdAt:new Date("2026-01-20T10:15:00Z"),totalChanges:5,covenantChanges:2,definitionChanges:1,basketChanges:2,otherChanges:0,borrowerFavorable:0,lenderFavorable:3,neutral:2,changes:[{id:"change-6",changeType:"modified",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Leverage ratio tightened",description:"Ratio tightened from 5.25x to 4.75x",rationale:"Compromise — accepted SBC add-back but tightened covenant",beforeCode:"REQUIRES Leverage <= 5.25",afterCode:"REQUIRES Leverage <= 4.75",beforeValue:"5.25x",afterValue:"4.75x",impact:"lender_favorable",impactDescription:"Reverts to original 5.00x opening, adds step-down",sourceForm:"covenant-stepdown",isManualEdit:!1},{id:"change-7",changeType:"modified",elementType:"covenant",sectionReference:"7.11(a)",elementName:"MaxLeverage",title:"Cure maximum reduced",description:"Maximum cure amount reduced from $25M to $20M",rationale:null,beforeCode:"MAX_AMOUNT $25_000_000",afterCode:"MAX_AMOUNT $20_000_000",beforeValue:"$25M",afterValue:"$20M",impact:"lender_favorable",impactDescription:"-$5M cure capacity",sourceForm:"covenant-cure",isManualEdit:!1},{id:"change-8",changeType:"modified",elementType:"definition",sectionReference:"1.01",elementName:"EBITDA",title:"Stock-based comp add-back capped",description:"Accepted SBC add-back but with $5M annual cap",rationale:"Compromise: accept add-back but limit exposure",beforeCode:"+ StockBasedComp",afterCode:`+ StockBasedComp
  CAPPED AT $5_000_000`,beforeValue:"Unlimited",afterValue:"$5M cap",impact:"lender_favorable",impactDescription:"Limits EBITDA benefit to $5M annually",sourceForm:"definition-ebitda",isManualEdit:!1},{id:"change-9",changeType:"modified",elementType:"basket",sectionReference:"7.02(f)",elementName:"GeneralInvestments",title:"Investment basket compromise",description:"Capacity set to $30M/12.5% (between $25M/10% and $35M/15%)",rationale:null,beforeCode:"CAPACITY GreaterOf($35_000_000, 15% * EBITDA)",afterCode:"CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)",beforeValue:"$35M / 15%",afterValue:"$30M / 12.5%",impact:"neutral",impactDescription:"Split the difference on basket sizing",sourceForm:"basket-grower",isManualEdit:!1},{id:"change-10",changeType:"modified",elementType:"basket",sectionReference:"7.02(g)",elementName:"PermittedAcquisitions",title:"Acquisition basket compromise",description:"Capacity set to $60M (between $50M and $75M)",rationale:null,beforeCode:"CAPACITY $75_000_000",afterCode:"CAPACITY $60_000_000",beforeValue:"$75M",afterValue:"$60M",impact:"neutral",impactDescription:"Split the difference on acquisition capacity",sourceForm:"basket-fixed",isManualEdit:!1}]},Xa=[{id:"version-1",dealId:"deal-abc-facility",versionNumber:1,versionLabel:"Lender's Initial Draft",creditLangCode:Ya,createdBy:"wharris@stblaw.com",authorParty:"Simpson Thacher",createdAt:new Date("2026-01-10T09:00:00Z"),parentVersionId:null,status:"superseded",generatedWordDoc:null,changeSummary:null},{id:"version-2",dealId:"deal-abc-facility",versionNumber:2,versionLabel:"Borrower's Markup",creditLangCode:Wa,createdBy:"elizabeth.warren@davispolk.com",authorParty:"Davis Polk",createdAt:new Date("2026-01-15T14:30:00Z"),parentVersionId:"version-1",status:"superseded",generatedWordDoc:null,changeSummary:null},{id:"version-3",dealId:"deal-abc-facility",versionNumber:3,versionLabel:"Lender's Counter",creditLangCode:Ha,createdBy:"wharris@stblaw.com",authorParty:"Simpson Thacher",createdAt:new Date("2026-01-20T10:15:00Z"),parentVersionId:"version-2",status:"draft",generatedWordDoc:null,changeSummary:null}],ze=Xa,Mn=za,Bn=Ka,fe={1:3,2:4,3:3,4:2},Ja={NetIncome:45e6,InterestExpense:12e6,TaxExpense:15e6,DepreciationAmortization:8e6,StockBasedComp:3e6,SeniorDebt:16e7,SubordinatedDebt:25e6,GeneralInvestments_used:5e6,PermittedAcquisitions_used:15e6},ft=l.createContext(null);function On({children:i}){const[e,t]=l.useState(1),[a,n]=l.useState(1),[r,s]=l.useState(1),[o,c]=l.useState([]),[d,f]=l.useState([]),[h,y]=l.useState(-1),[T,R]=l.useState(null),[B,P]=l.useState(0),[$,w]=l.useState(!1),[V,W]=l.useState(null);l.useEffect(()=>{L(0)},[]);const L=async u=>{var m;w(!0),W(null);try{const S=ze[u];if(!S)throw new Error(`Version ${u} not found`);const A=await Je(S.creditLangCode);if(!A.success||!A.ast)throw new Error(((m=A.error)==null?void 0:m.message)??"Parse failed");const N=new Y(A.ast);N.loadFinancials(Ja),R(N),P(u)}catch(S){W(S.message)}finally{w(!1)}},q=l.useCallback(u=>{t(u),n(1),u>r&&s(u)},[r]),G=l.useCallback(()=>{const u=fe[e];if(a<u)n(a+1);else if(e<4){const m=e+1;q(m)}},[e,a,q]),H=l.useCallback(()=>{if(a>1)n(a-1);else if(e>1){const u=e-1;t(u),n(fe[u])}},[e,a]),j=l.useCallback(u=>{const m=fe[e];u>=1&&u<=m&&n(u)},[e]),ee=l.useCallback(u=>{const m={...u,id:`${Date.now()}-${Math.random().toString(36).substr(2,9)}`,timestamp:new Date};c(S=>[...S,m])},[]),Q=l.useCallback(()=>{c([])},[]),z=l.useCallback(u=>{f(m=>[...m,u]),y(-1)},[]),te=l.useCallback(u=>{if(d.length===0)return"";let m;return u==="up"?m=h===-1?d.length-1:Math.max(0,h-1):m=h===-1?-1:Math.min(d.length-1,h+1),y(m),m===-1?"":d[m]??""},[d,h]),v=l.useCallback(()=>{y(-1)},[]),b=l.useCallback(async u=>{await L(u)},[]),g=l.useCallback(u=>{const m=ze[u];return(m==null?void 0:m.creditLangCode)??""},[]),p={currentAct:e,currentStep:a,maxActVisited:r,terminalHistory:o,commandHistory:d,commandHistoryIndex:h,interpreter:T,currentVersionIndex:B,isLoading:$,error:V,setAct:q,nextStep:G,prevStep:H,goToStep:j,addTerminalEntry:ee,clearTerminal:Q,addCommandToHistory:z,navigateCommandHistory:te,resetCommandHistoryIndex:v,setVersion:b,getVersionCode:g};return E.jsx(ft.Provider,{value:p,children:i})}function Ne(){const i=l.useContext(ft);if(!i)throw new Error("useDemo must be used within a DemoProvider");return i}function kn(){const{currentAct:i,currentStep:e,setAct:t,nextStep:a,prevStep:n,goToStep:r,maxActVisited:s}=Ne();return{currentAct:i,currentStep:e,setAct:t,nextStep:a,prevStep:n,goToStep:r,maxActVisited:s,stepsPerAct:fe}}function Ln(){const{terminalHistory:i,addTerminalEntry:e,clearTerminal:t,addCommandToHistory:a,navigateCommandHistory:n,resetCommandHistoryIndex:r}=Ne();return{terminalHistory:i,addTerminalEntry:e,clearTerminal:t,addCommandToHistory:a,navigateCommandHistory:n,resetCommandHistoryIndex:r}}function Fn(){const{interpreter:i,currentVersionIndex:e,isLoading:t,error:a,setVersion:n,getVersionCode:r}=Ne();return{interpreter:i,currentVersionIndex:e,isLoading:t,error:a,setVersion:n,getVersionCode:r}}const xe=new Set(Object.keys(pt)),ht=l.createContext(null),we="proviso_hub_deals",_e="proviso_hub_versions",Re="proviso_hub_parties",Pe="proviso_hub_activities",he="proviso_hub_current_deal";function se(i){return`${i}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function gt(i){return i.map(e=>({...e,targetClosingDate:e.targetClosingDate?new Date(e.targetClosingDate):null,actualClosingDate:e.actualClosingDate?new Date(e.actualClosingDate):null,maturityDate:e.maturityDate?new Date(e.maturityDate):null,createdAt:new Date(e.createdAt),updatedAt:new Date(e.updatedAt),parties:[]}))}function yt(i){return i.map(e=>({...e,createdAt:new Date(e.createdAt),changeSummary:e.changeSummary?{...e.changeSummary,createdAt:new Date(e.changeSummary.createdAt)}:null}))}function vt(i){return i.map(e=>({...e}))}function Za(i){return i.map(e=>({...e,timestamp:new Date(e.timestamp)}))}function en(){try{const i=localStorage.getItem(we);if(i){const t=JSON.parse(i).filter(a=>xe.has(a.id));if(t.length>0)return gt(t)}}catch(i){console.warn("Failed to load deals from localStorage:",i)}return[]}function tn(){try{const i=localStorage.getItem(_e);if(i){const t=JSON.parse(i).filter(a=>xe.has(a.dealId));if(t.length>0)return yt(t)}}catch(i){console.warn("Failed to load versions from localStorage:",i)}return[]}function an(){try{const i=localStorage.getItem(Re);if(i){const t=JSON.parse(i).filter(a=>xe.has(a.dealId));if(t.length>0)return vt(t)}}catch(i){console.warn("Failed to load parties from localStorage:",i)}return[]}function nn(){try{const i=localStorage.getItem(Pe);if(i)return Za(JSON.parse(i))}catch(i){console.warn("Failed to load activities from localStorage:",i)}return[]}function rn(){try{return localStorage.getItem(he)??null}catch{return null}}function sn({children:i}){const[e,t]=l.useState(en),[a,n]=l.useState(tn),[r,s]=l.useState(an),[o,c]=l.useState(nn),[d,f]=l.useState(rn),[h,y]=l.useState(new Map),T=l.useCallback((p,u)=>h.get(`${p}:${u}`),[h]),R=l.useCallback((p,u,m)=>{y(S=>{const A=new Map(S);return A.set(`${p}:${u}`,m),A})},[]);l.useEffect(()=>{localStorage.setItem(we,JSON.stringify(e))},[e]),l.useEffect(()=>{localStorage.setItem(_e,JSON.stringify(a))},[a]),l.useEffect(()=>{localStorage.setItem(Re,JSON.stringify(r))},[r]),l.useEffect(()=>{localStorage.setItem(Pe,JSON.stringify(o))},[o]),l.useEffect(()=>{d?localStorage.setItem(he,d):localStorage.removeItem(he)},[d]);const B=l.useMemo(()=>d?e.find(p=>p.id===d)??null:null,[e,d]),P=l.useCallback(p=>{const u={...p,id:se("activity"),timestamp:new Date};c(m=>[u,...m].slice(0,100))},[]),$=l.useCallback(p=>{const u=new Date,m=se("deal"),S={id:m,name:p.name,dealType:p.dealType,facilityAmount:p.facilityAmount,currency:p.currency??"USD",status:"draft",currentVersionId:null,parties:[],targetClosingDate:p.targetClosingDate,actualClosingDate:null,maturityDate:null,createdAt:u,updatedAt:u,createdBy:"user@proviso.dev"};t(N=>[...N,S]);const A={id:se("party"),dealId:m,name:p.borrowerName,shortName:p.borrowerName.split(" ")[0]??p.borrowerName,role:"borrower",partyType:"borrower",primaryContact:{name:"",email:"",phone:null,title:null},additionalContacts:[],counselPartyId:null};if(s(N=>[...N,A]),p.agentName){const N={id:se("party"),dealId:m,name:p.agentName,shortName:p.agentName.split(" ")[0]??p.agentName,role:"administrative_agent",partyType:"agent",primaryContact:{name:"",email:"",phone:null,title:null},additionalContacts:[],counselPartyId:null};s(O=>[...O,N])}return P({type:"deal_created",dealId:m,title:"Deal created",description:p.name}),S},[P]),w=l.useCallback((p,u)=>{t(m=>m.map(S=>S.id!==p?S:{...S,...u,updatedAt:new Date})),P({type:"deal_updated",dealId:p,title:"Deal updated",description:Object.keys(u).join(", ")})},[P]),V=l.useCallback(p=>{t(u=>u.filter(m=>m.id!==p)),n(u=>u.filter(m=>m.dealId!==p)),s(u=>u.filter(m=>m.dealId!==p)),d===p&&f(null)},[d]),W=l.useCallback(p=>{f(p)},[]),L=l.useCallback(p=>e.find(u=>u.id===p),[e]),q=l.useCallback((p,u)=>{t(m=>m.map(S=>S.id!==p?S:{...S,status:u,updatedAt:new Date,actualClosingDate:u==="active"?new Date:S.actualClosingDate})),P({type:"deal_updated",dealId:p,title:`Status changed to ${u}`})},[P]),G=l.useCallback(p=>a.filter(u=>u.dealId===p).sort((u,m)=>u.versionNumber-m.versionNumber),[a]),H=l.useCallback(p=>{const u=e.find(m=>m.id===p);if(u!=null&&u.currentVersionId)return a.find(m=>m.id===u.currentVersionId)},[e,a]),j=l.useCallback((p,u,m)=>{const S=a.filter(F=>F.dealId===p),A=S.length+1,N=S.length>0?S[S.length-1]:null,O={id:se("version"),dealId:p,versionNumber:A,versionLabel:m,creditLangCode:u,createdBy:"user@proviso.dev",authorParty:"User",createdAt:new Date,parentVersionId:(N==null?void 0:N.id)??null,status:"draft",generatedWordDoc:null,changeSummary:null};return n(F=>[...F,O]),t(F=>F.map(_=>_.id!==p?_:{..._,currentVersionId:O.id,status:_.status==="draft"?"negotiation":_.status,updatedAt:new Date})),P({type:"version_created",dealId:p,title:"Version created",description:`v${A}: ${m}`}),O},[a,P]),ee=l.useCallback(p=>r.filter(u=>u.dealId===p),[r]),Q=l.useCallback(p=>{const u={...p,id:se("party")};return s(m=>[...m,u]),u},[]),z=l.useCallback(p=>o.filter(u=>u.dealId===p),[o]),te=l.useCallback(()=>{c([])},[]),v=l.useCallback(p=>{const u=ge(p);if(u!=null&&u.negotiation){const{deal:m,versions:S,parties:A}=u.negotiation;e.find(_=>_.id===p)||t(_=>[..._.filter(ve=>ve.id!==p),gt([m])[0]]),a.filter(_=>_.dealId===p).length===0&&n(_=>[..._,...yt(S)]),r.filter(_=>_.dealId===p).length===0&&s(_=>[..._,...vt(A)]),f(p)}},[e,a,r]),b=l.useCallback(()=>{t([]),n([]),s([]),c([]),f(null),localStorage.removeItem(we),localStorage.removeItem(_e),localStorage.removeItem(Re),localStorage.removeItem(Pe),localStorage.removeItem(he)},[]),g={deals:e,currentDeal:B,currentDealId:d,versions:a,parties:r,activities:o,createDeal:$,updateDeal:w,deleteDeal:V,selectDeal:W,getDeal:L,transitionDealStatus:q,getVersionsForDeal:G,getCurrentVersion:H,createVersion:j,getCachedChangeSummary:T,cacheChangeSummary:R,getPartiesForDeal:ee,addParty:Q,logActivity:P,getActivitiesForDeal:z,clearActivities:te,loadScenario:v,resetToDefaults:b};return E.jsx(ht.Provider,{value:g,children:i})}function Un(){const i=l.useContext(ht);if(!i)throw new Error("useDeal must be used within a DealProvider");return i}const on={id:"solar",name:"Solar",colors:{pageBg:"#0a1610",headerBg:"#0d1f14",cardBg:"#101f16",cardBgHover:"#152a1d",primary:"#10b981",primaryHover:"#059669",primaryLight:"rgba(16, 185, 129, 0.15)",secondary:"#34d399",borderDefault:"#1e4d3a",borderStrong:"#2a6b4f",textPrimary:"#ecfdf5",textSecondary:"#a7d4c2",textMuted:"#6b9e8a",chartColors:["#10b981","#34d399","#059669","#22c55e","#4ade80"]}},cn={id:"wind",name:"Wind",colors:{pageBg:"#0a1520",headerBg:"#0d1a27",cardBg:"#0f1c2a",cardBgHover:"#142533",primary:"#06b6d4",primaryHover:"#0891b2",primaryLight:"rgba(6, 182, 212, 0.15)",secondary:"#22d3ee",borderDefault:"#155e75",borderStrong:"#0e7490",textPrimary:"#ecfeff",textSecondary:"#a5d8e6",textMuted:"#5b99ad",chartColors:["#06b6d4","#22d3ee","#0891b2","#14b8a6","#2dd4bf"]}},le={id:"corporate",name:"Corporate",colors:{pageBg:"#111214",headerBg:"#18191c",cardBg:"#1e2024",cardBgHover:"#26282d",primary:"#64748b",primaryHover:"#475569",primaryLight:"rgba(100, 116, 139, 0.15)",secondary:"#94a3b8",borderDefault:"#2e3138",borderStrong:"#3f434b",textPrimary:"#f1f3f5",textSecondary:"#9ca3af",textMuted:"#6b7280",chartColors:["#64748b","#94a3b8","#475569","#78909c","#90a4ae"]}},Ke={solar:on,wind:cn,corporate:le};function ln(i){return i&&i in Ke?Ke[i]:le}function dn(i){const e=document.documentElement,{colors:t}=i;e.style.setProperty("--industry-page-bg",t.pageBg),e.style.setProperty("--industry-header-bg",t.headerBg),e.style.setProperty("--industry-card-bg",t.cardBg),e.style.setProperty("--industry-card-bg-hover",t.cardBgHover),e.style.setProperty("--industry-primary",t.primary),e.style.setProperty("--industry-primary-hover",t.primaryHover),e.style.setProperty("--industry-primary-light",t.primaryLight),e.style.setProperty("--industry-secondary",t.secondary),e.style.setProperty("--industry-border-default",t.borderDefault),e.style.setProperty("--industry-border-strong",t.borderStrong),e.style.setProperty("--industry-text-primary",t.textPrimary),e.style.setProperty("--industry-text-secondary",t.textSecondary),e.style.setProperty("--industry-text-muted",t.textMuted),t.chartColors.forEach((a,n)=>{e.style.setProperty(`--industry-chart-${n+1}`,a)})}const Et=l.createContext(null);function un({children:i}){const e=_t(),t=l.useMemo(()=>{const s=e.pathname.match(/\/deals\/([^/]+)/);return s?s[1]:null},[e.pathname]),a=l.useMemo(()=>{var o;if(!t)return"corporate";const s=ge(t);return(o=s==null?void 0:s.metadata)!=null&&o.industry?s.metadata.industry:"corporate"},[t]),n=l.useMemo(()=>ln(a),[a]);l.useEffect(()=>{dn(n)},[n]);const r=l.useMemo(()=>({theme:n,industry:a,dealId:t,colors:n.colors,chartColors:n.colors.chartColors}),[n,a,t]);return E.jsx(Et.Provider,{value:r,children:i})}function $n(){const i=l.useContext(Et);return i||{theme:le,industry:"corporate",dealId:null,colors:le.colors,chartColors:le.colors.chartColors}}function pn({minDisplayTime:i=1600,onComplete:e}){const[t,a]=l.useState(!0),[n,r]=l.useState(!1);return l.useEffect(()=>{const s=setTimeout(()=>{r(!0),setTimeout(()=>{a(!1),e==null||e()},600)},i);return()=>clearTimeout(s)},[i,e]),t?E.jsxs("div",{className:`
        fixed inset-0 z-[9999]
        bg-navy-800
        flex flex-col items-center justify-center
        transition-opacity duration-[600ms] ease-out
        ${n?"opacity-0 pointer-events-none":"opacity-100"}
      `,children:[E.jsx("div",{className:`
          w-16 h-16 mb-6
          bg-gold-600 rounded-[14px]
          flex items-center justify-center
          font-display font-semibold text-4xl text-navy-600
          animate-icon-pulse
        `,children:"P"}),E.jsxs("div",{className:"flex flex-col items-center",children:[E.jsx("div",{className:`
            font-display text-[2rem] font-medium
            bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600
            bg-clip-text text-transparent
            opacity-0 animate-brand-reveal
          `,style:{animationDelay:"0.3s"},children:"ProViso"}),E.jsx("div",{className:`
            font-body text-[0.7rem] tracking-[0.3em] uppercase
            text-white/50 mt-2
            opacity-0 animate-brand-reveal
          `,style:{animationDelay:"0.5s"},children:"Credit Agreements as Code"})]}),E.jsx("div",{className:"w-[140px] h-0.5 rounded-[1px] overflow-hidden bg-white/10 mt-6",children:E.jsx("div",{className:"h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 animate-loading-progress"})}),E.jsx("div",{className:`
          font-display text-base italic text-white/40 mt-4
          opacity-0 animate-brand-reveal
        `,style:{animationDelay:"1.2s"},children:"Read like documents. Run like programs."})]}):null}function mn(i,e,t){const a=[];let n=0;for(const r of i)for(const s of r.conditions)n++,a.push({id:`cp-live-${n}`,dealId:e,versionId:t,sectionReference:r.section??"",category:yn(s.name,s.description??""),title:gn(s.name),description:s.description??"",responsiblePartyId:s.responsible??"unassigned",status:s.status==="not_applicable"?"waived":s.status,dueDate:null,satisfiedAt:s.status==="satisfied"?new Date:null,satisfiedByDocumentIds:[],waivedAt:s.status==="waived"||s.status==="not_applicable"?new Date:null,waiverApprovedBy:s.status==="not_applicable"?"N/A":null,notes:s.satisfies.length>0?`Satisfies: ${s.satisfies.join(", ")}`:""});return a}function fn(i,e){if(i.length===0)return e;if(e.length===0)return i;const t=new Map;for(const r of e)t.set(Xe(r.title),r);const a=[],n=new Set;for(const r of i){const s=Xe(r.title),o=t.get(s)??hn(s,t);o&&!n.has(o.id)?(n.add(o.id),a.push({id:o.id,dealId:o.dealId,versionId:o.versionId,sectionReference:o.sectionReference||r.sectionReference,category:o.category,title:o.title,description:o.description||r.description,responsiblePartyId:o.responsiblePartyId,status:o.status,dueDate:o.dueDate,satisfiedAt:o.satisfiedAt,satisfiedByDocumentIds:o.satisfiedByDocumentIds,waivedAt:o.waivedAt,waiverApprovedBy:o.waiverApprovedBy,notes:o.notes||r.notes})):a.push(r)}return a}function Xe(i){return i.toLowerCase().replace(/['']/g,"").replace(/[-_]/g," ").replace(/\s+/g," ").trim()}function hn(i,e){const t=i.split(" ").filter(r=>r.length>2);let a=null,n=0;for(const[r,s]of e){let o=0;for(const f of t)r.includes(f)&&o++;const c=r.split(" ").filter(f=>f.length>2);for(const f of c)i.includes(f)&&o++;const d=Math.min(t.length,c.length)>=2?2:1;o>n&&o>=d&&(n=o,a=s)}return a}function gn(i){return i.includes("_")?i.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "):i.replace(/([a-z])([A-Z])/g,"$1 $2")}function yn(i,e){const t=`${i} ${e}`.toLowerCase();return t.includes("certificate")&&(t.includes("incorporat")||t.includes("formation")||t.includes("good standing"))||t.includes("bylaw")||t.includes("resolution")||t.includes("board")||t.includes("charter")&&!t.includes("aircraft")?"corporate_documents":t.includes("credit agreement")||t.includes("loan agreement")||t.includes("facility agreement")?"credit_agreement":t.includes("security")||t.includes("pledge")||t.includes("mortgage")||t.includes("collateral")||t.includes("lien")?"security_documents":t.includes("ucc")||t.includes("financing statement")?"ucc_filings":t.includes("opinion")||t.includes("legal opinion")?"legal_opinions":t.includes("insurance")||t.includes("policy")||t.includes("builder")&&t.includes("risk")?"insurance":t.includes("kyc")||t.includes("aml")||t.includes("know your")||t.includes("anti-money")?"kyc_aml":t.includes("financial")||t.includes("audit")||t.includes("balance sheet")||t.includes("income statement")||t.includes("pro forma")?"financial":t.includes("solvency")||t.includes("officer")&&t.includes("certificate")?"certificates":t.includes("permit")||t.includes("regulatory")||t.includes("license")||t.includes("approval")||t.includes("nepa")||t.includes("zoning")||t.includes("interconnection")||t.includes("faa")||t.includes("tribal")||t.includes("environmental")||t.includes("alta")||t.includes("survey")?"permits":t.includes("technical")||t.includes("engineer")||t.includes("construction")||t.includes("epc")||t.includes("turbine")||t.includes("wind resource")||t.includes("supply agreement")?"technical":t.includes("tax")||t.includes("equity")&&t.includes("commit")||t.includes("flip")||t.includes("depreciation")?"tax_equity":t.includes("offtake")||t.includes("ppa")||t.includes("power purchase")||t.includes("hedge")?"offtake":t.includes("certificate")||t.includes("compliance")||t.includes("officer")?"certificates":"other"}const vn=l.lazy(()=>Z(()=>import("./Landing-BEkw5vSQ.js"),__vite__mapDeps([0,1,2,3,4,5]))),En=l.lazy(()=>Z(()=>import("./About-B5A-kXZe.js"),__vite__mapDeps([6,1,4,3,5]))),Cn=l.lazy(()=>Z(()=>import("./GuidedDemo-DId8IQ2l.js"),__vite__mapDeps([7,5,1,3,8,9]))),An=l.lazy(()=>Z(()=>import("./DealList-DkT4_ifo.js"),__vite__mapDeps([10,1,11,12,3,13,14,9,5]))),Sn=l.lazy(()=>Z(()=>import("./NegotiationStudio-CJo6WGCW.js"),__vite__mapDeps([15,1,11,12,9,3,13,16,5,17,8,18]))),bn=l.lazy(()=>Z(()=>import("./ClosingDashboard-BbwRUgCc.js"),__vite__mapDeps([19,1,11,12,9,3,16,5,17,20]))),Tn=l.lazy(()=>Z(()=>import("./MonitoringDashboard-BLTwY7ga.js"),__vite__mapDeps([21,1,11,12,14,3,13,16,5,8,9,2,20,18])));function Dn({children:i,dealId:e}){const{getConditionsPrecedentRaw:t,isLoaded:a}=na(),n=l.useMemo(()=>{var o;if(!a)return;const r=t();if(r.length===0)return;const s=mn(r,e??"current","current");if(e){const c=ge(e);if((o=c==null?void 0:c.closing)!=null&&o.conditions)return fn(s,c.closing.conditions)}return s},[a,t,e]);return E.jsx(Qa,{dealId:e,interpreterConditions:n,children:i})}function In(){const{dealId:i}=xt();return E.jsx(Dn,{dealId:i,children:E.jsx(bn,{})})}function wn(){return E.jsx("div",{className:"min-h-screen bg-surface-0 flex items-center justify-center",children:E.jsxs("div",{className:"text-center",children:[E.jsx("div",{className:"w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"}),E.jsx("p",{className:"text-text-tertiary",children:"Loading..."})]})})}function _n(){const[i,e]=l.useState(!1),[t,a]=l.useState(!1);l.useEffect(()=>{!sessionStorage.getItem("proviso-visited")&&!t&&(e(!0),sessionStorage.setItem("proviso-visited","true"))},[t]);const n=()=>{e(!1),a(!0)};return E.jsx(sn,{children:E.jsx(aa,{children:E.jsx(Rt,{children:E.jsxs(un,{children:[i&&E.jsx(pn,{minDisplayTime:1600,onComplete:n}),E.jsx(l.Suspense,{fallback:E.jsx(wn,{}),children:E.jsxs(Pt,{children:[E.jsx(X,{path:"/",element:E.jsx(vn,{})}),E.jsx(X,{path:"/about",element:E.jsx(En,{})}),E.jsx(X,{path:"/demo",element:E.jsx(Cn,{})}),E.jsx(X,{path:"/deals",element:E.jsx(An,{})}),E.jsx(X,{path:"/deals/:dealId/negotiate",element:E.jsx(Sn,{})}),E.jsx(X,{path:"/deals/:dealId/closing",element:E.jsx(In,{})}),E.jsx(X,{path:"/deals/:dealId/monitor",element:E.jsx(Tn,{})}),E.jsx(X,{path:"*",element:E.jsx(Nt,{to:"/",replace:!0})})]})})]})})})})}kt.createRoot(document.getElementById("root")).render(E.jsx(l.StrictMode,{children:E.jsx(_n,{})}));export{On as D,Ln as a,Fn as b,Mn as c,ze as d,Bn as e,Un as f,pt as g,xn as h,J as i,E as j,$n as k,na as l,ge as m,Je as p,kn as u};
