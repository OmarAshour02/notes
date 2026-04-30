import{j as t}from"./jsx-runtime.TBa3i5EZ.js";import{r as c}from"./index.CVf8TyFT.js";const V="⌀",I=3,R=3;function oe(){const[m,u]=c.useState([{key:"omar",value:"engineer"},{key:"mohammed",value:"musician"}]),[p,d]=c.useState([{key:"omar",value:"engineer"},{key:"mohammed",value:"musician"}]),[b,f]=c.useState([]),[j,x]=c.useState(1),[J,N]=c.useState(1),[y,M]=c.useState("tiered"),[T,q]=c.useState(""),[A,D]=c.useState(""),[K,W]=c.useState(""),[F,$]=c.useState([{id:0,tone:"info",text:"ready. memtable preloaded with 2 entries."}]),[L,z]=c.useState(!1),w=c.useRef(null),k=c.useRef(!1);c.useEffect(()=>{w.current&&(w.current.scrollTop=w.current.scrollHeight)},[F]);const g=c.useRef(null);function o(e,s){$(r=>{const a=[...r,{id:J,tone:e,text:s}];return N(i=>i+1),a.slice(-40)})}function C(e){u(s=>{const r=s.findIndex(i=>i.key===e.key);if(r===-1)return[...s,e];const a=s.slice();return a[r]=e,a}),d(s=>[...s,e])}function S(){const e=T.trim(),s=A.trim();!e||!s||(C({key:e,value:s}),o("wal",`append "${e}=${s}" to WAL, then memtable`),q(""),D(""))}function Q(e){C({key:e,value:null}),o("wal",`append tombstone for "${e}" to WAL, then memtable`)}function G(){if(m.length===0){o("info","memtable is empty, nothing to flush");return}const e=[...m].sort((r,a)=>r.key.localeCompare(a.key)),s=j;f(r=>[{id:s,level:0,entries:e},...r]),x(r=>r+1),u([]),d([]),o("flush",`flush memtable → sstable-${s} at L0; WAL truncated`)}function O(e){const s=new Map;for(let r=e.length-1;r>=0;r--)for(const a of e[r])s.set(a.key,a);return Array.from(s.values())}function _(){return y==="tiered"?U():X()}function U(){const e=new Map;for(const n of b){const h=e.get(n.level)??[];h.push(n),e.set(n.level,h)}const s=[...e.entries()].filter(([,n])=>n.length>=I).sort((n,h)=>n[0]-h[0]);if(s.length===0){o("info",`no tier has ≥ ${I} sstables yet`);return}const[r,a]=s[0],i=a.map(n=>n.id),v=O(a.map(n=>n.entries)).filter(n=>n.value!==null||r>0?!0:n.value!==null).sort((n,h)=>n.key.localeCompare(h.key)),l=j;f(n=>[{id:l,level:r+1,entries:v},...n.filter(h=>!i.includes(h.id))]),x(n=>n+1),o("compact",`tiered: merged sstables ${i.map(n=>`sstable-${n}`).join(", ")} → sstable-${l} at L${r+1}`)}function X(){const e=b.filter(l=>l.level===0);if(e.length<R){o("info",`leveled: L0 has ${e.length} sstable${e.length===1?"":"s"}, need ≥ ${R}`);return}const s=b.find(l=>l.level===1),r=s?[...e,s]:e,a=O(r.map(l=>l.entries)).filter(l=>l.value!==null).sort((l,n)=>l.key.localeCompare(n.key)),i=j,v=r.map(l=>l.id);f(l=>[{id:i,level:1,entries:a},...l.filter(n=>!v.includes(n.id))]),x(l=>l+1),o("compact",`leveled: merged ${r.map(l=>`sstable-${l.id}`).join(", ")} → one sstable-${i} at L1`)}function E(){const e=K.trim();if(!e)return;const s=m.find(a=>a.key===e);if(s){o("read",`get("${e}") → memtable hit: ${s.value===null?"tombstone":`"${s.value}"`}`);return}o("read",`get("${e}") → memtable miss, walking sstables newest-first`);const r=[...b].sort((a,i)=>a.level!==i.level?a.level-i.level:i.id-a.id);for(const a of r){const i=a.entries.find(v=>v.key===e);if(i){o("read",`  sstable-${a.id} (L${a.level}) → ${i.value===null?"tombstone (deleted)":`"${i.value}"`}`);return}o("read",`  sstable-${a.id} (L${a.level}) → miss`)}o("read","  not found")}function Y(){k.current=!0,z(!1),u([]),d([]),f([]),x(1),$([{id:0,tone:"info",text:"reset."}]),N(1)}function Z(e){return new Promise(s=>setTimeout(s,e))}g.current={upsertMemtable:C,handleFlush:G,handleCompact:_,lookup:e=>{W(e),E()}};async function ee(){if(L){k.current=!0;return}k.current=!1,z(!0),u([]),d([]),f([]),x(1),$([{id:0,tone:"info",text:"▶ running scripted demo"}]),N(1);const e=async(r,a=700)=>{if(k.current)throw new Error("cancelled");r(),await Z(a)},s=(r,a,i)=>{g.current?.upsertMemtable({key:r,value:a});const v=a===null?`tombstone "${r}"`:`append "${r}=${a}" to WAL, then memtable`;o("wal",i??v)};try{await e(()=>s("omar","engineer")),await e(()=>s("mohammed","musician")),await e(()=>s("fatma","baker"),900),await e(()=>g.current?.handleFlush(),1100),await e(()=>s("omar","architect",'overwrite "omar" with "architect" (old value still in sstable-1)')),await e(()=>s("ahmed","barista"),900),await e(()=>o("info",`now let's delete "mohammed". since sstables are immutable, we can't go back and erase the old line. we write a tombstone instead.`),1100),await e(()=>s("mohammed",null,'tombstone "mohammed" → memtable now has the deletion marker (⌀)'),1300),await e(()=>s("salma","pilot"),900),await e(()=>o("info",'flush carries the tombstone into sstable-2. the original "mohammed=musician" still lives in sstable-1, but the newer tombstone shadows it on reads.'),1300),await e(()=>g.current?.handleFlush(),1300),await e(()=>s("noor","teacher"),900),await e(()=>s("youssef","doctor"),900),await e(()=>g.current?.handleFlush(),1100),await e(()=>o("info",'L0 now has 3 sstables. time to compact. watch "mohammed" disappear: the tombstone meets the live row in sstable-1, both are dropped.'),1500),await e(()=>g.current?.handleCompact(),1500),await e(()=>o("info",'read "mohammed": the merged file no longer contains it.'),700),await e(()=>g.current?.lookup("mohammed"),1100),await e(()=>o("info",'read "omar": the newer overwrite "architect" wins.'),700),await e(()=>g.current?.lookup("omar"),1100),await e(()=>o("info","done. play around, or hit reset."),400)}catch{o("info","demo cancelled.")}finally{z(!1)}}const B=c.useMemo(()=>[...m].sort((e,s)=>e.key.localeCompare(s.key)),[m]),te=c.useMemo(()=>{const e=new Map;for(const s of b){const r=e.get(s.level)??[];r.push(s),e.set(s.level,r)}for(const s of e.values())s.sort((r,a)=>a.id-r.id);return[...e.entries()].sort((s,r)=>s[0]-r[0])},[b]);return t.jsxs("div",{className:"sst",children:[t.jsxs("div",{className:"sst-controls",children:[t.jsxs("div",{className:"sst-row",children:[t.jsx("input",{className:"sst-input",placeholder:"key",value:T,onChange:e=>q(e.target.value),onKeyDown:e=>e.key==="Enter"&&S()}),t.jsx("input",{className:"sst-input",placeholder:"value",value:A,onChange:e=>D(e.target.value),onKeyDown:e=>e.key==="Enter"&&S()}),t.jsx("button",{className:"sst-btn sst-btn-primary",onClick:S,children:"put"})]}),t.jsxs("div",{className:"sst-row",children:[t.jsx("input",{className:"sst-input",placeholder:"lookup key",value:K,onChange:e=>W(e.target.value),onKeyDown:e=>e.key==="Enter"&&E()}),t.jsx("button",{className:"sst-btn",onClick:E,children:"get"})]}),t.jsxs("div",{className:"sst-row",children:[t.jsx("button",{className:"sst-btn sst-btn-warn",onClick:G,children:"flush memtable"}),t.jsx("button",{className:"sst-btn sst-btn-ghost",onClick:_,children:"compact"}),t.jsx("button",{className:`sst-btn ${L?"sst-btn-running":"sst-btn-demo"}`,onClick:ee,children:L?"■ stop demo":"▶ run demo"}),t.jsx("button",{className:"sst-btn",onClick:Y,children:"reset"})]}),t.jsxs("div",{className:"sst-row sst-strategy",children:[t.jsx("span",{className:"sst-strategy-label",children:"compaction:"}),t.jsx("button",{className:`sst-pill ${y==="tiered"?"active":""}`,onClick:()=>{M("tiered"),o("info","compaction strategy → size-tiered")},children:"size-tiered"}),t.jsx("button",{className:`sst-pill ${y==="leveled"?"active":""}`,onClick:()=>{M("leveled"),o("info","compaction strategy → leveled")},children:"leveled"}),t.jsx("span",{className:"sst-strategy-hint",children:y==="tiered"?`merge ≥ ${I} sstables of same level into the next level`:`when L0 has ≥ ${R} sstables, merge them into the single L1 file`})]})]}),t.jsxs("div",{className:"sst-grid",children:[t.jsxs("section",{className:"sst-panel",children:[t.jsxs("header",{className:"sst-panel-head",children:[t.jsx("h4",{children:"WAL"}),t.jsxs("span",{children:[p.length," entr",p.length===1?"y":"ies"," · append-only"]})]}),p.length===0?t.jsx("p",{className:"sst-empty",children:"truncated. write to refill."}):t.jsx("ol",{className:"sst-wal",children:p.map((e,s)=>t.jsxs("li",{children:[t.jsx("span",{className:"sst-ln",children:s+1}),t.jsx("span",{className:"sst-key",children:e.key}),t.jsx("span",{className:"sst-arrow",children:"→"}),t.jsx("span",{className:`sst-val ${e.value===null?"tomb":""}`,children:e.value===null?V:e.value})]},s))}),t.jsx("p",{className:"sst-foot",children:"crash-safe replay source for the memtable."})]}),t.jsxs("section",{className:"sst-panel",children:[t.jsxs("header",{className:"sst-panel-head",children:[t.jsx("h4",{children:"event log"}),t.jsx("span",{children:"most recent at the bottom"})]}),t.jsx("div",{className:"sst-events",ref:w,children:F.map(e=>t.jsxs("div",{className:`sst-event tone-${e.tone}`,children:[t.jsx("span",{className:"sst-event-tag",children:e.tone}),t.jsx("span",{children:e.text})]},e.id))})]})]}),t.jsxs("div",{className:"sst-board",children:[t.jsx(H,{title:"memtable",subtitle:"mutable · in-memory",children:B.length===0?t.jsx(se,{children:"flushed"}):t.jsx(P,{entries:B,onDelete:Q,mutable:!0})}),te.map(([e,s])=>t.jsxs("div",{className:"sst-level",children:[t.jsxs("div",{className:"sst-level-label",children:["L",e]}),t.jsx("div",{className:"sst-level-stack",children:s.map(r=>t.jsx(H,{title:`sstable-${r.id}`,subtitle:`L${r.level} · ${r.entries.length} keys`,children:t.jsx(P,{entries:r.entries})},r.id))})]},e)),b.length===0&&t.jsx("p",{className:"sst-hint",children:"put some entries, then flush to materialize an sstable at L0."})]}),t.jsx(re,{})]})}function H({title:m,subtitle:u,children:p}){return t.jsxs("section",{className:"sst-section",children:[t.jsxs("header",{className:"sst-section-head",children:[t.jsx("h4",{children:m}),t.jsx("span",{children:u})]}),p]})}function se({children:m}){return t.jsx("p",{className:"sst-empty",children:m})}function P({entries:m,onDelete:u,mutable:p=!1}){return t.jsx("ul",{className:"sst-list",children:m.map(d=>t.jsxs("li",{className:d.value===null?"tombstone":"",children:[t.jsx("span",{className:"sst-key",children:d.key}),t.jsx("span",{className:"sst-arrow",children:"→"}),t.jsx("span",{className:"sst-val",children:d.value===null?V:d.value}),p&&u&&d.value!==null&&t.jsx("button",{className:"sst-x",onClick:()=>u(d.key),"aria-label":`delete ${d.key}`,title:"write tombstone",children:"×"})]},d.key))})}function re(){return t.jsx("style",{children:`
      .sst {
        font-family: var(--mono);
        font-size: 0.92rem;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1.25rem;
        margin: 2rem 0;
        color: var(--fg);
      }
      .sst-controls { display: flex; flex-direction: column; gap: 0.6rem; }
      .sst-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
      .sst-input {
        flex: 1 1 8rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        color: var(--fg);
        padding: 0.45rem 0.7rem;
        border-radius: 4px;
        font-family: var(--mono);
        font-size: 0.9rem;
      }
      .sst-input:focus { outline: 1px solid var(--aqua); border-color: var(--aqua); }
      .sst-btn {
        background: var(--bg);
        color: var(--fg-dim);
        border: 1px solid var(--bg2);
        padding: 0.45rem 0.85rem;
        border-radius: 4px;
        cursor: pointer;
        font-family: var(--mono);
        font-size: 0.85rem;
        transition: background 100ms, color 100ms, border-color 100ms;
      }
      .sst-btn:hover:not(:disabled) { background: var(--bg2); color: var(--yellow); border-color: var(--yellow); }
      .sst-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .sst-btn-primary { color: var(--green); border-color: color-mix(in srgb, var(--green) 50%, transparent); }
      .sst-btn-primary:hover:not(:disabled) { color: var(--bg); background: var(--green); border-color: var(--green); }
      .sst-btn-warn { color: var(--orange); border-color: color-mix(in srgb, var(--orange) 50%, transparent); }
      .sst-btn-warn:hover:not(:disabled) { color: var(--bg); background: var(--orange); border-color: var(--orange); }
      .sst-btn-ghost { color: var(--purple); border-color: color-mix(in srgb, var(--purple) 50%, transparent); }
      .sst-btn-ghost:hover:not(:disabled) { color: var(--bg); background: var(--purple); border-color: var(--purple); }
      .sst-btn-demo { color: var(--aqua); border-color: color-mix(in srgb, var(--aqua) 50%, transparent); }
      .sst-btn-demo:hover:not(:disabled) { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .sst-btn-running { color: var(--bg); background: var(--red); border-color: var(--red); }

      .sst-strategy { gap: 0.4rem; }
      .sst-strategy-label { color: var(--gray); font-size: 0.78rem; }
      .sst-pill {
        background: var(--bg);
        color: var(--fg-soft);
        border: 1px solid var(--bg2);
        border-radius: 999px;
        padding: 0.25rem 0.7rem;
        font-family: var(--mono);
        font-size: 0.78rem;
        cursor: pointer;
        transition: color 100ms, border-color 100ms, background 100ms;
      }
      .sst-pill:hover { color: var(--yellow); border-color: var(--yellow); }
      .sst-pill.active { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .sst-strategy-hint {
        color: var(--gray);
        font-size: 0.74rem;
        font-style: italic;
        margin-left: 0.4rem;
      }

      .sst-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
        gap: 0.85rem;
        margin-top: 1rem;
      }
      @media (max-width: 720px) {
        .sst-grid { grid-template-columns: 1fr; }
      }

      .sst-panel {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.8rem 0.9rem;
        display: flex;
        flex-direction: column;
        min-height: 12rem;
      }
      .sst-panel-head {
        display: flex; justify-content: space-between; align-items: baseline;
        margin-bottom: 0.55rem; gap: 0.5rem;
      }
      .sst-panel-head h4 {
        margin: 0; font-size: 0.82rem; color: var(--yellow); letter-spacing: 0.05em;
      }
      .sst-panel-head span { font-size: 0.7rem; color: var(--gray); }

      .sst-wal {
        list-style: none; padding: 0; margin: 0;
        font-size: 0.82rem;
        flex: 1;
        overflow-y: auto;
        max-height: 14rem;
      }
      .sst-wal li {
        display: grid;
        grid-template-columns: 1.6em 1fr auto 1fr;
        align-items: center;
        gap: 0.4rem;
        padding: 0.18rem 0;
        border-bottom: 1px dashed var(--bg2);
      }
      .sst-ln { color: var(--gray); font-size: 0.72rem; text-align: right; }

      .sst-foot {
        margin: 0.5rem 0 0;
        padding-top: 0.5rem;
        border-top: 1px solid var(--bg2);
        color: var(--gray);
        font-size: 0.74rem;
        font-style: italic;
      }

      .sst-events {
        flex: 1;
        overflow-y: auto;
        max-height: 14rem;
        font-size: 0.78rem;
        line-height: 1.5;
        font-family: var(--mono);
      }
      .sst-event {
        display: grid;
        grid-template-columns: 5em 1fr;
        gap: 0.5rem;
        padding: 0.18rem 0;
        border-bottom: 1px dashed var(--bg2);
        color: var(--fg-soft);
      }
      .sst-event-tag {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--gray);
      }
      .tone-wal .sst-event-tag { color: var(--blue); }
      .tone-flush .sst-event-tag { color: var(--orange); }
      .tone-compact .sst-event-tag { color: var(--purple); }
      .tone-read .sst-event-tag { color: var(--aqua); }
      .tone-info .sst-event-tag { color: var(--gray); }

      .sst-board {
        display: flex;
        gap: 0.85rem;
        overflow-x: auto;
        padding: 1.5rem 0 0.5rem;
        align-items: flex-start;
      }
      .sst-level {
        display: flex; flex-direction: column; gap: 0.4rem; flex: 0 0 auto;
      }
      .sst-level-label {
        font-size: 0.72rem; color: var(--yellow);
        letter-spacing: 0.1em; padding-left: 0.2rem;
      }
      .sst-level-stack { display: flex; gap: 0.6rem; }

      .sst-section {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.8rem 0.9rem;
        min-width: 14rem;
        flex: 0 0 auto;
      }
      .sst-section-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.6rem;
        gap: 0.5rem;
      }
      .sst-section-head h4 { margin: 0; font-size: 0.85rem; color: var(--yellow); letter-spacing: 0.04em; }
      .sst-section-head span { font-size: 0.7rem; color: var(--gray); }

      .sst-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
      .sst-list li {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.4rem;
        border-radius: 3px;
        background: var(--bg-soft);
      }
      .sst-list li.tombstone { color: var(--gray); text-decoration: line-through; opacity: 0.7; }
      .sst-key { color: var(--blue); }
      .sst-arrow { color: var(--gray); }
      .sst-val { color: var(--fg); }
      .sst-val.tomb { color: var(--red); text-decoration: line-through; }
      .sst-list li.tombstone .sst-val { color: var(--red); text-decoration: none; }
      .sst-x {
        background: transparent; border: none; color: var(--gray);
        cursor: pointer; font-size: 1rem; line-height: 1; padding: 0 0.2rem;
      }
      .sst-x:hover { color: var(--red); }

      .sst-empty { color: var(--gray); font-style: italic; margin: 0; font-size: 0.85rem; }
      .sst-hint { color: var(--gray); font-style: italic; align-self: center; padding: 1rem; margin: 0; }
    `})}export{oe as default};
