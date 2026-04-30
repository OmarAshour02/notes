import{j as e}from"./jsx-runtime.TBa3i5EZ.js";import{r as c}from"./index.CVf8TyFT.js";const g=[{kind:"output",text:""},{kind:"output",text:`try:
·db_set 42 cat   
·db_set 42 dog   
·db_get 42`,tone:"info"}];function z(){const[s,f]=c.useState([]),[x,u]=c.useState(g),[b,v]=c.useState(""),[y,m]=c.useState(null),p=c.useRef(null);c.useEffect(()=>{p.current&&(p.current.scrollTop=p.current.scrollHeight)},[x]);function r(t){u(n=>[...n,...t])}function k(t){const n=t.trim();if(!n)return;r([{kind:"input",text:n}]);const o=n.split(/\s+/),i=o[0];if(i==="db_set"){if(o.length<3){r([{kind:"output",text:"usage: db_set KEY VALUE",tone:"warn"}]);return}const l=o[1],a=o.slice(2).join(" ");f(d=>[...d,{n:d.length+1,key:l,value:a}]),m(null);return}if(i==="db_get"){if(o.length!==2){r([{kind:"output",text:"usage: db_get KEY",tone:"warn"}]);return}const l=o[1];let a=0,d=null;for(const j of s)a+=1,j.key===l&&(d=j);m(a),r(d?[{kind:"output",text:d.value,tone:"ok"},{kind:"output",text:`# scanned ${a} line${a===1?"":"s"} to find the latest write`,tone:"info"}]:[{kind:"output",text:`# scanned ${a} line${a===1?"":"s"}, no match`,tone:"info"}]);return}if(i==="cat"&&o[1]==="database"){if(s.length===0){r([{kind:"output",text:"(empty)",tone:"info"}]);return}r(s.map(l=>({kind:"output",text:`${l.key},${l.value}`})));return}if(i==="clear"){u(g),m(null);return}if(i==="reset"){f([]),u(g),m(null);return}if(i==="help"){r([{kind:"output",text:"db_set KEY VALUE",tone:"info"},{kind:"output",text:"db_get KEY",tone:"info"},{kind:"output",text:"cat database",tone:"info"},{kind:"output",text:"clear · reset",tone:"info"}]);return}r([{kind:"output",text:`${i}: command not found (try help)`,tone:"warn"}])}function N(t){t.preventDefault(),k(b),v("")}function h(t){k(t)}return e.jsxs("div",{className:"sh",children:[e.jsxs("div",{className:"sh-pane",children:[e.jsxs("header",{className:"sh-head",children:[e.jsx("span",{className:"sh-dot sh-dot-r"}),e.jsx("span",{className:"sh-dot sh-dot-y"}),e.jsx("span",{className:"sh-dot sh-dot-g"}),e.jsx("span",{className:"sh-title",children:"~ / db.sh"})]}),e.jsx("div",{className:"sh-screen",ref:p,children:x.map((t,n)=>t.kind==="input"?e.jsxs("div",{className:"sh-line sh-input",children:[e.jsx("span",{className:"sh-prompt",children:"$"})," ",t.text]},n):e.jsx("div",{className:`sh-line sh-out ${t.tone?`sh-tone-${t.tone}`:""}`,children:t.text||" "},n))}),e.jsxs("form",{className:"sh-form",onSubmit:N,children:[e.jsx("span",{className:"sh-prompt",children:"$"}),e.jsx("input",{className:"sh-cmd",value:b,onChange:t=>v(t.target.value),placeholder:"db_set 42 cat",autoComplete:"off",spellCheck:!1})]}),e.jsxs("div",{className:"sh-quick",children:[e.jsx("button",{type:"button",className:"sh-chip",onClick:()=>h("db_set 42 cat"),children:"db_set 42 cat"}),e.jsx("button",{type:"button",className:"sh-chip",onClick:()=>h("db_set 42 dog"),children:"db_set 42 dog"}),e.jsx("button",{type:"button",className:"sh-chip",onClick:()=>h("db_get 42"),children:"db_get 42"}),e.jsx("button",{type:"button",className:"sh-chip",onClick:()=>h("cat database"),children:"cat database"}),e.jsx("button",{type:"button",className:"sh-chip",onClick:()=>h("reset"),children:"reset"})]})]}),e.jsxs("aside",{className:"sh-side",children:[e.jsxs("header",{className:"sh-side-head",children:[e.jsx("h4",{children:"database"}),e.jsxs("span",{children:[s.length," line",s.length===1?"":"s"]})]}),s.length===0?e.jsxs("p",{className:"sh-empty",children:["empty file. run ",e.jsx("code",{children:"db_set"})," to append a line."]}):e.jsx("ol",{className:"sh-log",children:s.map(t=>e.jsxs("li",{children:[e.jsx("span",{className:"sh-ln",children:t.n}),e.jsxs("span",{className:"sh-pair",children:[e.jsx("span",{className:"sh-k",children:t.key}),e.jsx("span",{className:"sh-comma",children:","}),e.jsx("span",{className:"sh-v",children:t.value})]})]},t.n))}),y!==null&&s.length>0&&e.jsxs("p",{className:"sh-meter",children:["last ",e.jsx("code",{children:"db_get"})," walked"," ",e.jsxs("strong",{children:[y,"/",s.length]})," ","line",s.length===1?"":"s","."]})]}),e.jsx(w,{})]})}function w(){return e.jsx("style",{children:`
      .sh {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 1rem;
        font-family: var(--mono);
        color: var(--fg);
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1rem;
        margin: 2rem 0;
      }
      @media (max-width: 720px) {
        .sh { grid-template-columns: 1fr; }
      }

      .sh-pane {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        min-height: 22rem;
      }
      .sh-head {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 0.75rem;
        border-bottom: 1px solid var(--bg2);
      }
      .sh-dot {
        width: 10px; height: 10px; border-radius: 50%;
        display: inline-block;
      }
      .sh-dot-r { background: var(--red); }
      .sh-dot-y { background: var(--yellow); }
      .sh-dot-g { background: var(--green); }
      .sh-title {
        margin-left: auto;
        font-size: 0.78rem;
        color: var(--gray);
        letter-spacing: 0.06em;
      }

      .sh-screen {
        flex: 1;
        padding: 0.75rem 0.85rem;
        overflow-y: auto;
        font-size: 0.85rem;
        line-height: 1.55;
        max-height: 22rem;
      }
      .sh-line { white-space: pre-wrap; word-break: break-word; }
      .sh-input { color: var(--fg-dim); }
      .sh-prompt { color: var(--green); margin-right: 0.4em; }
      .sh-out { color: var(--fg-soft); }
      .sh-tone-ok { color: var(--aqua); }
      .sh-tone-warn { color: var(--orange); }
      .sh-tone-info { color: var(--gray); font-style: italic; }

      .sh-form {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.85rem;
        border-top: 1px solid var(--bg2);
      }
      .sh-cmd {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--fg);
        font-family: var(--mono);
        font-size: 0.9rem;
        padding: 0.2rem 0;
      }
      .sh-cmd::placeholder { color: var(--bg3); }

      .sh-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        padding: 0 0.6rem 0.6rem;
      }
      .sh-chip {
        background: var(--bg);
        color: var(--fg-soft);
        border: 1px solid var(--bg2);
        border-radius: 999px;
        padding: 0.22rem 0.65rem;
        font-family: var(--mono);
        font-size: 0.75rem;
        cursor: pointer;
        transition: color 100ms, border-color 100ms;
      }
      .sh-chip:hover { color: var(--yellow); border-color: var(--yellow); }

      .sh-side {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.85rem 0.95rem;
        display: flex;
        flex-direction: column;
        min-height: 22rem;
      }
      .sh-side-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.55rem;
      }
      .sh-side-head h4 {
        margin: 0;
        font-size: 0.82rem;
        color: var(--yellow);
        letter-spacing: 0.05em;
      }
      .sh-side-head span {
        font-size: 0.72rem;
        color: var(--gray);
      }

      .sh-empty {
        color: var(--gray); font-style: italic; margin: 0;
        font-size: 0.85rem;
      }
      .sh-log {
        list-style: none; padding: 0; margin: 0;
        font-size: 0.85rem;
        flex: 1;
        overflow-y: auto;
        max-height: 18rem;
      }
      .sh-log li {
        display: flex;
        gap: 0.6rem;
        align-items: baseline;
        padding: 0.18rem 0;
        border-bottom: 1px dashed var(--bg2);
      }
      .sh-ln {
        color: var(--gray);
        font-size: 0.72rem;
        min-width: 1.6em;
        text-align: right;
      }
      .sh-pair { color: var(--fg); }
      .sh-k { color: var(--blue); }
      .sh-comma { color: var(--gray); margin: 0 0.15em; }
      .sh-v { color: var(--fg); }

      .sh-meter {
        margin: 0.6rem 0 0;
        padding-top: 0.6rem;
        border-top: 1px solid var(--bg2);
        color: var(--fg-soft);
        font-size: 0.78rem;
      }
      .sh-meter strong { color: var(--orange); font-weight: 600; }
      .sh-meter code {
        background: var(--bg-soft);
        color: var(--aqua);
        padding: 0.05em 0.35em;
        border-radius: 3px;
        font-size: 0.85em;
      }
    `})}export{z as default};
