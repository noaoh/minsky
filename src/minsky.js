const {List, Map, Record} = require("immutable");

export const empty = 0;
export const halt_node = undefined;
export const haltNode = null;
export const linkType = {EMP: 'empty', INC: 'increment', DEC: 'decrement'};

export class RegisterMachine extends Record({
    nodes: Map(),
    registers: Map(),
    links: Map(),
    states: List(),
    currNode: haltNode
}) {

    addNode(label, node) {
        if (node instanceof PlusNode) {
            return this.withMutations(function (rm) {
                rm.setIn(['nodes', label], node);
                rm.setIn(['links', label, linkType.INC], haltNode);
                rm.setIn(['registers', node.get("register")], null);
            })
        } else if (node instanceof MinusNode) {
            return this.withMutations(function (rm) {
                rm.setIn(['nodes', label], node);
                rm.setIn(['links', label, linkType.EMP], haltNode);
                rm.setIn(['links', label, linkType.DEC], haltNode);
                rm.setIn(['registers', node.get("register")], null);
            })
        } else {
            throw new Error(`invalid node type: ${node.constructor.name}`);
        }
    }

    addLink(type, from, to) {
        let success = false;
        for (let k in linkType) {
            if (linkType[k] === type) {
                success = true;
                break;
            }
        }

        if (!success) {
            throw new Error(`invalid transition type: ${type.constructor.name}`);
        }
        this.checkNode(from);
        this.checkNode(to);
        return this.setIn(['links', from, type], to);
    }

    checkNode(label) {
        if (!this.nodes.has(label)) {
            throw new Error(`register machine does not have node named: ${label}`);
        }
    }

    saveState() {
        // save the current state of the register machine, without the
        // states array to avoid a circular reference
        return this.update('states', states => states.push(this.remove('states')));
    }

    updateNode(label) {
        const nodeReg = this.getIn(["nodes", label, "register"]);
        if (this.getIn(["nodes", label, "val"]) === undefined) {
            const regVal = this.getIn(["registers", nodeReg]);
            this.setIn(["nodes", label, "val"], regVal);
        } else {
            return this;
        }
    }

    increment(label) {
        this.checkNode(label);
        const realNode = this.getIn(["nodes", label]);
        if (!(realNode instanceof PlusNode)) {
            throw new Error(`node can not be incremented: ${label}`);
        }

        const oldState = this.saveState();
        const newState = oldState.withMutations(function (rm) {
            // need to break this down a bit
            rm.updateNode(label);
            rm.updateIn(["nodes", label, "val"], x => x + 1);
            const newVal = rm.getIn(["nodes", label, "val"]);
            const nodeReg = rm.getIn(["nodes", label, "register"]);
            rm.setIn(['registers', nodeReg], newVal);
            const nextNode = rm.getIn(["links", label, linkType.INC]);
            rm.set("currNode", nextNode);
        });

        return newState;
    };

    decrement(label) {
        this.checkNode(label);
        const realNode = this.getIn(["nodes", label]);
        if (!(realNode instanceof MinusNode)) {
            throw new Error(`node can not be decremented: ${label}`);
        }

        const oldState = this.saveState();
        const middleState = oldState.withMutations(function (rm) {
            rm.updateNode(label);
        });
        const nodeVal = middleState.getIn(["nodes", label]);

        if (nodeVal === empty) {
            return middleState.withMutations(function (rm) {
                const nextNode = rm.getIn(["nodes", label, linkType.EMP]);
                rm.set("currNode", nextNode);
            });
        } else {
            return middleState.withMutations(function (rm) {
                rm.updateIn(["nodes", label, "val"], x => x - 1);
                const nodeReg = rm.getIn(["nodes", label, "register"]);
                const newVal = rm.getIn(["nodes", label, "val"]);
                rm.setIn(["registers", nodeReg], newVal);
                const nextNode = rm.getIn(["nodes", label, linkType.DEC]);
                rm.set("currNode", nextNode);
            });
        }
    }

    setStart(label) {
        this.checkNode(label);
        return this.set("currNode", label);
    }

    setTime(t) {
        const states = this.get("states").size(t + 1);
        const restoreState = this.getIn(["states", t]);
        return restoreState.set("states", states);
    }

    prevStep() {
        const prevState = this.get("states").size - 2;
        return this.setTime(prevState);
    }

    nextStep() {
        const label = this.get("currNode");
        const realNode = this.getIn(["nodes", label]);
        if (realNode === haltNode) {
            return this;
        } else if (realNode instanceof PlusNode) {
            return this.increment(label);
        } else if (realNode instanceof MinusNode) {
            return this.decrement(label);
        }
    }

    run() {
        let state = this;
        while (state.currNode !== haltNode) {
            state = state.nextStep();
        }
        return state.get("registers");
    }
}

export class PlusNode extends Record({val: null, register: null}) {
    constructor(val, register) {
        if (val < empty) {
            throw new Error("val in MinusNode must be greater than or equal to 0");
        }
        super({val: val, register: register});
    }
}

export class MinusNode extends Record({val: null, register: null}) {
    constructor(val, register) {
        if (val < empty) {
            throw new Error("val in MinusNode must be greater than or equal to 0");
        }
        super({val: val, register: register});
    }
}

