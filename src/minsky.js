export const empty = 0;
export const halt_node = undefined;

export class RegisterMachine {
        constructor(nodes) {
                this.nodes = nodes || {};
                this.registers = {};
                this.links = [];
                this.initNodes();
        }

        initNodes() {
                // each node's transition can be assigned a label, and in this loop
                // that label is converted into a node
                for (let label in this.nodes) {
                        // Getting the node from the label
                        let node = this.nodes[label];
                        // Each node's environment is the shared set of
                        // registers
                        node.registers = this.registers;
                        // If a node is Plus Node, it will have only one transition state
                        if (node instanceof PlusNode) {
                                if (node.on_increment !== halt_node) {
                                        this.checkNode(node.on_increment);
                                        node.on_increment = this.nodes[node.on_increment];
                                }
                        }
                        // There are two possible transitions for a MinusNode
                        // either one may be a halt node or a distinct node
                        else if (node instanceof MinusNode) {
                                if (node.on_decrement !== halt_node) {
                                        this.checkNode(node.on_decrement);
                                        node.on_decrement = this.nodes[node.on_decrement];
                                }

                                if (node.on_empty !== halt_node) {
                                        this.checkNode(node.on_empty);
                                        node.on_empty = this.nodes[node.on_empty];
                                }
                        }

                        else {
                                throw new Error(`invalid node type: ${node.constructor.name}`);
                        }
                }

                this.start = this.nodes["start"];
        }

        setStart(node) {
                this.checkNode(node);
                this.start = this.nodes[node];
        }

        // Check that the node referenced as a transition node exists
        checkNode(node) {
                if (!this.nodes.hasOwnProperty(node)) {
                        throw new Error(`register machine does not have node named: ${node}`);
                }
        }

        run() {
                // Put the value of the starting node in the register
                this.start.updateRegister();
                // Apply the function to the current node, which will
                // return a node, and have an effect on the value of the
                // current node.  This cycle repeats until a halt node is
                // reached.
                let new_node = this.start.func();
                while (new_node !== halt_node) {
                        new_node = new_node.func();
                }
        }
}

const decrement = function () {
        if (this.val === empty) {
                // If there is a node associated with the empty arrow,
                // put the value of its register in that node
                if (this.on_empty !== halt_node) {
                        return this.on_empty.updateNode();
                } else {
                        return halt_node;
                }
        } else {
                this.val -= 1;
                this.updateRegister();
                // If there is a node associated with the decrement arrow,
                // put the value of its register in that node
                if (this.on_decrement !== halt_node) {
                        return this.on_decrement.updateNode();
                } else {
                        return halt_node;
                }
        }
};

const increment = function () {
        this.val += 1;
        this.updateRegister();
        // If there is a node associated with the increment arrow,
        // put the value of its register in that node
        if (this.on_increment !== halt_node) {
                return this.on_increment.updateNode();
        } else {
                return halt_node;
        }
};

// This assigns the value of the node to the register it is associated with
const updateRegister = function () {
        this.registers[this.register] = this.val;
};

// This assigns the value of the register associated with the node to it
const updateNode = function () {
        if (this.val === undefined) {
                this.val = this.registers[this.register];
        }
        return this;
};

export class MinusNode {
        constructor({val = undefined, register = undefined, on_decrement = undefined, on_empty = undefined} = {}) {
                if (val < empty) {
                        throw new Error(`val must be greater than or equal to ${empty}`)
                }
                this.register = register;
                this.registers = undefined;
                this.val = val;
                this.on_decrement = on_decrement;
                this.func = decrement;
                this.on_empty = on_empty;
                this.updateRegister = updateRegister;
                this.updateNode = updateNode;
        }
}

export class PlusNode {
        constructor({val = undefined, register = undefined, on_increment = undefined} = {}) {
                if (val < empty) {
                        throw new Error(`val in PlusNode must be greater than or equal to ${empty}`)
                }
                this.register = register;
                this.registers = undefined;
                this.val = val;
                this.on_increment = on_increment;
                this.func = increment;
                this.updateRegister = updateRegister;
                this.updateNode = updateNode;
        }
}

