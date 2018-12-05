"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const empty=0,halt_node=void 0;class RegisterMachine{constructor(e){this.nodes=e||{},this.registers={},this.initNodes()}initNodes(){for(let e in this.nodes){let t=this.nodes[e];if(t.registers=this.registers,t instanceof PlusNode)t.on_increment!==halt_node&&this.checkNode(t.on_increment),t.on_increment=this.nodes[t.on_increment];else{if(!(t instanceof MinusNode))throw new Error(`invalid node type: ${t.constructor.name}`);t.on_decrement!==halt_node&&(this.checkNode(t.on_decrement),t.on_decrement=this.nodes[t.on_decrement]),t.on_empty!==halt_node&&(this.checkNode(t.on_empty),t.on_empty=this.nodes[t.on_empty])}}this.start=this.nodes.start}checkNode(e){if(!this.nodes.hasOwnProperty(e))throw new Error(`register machine does not have node named: ${e}`)}run(){this.start.updateRegister();let e=this.start.func();for(;e!==halt_node;)e=e.func()}}const decrement=function(){return this.val===empty?this.on_empty!==halt_node?this.on_empty.updateNode():halt_node:(this.val-=1,this.updateRegister(),this.on_decrement!==halt_node?this.on_decrement.updateNode():halt_node)},increment=function(){return this.val+=1,this.updateRegister(),this.on_increment!==halt_node?this.on_increment.updateNode():halt_node},updateRegister=function(){this.registers[this.register]=this.val},updateNode=function(){return void 0===this.val&&(this.val=this.registers[this.register]),this};class MinusNode{constructor({val:e,register:t,on_decrement:s,on_empty:n}={}){if(e<empty)throw new Error(`val must be greater than or equal to ${empty}`);this.register=t,this.registers=void 0,this.val=e,this.on_decrement=s,this.func=decrement,this.on_empty=n,this.updateRegister=updateRegister,this.updateNode=updateNode}}class PlusNode{constructor({val:e,register:t,on_increment:s}={}){if(e<empty)throw new Error(`val in PlusNode must be greater than or equal to ${empty}`);this.register=t,this.registers=void 0,this.val=e,this.on_increment=s,this.func=increment,this.updateRegister=updateRegister,this.updateNode=updateNode}}exports.empty=empty,exports.halt_node=halt_node,exports.RegisterMachine=RegisterMachine,exports.MinusNode=MinusNode,exports.PlusNode=PlusNode;
