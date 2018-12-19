const { RegisterMachine, PlusNode, MinusNode, linkType} = require('../dist/minsky.cjs.js');
const test = require('tape');

test("\ninvalid node type", function (t) {
    const err_func = function (node) {
        return `invalid node type: ${node}`
    };

    const throw_func = function() {
        return new RegisterMachine()
            .addNode("start", new RegisterMachine());
    };

    t.throws(throw_func, err_func("RegisterMachine"));

    t.end();
});

test("\nno node named", function (t) {
    const err_func = function (node) {
        return `register machine does not have node named: ${node}`
    };

    const throw_func = function() {
        return new RegisterMachine()
            .addNode("start", new PlusNode())
            .addLink(linkType.INC, "start", "b");
    };

    t.throws(throw_func, err_func("b"));

    t.end();
});

test("\nvalue must be greater than", function (t) {
    const plus_func = function (node) {
        return "value in PlusNode must be greater than or equal to 0";
    };

    const minus_func = function (node) {
        return "value in MinusNode must be greater than or equal to 0";
    };

    const throw_plus_func = function() {
        return new PlusNode({"value": -1})
    };

    const throw_minus_func = function() {
            return new MinusNode({"value": -1})
    };

    t.throws(throw_plus_func, plus_func(-1));

    t.throws(throw_minus_func, minus_func(-1));

    t.end();
});

test('\nincrement', function (t) {
    const inputs = [0, 1, 2];
    const outputs = [1, 2, 3];
    const increment = function (x) {
        let increment_machine = new RegisterMachine()
            .addNode("start", new PlusNode({register: "A", value: x}))
            .setStart("start");
        const regs = increment_machine.run();
        return regs.get("A");
    };

    for (const i in inputs) {
        const inp = inputs[i];
        const out = outputs[i];
        t.test(`increment case ${i}`, function (t) {
            t.equal(increment(inp), out);
            t.end();
        })
    }
    t.end();
});

test('\ndecrement', function (t) {
    const inputs = [1, 2, 3];
    const outputs = [0, 1, 2];
    const decrement = function (x) {
        let decrement_machine = new RegisterMachine()
            .addNode("start", new MinusNode({register: "A", value: x}))
            .setStart("start");
        return decrement_machine.run().get("A");
    };

    for (const i in inputs) {
        const inp = inputs[i];
        const out = outputs[i];
        t.test(`decrement case ${i}`, function (t) {
            t.equal(decrement(inp), out);
            t.end();
        })
    }
});

test('\nnot zero', function (t) {
    const inputs = [0, 1, 2];
    const outputs = [0, 1, 1];
    const not_zero = function (x) {
        let not_zero_machine = new RegisterMachine()
            .addNode("start", new MinusNode({register: "A", value: x}))
            .addNode("A1", new MinusNode({register: "A"}))
            .addNode("A2", new PlusNode({register: "A"}))
            .addLink(linkType.DEC, "start", "A1")
            .addLink(linkType.DEC, "A1", "A1")
            .addLink(linkType.EMP, "A1", "A2")
            .setStart("start");
        return not_zero_machine.run().get("A");
    };

    for (const i in inputs) {
        const inp = inputs[i];
        const out = outputs[i];
        t.test(`not zero case ${i}`, function (t) {
            t.equal(not_zero(inp), out);
            t.end();
        })
    }
    t.end();
});

test('\nis zero', function (t) {
    const inputs = [0, 1, 2];
    const outputs = [1, 0, 0];
    const is_zero = function (x) {
        const is_zero_machine = new RegisterMachine()
            .addNode("start", new MinusNode({register: "A", value: x}))
            .addNode("A1", new PlusNode({register: "A"}))
            .addNode("A2", new MinusNode({register: "A"}))
            .addLink(linkType.EMP, "start", "A1")
            .addLink(linkType.DEC, "start", "A2")
            .addLink(linkType.DEC, "A2", "A2")
            .setStart("start");
        return is_zero_machine.run().get("A");
    };

    for (const i in inputs) {
        const inp = inputs[i];
        const out = outputs[i];
        t.test(`is zero case ${i}`, function (t) {
            t.equal(is_zero(inp), out);
            t.end();
        })
    }
    t.end();
});

test('\ndouble adder', function (t) {
    const inputs = [{"x": 2, "y": 2}, {"x": 10, "y": 100}, {"x": 100, "y": 100}, {"x": 100, "y": 10}];
    const outputs = [[2, 2, 4], [10, 100, 110], [100, 100, 200], [100, 10, 110]];
    const double_adder = function (x, y) {
        const double_adder_machine = new RegisterMachine()
            .addNode("startA", new MinusNode({register: "A", value: x}))
            .addNode("CAddA", new PlusNode({register: "C", value: 0}))
            .addNode("DAddA", new PlusNode({register: "D", value: 0}))
            .addNode("DRestoreA", new MinusNode({register: "D"}))
            .addNode("RestoredA", new PlusNode({register: "A"}))
            .addNode("startB", new MinusNode({register: "B", value: y}))
            .addNode("CAddB", new PlusNode({register: "C"}))
            .addNode("DAddB", new PlusNode({register: "D"}))
            .addNode("DRestoreB", new MinusNode({register: "D"}))
            .addNode("RestoredB", new PlusNode({register: "B"}))
            .addLink(linkType.DEC, "startA", "CAddA")
            .addLink(linkType.EMP, "startA", "DRestoreA")
            .addLink(linkType.INC, "CAddA", "DAddA")
            .addLink(linkType.INC, "DAddA", "startA")
            .addLink(linkType.DEC, "DRestoreA", "RestoredA")
            .addLink(linkType.EMP, "DRestoreA", "startB")
            .addLink(linkType.INC, "RestoredA", "DRestoreA")
            .addLink(linkType.DEC, "startB", "CAddB")
            .addLink(linkType.EMP, "startB", "DRestoreB")
            .addLink(linkType.INC, "CAddB", 'DAddB')
            .addLink(linkType.INC, "DAddB", "startB")
            .addLink(linkType.DEC, "DRestoreB", "RestoredB")
            .addLink(linkType.INC, "RestoredB", "DRestoreB")
            .setStart("startA");

        const regs = double_adder_machine.run();
        const A = regs.get("A");
        const B = regs.get("B");
        const C = regs.get("C");
        return [A, B, C];
    };

    for (const i in inputs) {
        const inp = inputs[i];
        const out = outputs[i];
        t.test(`double adder case ${i}`, function (t) {
            t.deepEquals(double_adder(inp.x, inp.y), out);
            t.end();
        })
    }
    t.end();
});
