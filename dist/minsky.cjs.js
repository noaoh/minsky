"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const{List:List,Map:Map,Record:Record}=require("immutable"),empty=0,halt_node=void 0,haltNode=null,linkType={EMP:"empty",INC:"increment",DEC:"decrement"};class RegisterMachine extends(Record({nodes:Map(),registers:Map(),links:Map(),states:List(),currNode:haltNode})){addNode(e,t){if(t instanceof PlusNode)return this.withMutations(function(s){s.setIn(["nodes",e],t),s.setIn(["links",e,linkType.INC],haltNode),s.setIn(["registers",t.get("register")],null)});if(t instanceof MinusNode)return this.withMutations(function(s){s.setIn(["nodes",e],t),s.setIn(["links",e,linkType.EMP],haltNode),s.setIn(["links",e,linkType.DEC],haltNode),s.setIn(["registers",t.get("register")],null)});throw new Error(`invalid node type: ${t.constructor.name}`)}addLink(e,t,s){return this.checkLink(e),this.checkNode(t),this.checkNode(s),this.setIn(["links",t,e],s)}checkLink(e){for(let t in linkType)if(linkType[t]===e)return;throw new Error(`invalid link type: ${e}`)}checkNode(e){if(!this.nodes.has(e))throw new Error(`register machine does not have node named: ${e}`)}saveState(){return this.update("states",e=>e.push(this.remove("states")))}updateNode(e){const t=this.getIn(["nodes",e,"register"]);if(null===this.getIn(["nodes",e,"value"])){const s=this.getIn(["registers",t]);return this.setIn(["nodes",e,"value"],s)}return this}updateRegister(e){const t=this.getIn(["nodes",e,"value"]),s=this.getIn(["nodes",e,"register"]);return this.setIn(["registers",s],t)}increment(e){if(this.checkNode(e),!(this.getIn(["nodes",e])instanceof PlusNode))throw new Error(`node can not be incremented: ${e}`);return this.saveState().withMutations(function(t){t.updateNode(e),t.updateIn(["nodes",e,"value"],e=>e+1),t.updateRegister(e);const s=t.getIn(["links",e,linkType.INC]);t.set("currNode",s)})}decrement(e){if(this.checkNode(e),!(this.getIn(["nodes",e])instanceof MinusNode))throw new Error(`node can not be decremented: ${e}`);const t=this.saveState().withMutations(function(t){t.updateNode(e)});return t.getIn(["nodes",e,"value"])===empty?t.withMutations(function(t){t.updateRegister(e);const s=t.getIn(["links",e,linkType.EMP]);t.set("currNode",s)}):t.withMutations(function(t){t.updateIn(["nodes",e,"value"],e=>e-1),t.updateRegister(e);const s=t.getIn(["links",e,linkType.DEC]);t.set("currNode",s)})}setStart(e){return this.checkNode(e),this.set("currNode",e)}setTime(e){const t=this.get("states").size(e+1);return this.getIn(["states",e]).set("states",t)}prevStep(){const e=this.get("states").size-2;return this.setTime(e)}nextStep(){const e=this.get("currNode"),t=this.getIn(["nodes",e]);return t===haltNode?this:t instanceof PlusNode?this.increment(e):t instanceof MinusNode?this.decrement(e):void 0}run(){let e=this;for(;e.currNode!==haltNode;)e=e.nextStep();return e.get("registers")}}class PlusNode extends(Record({value:null,register:null})){constructor({value:e,register:t}={}){if(e<empty)throw new Error("value in PlusNode must be greater than or equal to 0");super({value:e,register:t})}}class MinusNode extends(Record({value:null,register:null})){constructor({value:e,register:t}={}){if(e<empty)throw new Error("value in MinusNode must be greater than or equal to 0");super({value:e,register:t})}}exports.empty=empty,exports.halt_node=void 0,exports.haltNode=haltNode,exports.linkType=linkType,exports.RegisterMachine=RegisterMachine,exports.PlusNode=PlusNode,exports.MinusNode=MinusNode;
