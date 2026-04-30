import{j as o}from"./jsx-runtime.TBa3i5EZ.js";import{r as p}from"./index.CVf8TyFT.js";let F=0;function C(r=[],c=[]){return{id:++F,keys:r,children:c}}function M(r){return r.children.length===0}function Q(r){return{id:r.id,keys:r.keys.slice(),children:r.children.slice()}}function R(r,c){return r.localeCompare(c)}function P(r,c){const n=Math.floor(r.keys.length/2),e=r.keys[n],l=r.keys.slice(0,n),f=r.keys.slice(n+1);let h=[],s=[];return M(r)||(h=r.children.slice(0,n+1),s=r.children.slice(n+1)),{left:{id:r.id,keys:l,children:h},promoted:e,right:C(f,s)}}function T(r,c,n){const e=Q(r);if(e.keys.includes(c))return{node:e,split:null};if(M(e)){const h=[...e.keys,c].sort(R);if(e.keys=h,e.keys.length>n){const{left:s,promoted:i,right:d}=P(e);return{node:s,split:{promoted:i,right:d}}}return{node:e,split:null}}let l=0;for(;l<e.keys.length&&R(c,e.keys[l])>0;)l++;const f=T(e.children[l],c,n);if(e.children=e.children.slice(),e.children[l]=f.node,f.split){const h=e.keys.slice();h.splice(l,0,f.split.promoted);const s=e.children.slice();if(s.splice(l+1,0,f.split.right),e.keys=h,e.children=s,e.keys.length>n){const{left:i,promoted:d,right:u}=P(e);return{node:i,split:{promoted:d,right:u}}}}return{node:e,split:null}}function L(r,c,n){const{node:e,split:l}=T(r,c,n);return l?C([l.promoted],[e,l.right]):e}function V(r,c){const n=[];let e=r;for(;e;){if(n.push(e.id),e.keys.includes(c))return{path:n,found:!0};if(M(e))return{path:n,found:!1};let l=0;for(;l<e.keys.length&&R(c,e.keys[l])>0;)l++;e=e.children[l]}return{path:n,found:!1}}const S=52,x=28,m=6,X=64,W=18;function K(r){return Math.max(S,r.keys.length*S)+m*2}function J(r){const c=new Map,n=new Map;function e(s){if(M(s))return n.set(s.id,K(s)),K(s);let i=0;for(let u=0;u<s.children.length;u++)i+=e(s.children[u]),u<s.children.length-1&&(i+=W);const d=Math.max(K(s),i);return n.set(s.id,d),d}function l(s,i,d){const u=K(s),w=n.get(s.id)??u,E=d*(x+2*m+X);if(M(s)){const y=i+w/2;c.set(s.id,{x:y-u/2,y:E,w:u});return}let j=i;const v=[];for(const y of s.children){const g=n.get(y.id)??K(y);l(y,j,d+1),v.push(j+g/2),j+=g+W}const q=(v[0]+v[v.length-1])/2;c.set(s.id,{x:q-u/2,y:E,w:u})}e(r),l(r,0,0);let f=0,h=0;for(const{x:s,y:i,w:d}of c.values())s+d>f&&(f=s+d),i+x+2*m>h&&(h=i+x+2*m);return{positions:c,width:f,height:h}}function te(){const[r,c]=p.useState(3),[n,e]=p.useState(()=>C([])),[l,f]=p.useState(""),[h,s]=p.useState(""),[i,d]=p.useState(null),[u,w]=p.useState([]),E=p.useRef(null);function j(t){const a=l.trim();if(!a)return;const b=L(n,a,r);e(b),u.includes(a)||w([...u,a]),d(null),f("")}function v(t){const a=h.trim();if(!a)return;const b=V(n,a);d({kind:"search",key:a,path:b.path,found:b.found}),s("")}function q(){e(C([])),w([]),d(null)}function y(){let t=C([]);const a=["10","20","5","6","12","30","7","17","25","3","15"];for(const b of a)t=L(t,b,r);e(t),w(a),d(null)}const g=p.useMemo(()=>J(n),[n]),D=p.useMemo(()=>new Set(i?.path??[]),[i]),B=i?.found?i.path[i.path.length-1]:void 0;function A(t){return[t,...t.children.flatMap(A)]}const _=p.useMemo(()=>A(n),[n]);function G(){const t=[];function a(b){const N=g.positions.get(b.id);if(!N)return;const I=N.x+N.w/2,z=N.y+x+2*m;for(const k of b.children){const $=g.positions.get(k.id);if(!$)continue;const H=$.x+$.w/2,O=$.y;t.push({x1:I,y1:z,x2:H,y2:O,on:D.has(b.id)&&D.has(k.id)}),a(k)}}return a(n),t}return o.jsxs("div",{className:"bt",children:[o.jsxs("div",{className:"bt-controls",children:[o.jsxs("div",{className:"bt-row",children:[o.jsx("input",{className:"bt-input",placeholder:"key (e.g. 10)",value:l,onChange:t=>f(t.target.value),onKeyDown:t=>t.key==="Enter"&&j()}),o.jsx("button",{className:"bt-btn bt-btn-primary",onClick:()=>j(),children:"insert"})]}),o.jsxs("div",{className:"bt-row",children:[o.jsx("input",{className:"bt-input",placeholder:"search key",value:h,onChange:t=>s(t.target.value),onKeyDown:t=>t.key==="Enter"&&v()}),o.jsx("button",{className:"bt-btn",onClick:()=>v(),children:"search"}),o.jsx("button",{className:"bt-btn",onClick:y,children:"seed"}),o.jsx("button",{className:"bt-btn bt-btn-warn",onClick:q,children:"reset"})]}),o.jsxs("div",{className:"bt-row bt-order",children:[o.jsx("span",{className:"bt-order-label",children:"max keys per node:"}),[2,3,4].map(t=>o.jsx("button",{className:`bt-pill ${r===t?"active":""}`,onClick:()=>{c(t),e(C([])),w([]),d(null)},children:t},t)),o.jsx("span",{className:"bt-order-hint",children:"smaller = splits sooner"})]})]}),o.jsx("div",{className:"bt-viewport",ref:E,children:u.length===0?o.jsx("p",{className:"bt-empty",children:"empty tree. insert a few keys, or click seed."}):o.jsxs("svg",{className:"bt-svg",viewBox:`-12 -8 ${g.width+24} ${g.height+16}`,width:g.width+24,height:g.height+16,children:[G().map((t,a)=>o.jsx("line",{x1:t.x1,y1:t.y1,x2:t.x2,y2:t.y2,className:`bt-edge ${t.on?"on":""}`},a)),_.map(t=>{const a=g.positions.get(t.id);if(!a)return null;const b=D.has(t.id),N=t.id===B;return o.jsxs("g",{transform:`translate(${a.x}, ${a.y})`,children:[o.jsx("rect",{width:a.w,height:x+2*m,rx:4,className:`bt-node ${b?"on":""} ${N?"found":""}`}),t.keys.map((I,z)=>{const k=m+z*S+Math.max(0,(a.w-2*m-t.keys.length*S)/2);return o.jsxs("g",{children:[z>0&&o.jsx("line",{x1:k,y1:m+4,x2:k,y2:m+x-4,className:"bt-sep"}),o.jsx("text",{x:k+S/2,y:m+x/2+4,textAnchor:"middle",className:"bt-key-text",children:I})]},z)}),t.keys.length===0&&o.jsx("text",{x:a.w/2,y:m+x/2+4,textAnchor:"middle",className:"bt-empty-text",children:"∅"})]},t.id)})]})}),i&&o.jsxs("div",{className:`bt-trace ${i.found?"ok":"no"}`,children:[o.jsxs("strong",{children:['search "',i.key,'"']}),": walked ",i.path.length," node",i.path.length===1?"":"s"," →"," ",i.found?o.jsx("span",{className:"bt-verdict ok",children:"found"}):o.jsx("span",{className:"bt-verdict no",children:"not found"})]}),o.jsxs("div",{className:"bt-foot",children:[o.jsxs("span",{children:["height: ",Y(n)]}),o.jsxs("span",{children:["keys: ",u.length]}),o.jsxs("span",{children:["nodes: ",_.length]})]}),o.jsx(U,{})]})}function Y(r){return r.keys.length===0?0:M(r)?1:1+Math.max(...r.children.map(Y))}function U(){return o.jsx("style",{children:`
      .bt {
        font-family: var(--mono);
        font-size: 0.92rem;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1.25rem;
        margin: 2rem 0;
        color: var(--fg);
      }
      .bt-controls { display: flex; flex-direction: column; gap: 0.55rem; }
      .bt-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
      .bt-input {
        flex: 1 1 8rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        color: var(--fg);
        padding: 0.45rem 0.7rem;
        border-radius: 4px;
        font-family: var(--mono);
        font-size: 0.9rem;
      }
      .bt-input:focus { outline: 1px solid var(--aqua); border-color: var(--aqua); }
      .bt-btn {
        background: var(--bg); color: var(--fg-dim);
        border: 1px solid var(--bg2);
        padding: 0.45rem 0.85rem; border-radius: 4px;
        cursor: pointer; font-family: var(--mono); font-size: 0.85rem;
        transition: background 100ms, color 100ms, border-color 100ms;
      }
      .bt-btn:hover { background: var(--bg2); color: var(--yellow); border-color: var(--yellow); }
      .bt-btn-primary { color: var(--green); border-color: color-mix(in srgb, var(--green) 50%, transparent); }
      .bt-btn-primary:hover { color: var(--bg); background: var(--green); border-color: var(--green); }
      .bt-btn-warn { color: var(--orange); border-color: color-mix(in srgb, var(--orange) 50%, transparent); }
      .bt-btn-warn:hover { color: var(--bg); background: var(--orange); border-color: var(--orange); }

      .bt-order-label { color: var(--gray); font-size: 0.78rem; }
      .bt-pill {
        background: var(--bg); color: var(--fg-soft);
        border: 1px solid var(--bg2); border-radius: 999px;
        padding: 0.22rem 0.7rem; font-family: var(--mono); font-size: 0.78rem;
        cursor: pointer; transition: color 100ms, border-color 100ms, background 100ms;
      }
      .bt-pill:hover { color: var(--yellow); border-color: var(--yellow); }
      .bt-pill.active { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .bt-order-hint { color: var(--gray); font-size: 0.74rem; font-style: italic; margin-left: 0.4rem; }

      .bt-viewport {
        margin-top: 1rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 1rem;
        overflow-x: auto;
        min-height: 8rem;
      }
      .bt-empty {
        color: var(--gray); font-style: italic; margin: 0;
        font-size: 0.85rem; text-align: center; padding: 1.5rem 0;
      }
      .bt-svg { display: block; margin: 0 auto; }

      .bt-node {
        fill: var(--bg-soft);
        stroke: var(--bg3);
        stroke-width: 1;
        transition: fill 150ms, stroke 150ms;
      }
      .bt-node.on {
        stroke: var(--aqua);
        stroke-width: 2;
        fill: color-mix(in srgb, var(--aqua) 14%, var(--bg-soft));
      }
      .bt-node.found {
        stroke: var(--green);
        stroke-width: 2;
        fill: color-mix(in srgb, var(--green) 22%, var(--bg-soft));
      }
      .bt-key-text {
        fill: var(--fg);
        font-family: var(--mono);
        font-size: 13px;
      }
      .bt-empty-text {
        fill: var(--gray);
        font-family: var(--mono);
        font-size: 14px;
      }
      .bt-sep {
        stroke: var(--bg3);
        stroke-width: 1;
      }
      .bt-edge {
        stroke: var(--bg3);
        stroke-width: 1;
        fill: none;
      }
      .bt-edge.on {
        stroke: var(--aqua);
        stroke-width: 2;
      }

      .bt-trace {
        margin-top: 0.7rem;
        background: var(--bg);
        border: 1px dashed var(--bg2);
        border-radius: 4px;
        padding: 0.55rem 0.85rem;
        color: var(--fg-soft);
        font-size: 0.85rem;
      }
      .bt-trace strong { color: var(--yellow); font-weight: 600; }
      .bt-verdict.ok { color: var(--green); font-weight: 600; }
      .bt-verdict.no { color: var(--red); font-weight: 600; }

      .bt-foot {
        margin-top: 0.55rem;
        display: flex;
        gap: 1rem;
        font-size: 0.74rem;
        color: var(--gray);
        font-family: var(--mono);
        letter-spacing: 0.06em;
      }
    `})}export{te as default};
