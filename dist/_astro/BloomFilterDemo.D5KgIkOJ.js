import{j as e}from"./jsx-runtime.TBa3i5EZ.js";import{r as i}from"./index.CVf8TyFT.js";const q=[31,158,44,83,161,119,179,68,200,16];function K(a,c,n){let d=c;for(let t=0;t<a.length;t++)d=(d*31^a.charCodeAt(t))>>>0;return d%n}function C(a,c,n){const d=[];for(let t=0;t<c;t++)d.push(K(a,q[t%q.length],n));return d}function U(){const[a,c]=i.useState(48),[n,d]=i.useState(3),[t,h]=i.useState(()=>new Uint8Array(48)),[l,y]=i.useState([]),[j,w]=i.useState(""),[k,N]=i.useState(""),[o,u]=i.useState(null);function S(r){h(new Uint8Array(r)),y([]),u(null)}function $(r){c(r),S(r)}function I(r){d(r),u(null)}function x(r){const s=(r??j).trim();if(!s)return;const m=C(s,n,a),f=m.map(p=>({idx:p,was:t[p]?1:0})),b=new Uint8Array(t);for(const p of m)b[p]=1;h(b),l.includes(s)||y([...l,s]),u({kind:"insert",key:s,probes:f}),w("")}function z(r){const s=k.trim();if(!s)return;const f=C(s,n,a).map(g=>({idx:g,was:t[g]?1:0})),p=f.every(g=>g.was===1)?l.includes(s)?"true-positive":"maybe":"definitely-not";u({kind:"query",key:s,probes:f,result:p}),N("")}function M(){S(a)}const E=i.useMemo(()=>{let r=0;for(let s=0;s<t.length;s++)t[s]&&(r+=1);return r},[t]),A=i.useMemo(()=>{const r=l.length;return r===0?0:Math.pow(1-Math.exp(-n*r/a),n)},[l.length,n,a]),D=i.useMemo(()=>o?new Set(o.probes.map(r=>r.idx)):new Set,[o]);return e.jsxs("div",{className:"bf",children:[e.jsxs("div",{className:"bf-controls",children:[e.jsxs("div",{className:"bf-row",children:[e.jsx("input",{className:"bf-input",placeholder:"key to insert",value:j,onChange:r=>w(r.target.value),onKeyDown:r=>r.key==="Enter"&&x()}),e.jsx("button",{className:"bf-btn bf-btn-primary",onClick:()=>x(),children:"insert"})]}),e.jsxs("div",{className:"bf-row",children:[e.jsx("input",{className:"bf-input",placeholder:"key to test",value:k,onChange:r=>N(r.target.value),onKeyDown:r=>r.key==="Enter"&&z()}),e.jsx("button",{className:"bf-btn",onClick:()=>z(),children:"query"}),e.jsx("button",{className:"bf-btn bf-btn-warn",onClick:M,children:"reset"})]}),e.jsxs("div",{className:"bf-row bf-sliders",children:[e.jsxs("label",{className:"bf-slider",children:[e.jsxs("span",{children:["m (bits): ",e.jsx("strong",{children:a})]}),e.jsx("input",{type:"range",min:16,max:96,step:4,value:a,onChange:r=>$(Number(r.target.value))})]}),e.jsxs("label",{className:"bf-slider",children:[e.jsxs("span",{children:["k (hashes): ",e.jsx("strong",{children:n})]}),e.jsx("input",{type:"range",min:1,max:6,step:1,value:n,onChange:r=>I(Number(r.target.value))})]})]}),e.jsxs("div",{className:"bf-stats",children:[e.jsx(v,{label:"inserted",value:l.length}),e.jsx(v,{label:"bits set",value:`${E} / ${a}`}),e.jsx(v,{label:"theoretical false-positive",value:l.length===0?"0%":`${(A*100).toFixed(1)}%`})]})]}),e.jsx("div",{className:"bf-grid",children:Array.from({length:a}).map((r,s)=>{const m=t[s]===1,f=D.has(s);let b="bf-cell";return m&&(b+=" set"),f&&(b+=" probed"),e.jsx("div",{className:b,title:`bit ${s}: ${m?1:0}`,children:e.jsx("span",{className:"bf-cell-i",children:s})},s)})}),o&&e.jsx("div",{className:`bf-trace ${o.kind==="query"?`q-${o.result}`:""}`,children:o.kind==="insert"?e.jsxs(e.Fragment,{children:[e.jsxs("strong",{children:['insert "',o.key,'"']}),": set bits"," ",o.probes.map((r,s)=>e.jsxs("span",{className:"bf-bit",children:[r.idx,r.was===1?" (already 1)":"",s<o.probes.length-1?", ":""]},s))]}):e.jsxs(e.Fragment,{children:[e.jsxs("strong",{children:['query "',o.key,'"']}),": probed"," ",o.probes.map((r,s)=>e.jsxs("span",{className:`bf-bit ${r.was===0?"miss":"hit"}`,children:[r.idx,"=",r.was,s<o.probes.length-1?", ":""]},s))," ","→"," ",o.result==="definitely-not"&&e.jsx("span",{className:"bf-verdict no",children:"definitely not in set"}),o.result==="maybe"&&e.jsx("span",{className:"bf-verdict maybe",children:"maybe in set (false positive, never inserted)"}),o.result==="true-positive"&&e.jsx("span",{className:"bf-verdict yes",children:"probably in set (true positive)"})]})}),e.jsxs("div",{className:"bf-side",children:[e.jsxs("header",{className:"bf-side-head",children:[e.jsx("h4",{children:"inserted keys"}),e.jsx("span",{children:"ground truth (the filter doesn't store this)"})]}),l.length===0?e.jsx("p",{className:"bf-empty",children:'none yet. try inserting "omar", "mohammed", "fatma".'}):e.jsx("ul",{className:"bf-keys",children:l.map(r=>e.jsx("li",{children:r},r))}),e.jsx("div",{className:"bf-quick",children:["omar","mohammed","fatma","ahmed","salma"].map(r=>e.jsxs("button",{className:"bf-chip",onClick:()=>x(r),disabled:l.includes(r),children:["+ ",r]},r))})]}),e.jsx(F,{})]})}function v({label:a,value:c}){return e.jsxs("div",{className:"bf-stat",children:[e.jsx("span",{className:"bf-stat-label",children:a}),e.jsx("span",{className:"bf-stat-value",children:c})]})}function F(){return e.jsx("style",{children:`
      .bf {
        font-family: var(--mono);
        font-size: 0.92rem;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1.25rem;
        margin: 2rem 0;
        color: var(--fg);
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
        gap: 1rem;
      }
      @media (max-width: 720px) { .bf { grid-template-columns: 1fr; } }

      .bf-controls { display: flex; flex-direction: column; gap: 0.55rem; }
      .bf-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
      .bf-input {
        flex: 1 1 9rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        color: var(--fg);
        padding: 0.45rem 0.7rem;
        border-radius: 4px;
        font-family: var(--mono);
        font-size: 0.9rem;
      }
      .bf-input:focus { outline: 1px solid var(--aqua); border-color: var(--aqua); }
      .bf-btn {
        background: var(--bg); color: var(--fg-dim);
        border: 1px solid var(--bg2);
        padding: 0.45rem 0.85rem; border-radius: 4px;
        cursor: pointer; font-family: var(--mono); font-size: 0.85rem;
        transition: background 100ms, color 100ms, border-color 100ms;
      }
      .bf-btn:hover:not(:disabled) { background: var(--bg2); color: var(--yellow); border-color: var(--yellow); }
      .bf-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .bf-btn-primary { color: var(--green); border-color: color-mix(in srgb, var(--green) 50%, transparent); }
      .bf-btn-primary:hover:not(:disabled) { color: var(--bg); background: var(--green); border-color: var(--green); }
      .bf-btn-warn { color: var(--orange); border-color: color-mix(in srgb, var(--orange) 50%, transparent); }
      .bf-btn-warn:hover:not(:disabled) { color: var(--bg); background: var(--orange); border-color: var(--orange); }

      .bf-sliders { gap: 1rem; }
      .bf-slider { display: flex; flex-direction: column; gap: 0.3rem; flex: 1 1 12rem; font-size: 0.78rem; color: var(--fg-soft); }
      .bf-slider strong { color: var(--yellow); font-weight: 600; }
      .bf-slider input[type="range"] { accent-color: var(--aqua); width: 100%; }

      .bf-stats { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.2rem; }
      .bf-stat {
        background: var(--bg);
        border: 1px dashed var(--bg2);
        border-radius: 4px;
        padding: 0.4rem 0.7rem;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .bf-stat-label { font-size: 0.68rem; color: var(--gray); letter-spacing: 0.08em; text-transform: uppercase; }
      .bf-stat-value { font-size: 0.9rem; color: var(--fg); }

      .bf-grid {
        grid-column: 1 / -1;
        margin-top: 0.6rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(2rem, 1fr));
        gap: 0.25rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.7rem;
      }
      .bf-cell {
        position: relative;
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 3px;
        color: var(--gray);
        font-size: 0.62rem;
        transition: background 120ms, color 120ms, border-color 120ms;
      }
      .bf-cell-i { font-family: var(--mono); }
      .bf-cell.set {
        background: color-mix(in srgb, var(--yellow) 28%, var(--bg));
        border-color: var(--yellow);
        color: var(--fg-dim);
      }
      .bf-cell.probed {
        outline: 2px solid var(--aqua);
        outline-offset: -2px;
      }
      .bf-cell.set.probed {
        outline-color: var(--green);
      }

      .bf-trace {
        grid-column: 1 / -1;
        margin-top: 0.5rem;
        background: var(--bg);
        border: 1px dashed var(--bg2);
        border-radius: 4px;
        padding: 0.6rem 0.85rem;
        color: var(--fg-soft);
        font-size: 0.85rem;
        line-height: 1.55;
      }
      .bf-trace strong { color: var(--yellow); font-weight: 600; }
      .bf-bit { color: var(--fg); }
      .bf-bit.hit { color: var(--green); }
      .bf-bit.miss { color: var(--red); }

      .bf-verdict { font-weight: 600; }
      .bf-verdict.no { color: var(--red); }
      .bf-verdict.maybe { color: var(--orange); }
      .bf-verdict.yes { color: var(--green); }

      .bf-side {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.85rem 0.95rem;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }
      .bf-side-head { display: flex; flex-direction: column; gap: 0.1rem; }
      .bf-side-head h4 { margin: 0; font-size: 0.82rem; color: var(--yellow); letter-spacing: 0.05em; }
      .bf-side-head span { font-size: 0.7rem; color: var(--gray); font-style: italic; }
      .bf-keys { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.18rem; max-height: 10rem; overflow-y: auto; font-size: 0.85rem; color: var(--blue); }
      .bf-keys li { padding: 0.1rem 0; border-bottom: 1px dashed var(--bg2); }
      .bf-empty { color: var(--gray); font-style: italic; margin: 0; font-size: 0.82rem; }
      .bf-quick { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--bg2); }
      .bf-chip {
        background: var(--bg-soft); color: var(--fg-soft);
        border: 1px solid var(--bg2); border-radius: 999px;
        padding: 0.22rem 0.6rem; font-family: var(--mono); font-size: 0.74rem;
        cursor: pointer; transition: color 100ms, border-color 100ms;
      }
      .bf-chip:hover:not(:disabled) { color: var(--yellow); border-color: var(--yellow); }
      .bf-chip:disabled { opacity: 0.35; cursor: not-allowed; }
    `})}export{U as default};
