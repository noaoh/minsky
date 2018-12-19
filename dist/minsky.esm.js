const{List:List,Map:Map,Record:Record}=require("immutable"),empty=0,halt_node=void 0,haltNode=null,linkType={EMP:"empty",INC:"increment",DEC:"decrement"};class RegisterMachine extends(Record({nodes:Map(),registers:Map(),links:Map(),states:List(),currNode:haltNode})){addNode(e,t){if(t instanceof PlusNode){return this.withMutations(function(n){n.setIn(["nodes",e],t),n.setIn(["links",e,linkType.INC],haltNode),n.setIn(["registers",t.get("register")],null)})}if(t instanceof MinusNode){return this.withMutations(function(n){n.setIn(["nodes",e],t),n.setIn(["links",e,linkType.EMP],haltNode),n.setIn(["links",e,linkType.DEC],haltNode),n.setIn(["registers",t.get("register")],null)})}throw new Error(`invalid node type: ${t.constructor.name}`)}addLink(e,t,n){let s=!1;for(let t in linkType)if(linkType[t]===e){s=!0;break}if(!s)throw new Error(`invalid transition type: ${e.constructor.name}`);return this.checkNode(t),this.checkNode(n),this.setIn(["links",t,e],n)}checkNode(e){if(!this.nodes.has(e))throw new Error(`register machine does not have node named: ${e}`)}saveState(){return this.update("states",e=>e.push(this.remove("states")))}updateNode(e){const t=this.getIn(["nodes",e,"register"]);if(null===this.getIn(["nodes",e,"value"])){const n=this.getIn(["registers",t]);return this.setIn(["nodes",e,"value"],n)}return this}increment(e){if(this.checkNode(e),!(this.getIn(["nodes",e])instanceof PlusNode))throw new Error(`node can not be incremented: ${e}`);return this.saveState().withMutations(function(t){t.updateNode(e),t.updateIn(["nodes",e,"value"],e=>e+1);const n=t.getIn(["nodes",e,"value"]),s=t.getIn(["nodes",e,"register"]);t.setIn(["registers",s],n);const r=t.getIn(["links",e,linkType.INC]);t.set("currNode",r)})}decrement(e){if(this.checkNode(e),!(this.getIn(["nodes",e])instanceof MinusNode))throw new Error(`node can not be decremented: ${e}`);const t=this.saveState().withMutations(function(t){t.updateNode(e)});return t.getIn(["nodes",e])===empty?t.withMutations(function(t){const n=t.getIn(["nodes",e,linkType.EMP]);t.set("currNode",n)}):t.withMutations(function(t){t.updateIn(["nodes",e,"value"],e=>e-1);const n=t.getIn(["nodes",e,"register"]),s=t.getIn(["nodes",e,"value"]);t.setIn(["registers",n],s);const r=t.getIn(["nodes",e,linkType.DEC]);t.set("currNode",r)})}setStart(e){return this.checkNode(e),this.set("currNode",e)}setTime(e){const t=this.get("states").size(e+1);return this.getIn(["states",e]).set("states",t)}prevStep(){const e=this.get("states").size-2;return this.setTime(e)}nextStep(){const e=this.get("currNode"),t=this.getIn(["nodes",e]);return t===haltNode?this:t instanceof PlusNode?this.increment(e):t instanceof MinusNode?this.decrement(e):void 0}run(){let e=this;for(;e.currNode!==haltNode;)e=e.nextStep();return e.get("registers")}}class PlusNode extends(Record({value:null,register:null})){constructor({value:e,register:t}={}){if(e<empty)throw new Error("value in PlusNode must be greater than or equal to 0");super({value:e,register:t})}}class MinusNode extends(Record({value:null,register:null})){constructor({value:e,register:t}={}){if(e<empty)throw new Error("value in MinusNode must be greater than or equal to 0");super({value:e,register:t})}}export{empty,halt_node,haltNode,linkType,RegisterMachine,PlusNode,MinusNode};
