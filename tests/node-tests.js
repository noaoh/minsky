const minsky = require('../dist/minsky.cjs.js');
const test = require('tape');

test("\ninvalid node type", function (t) {
    const err_func = function (node) {
        return `invalid node type: ${node}`
    };

    const throw_func = function() {
        return new minsky.RegisterMachine({"start": new minsky.RegisterMachine({})});
    };

    t.throws(throw_func, err_func("RegisterMachine"))

    t.end();
});

test("\nno node named", function (t) {
    const err_func = function (node) {
        return `register machine does not have node named: ${node}`
    };

    const throw_func = function() {
        return new minsky.RegisterMachine({"start": new minsky.PlusNode({on_increment: "b"})});
    }

    t.throws(throw_func, err_func("b"));

    t.end();
});

test("\nval must be greater than", function (t) {
    const plus_func = function (node) {
        return `val in PlusNode must be greater than or equal to ${node}`
    };

    const minus_func = function (node) {
        return `val in MinusNode must be greater than or equal to ${node}`
    };

    const throw_plus_func = function() {
        return new minsky.PlusNode({"val": -1})
    }

    const throw_minus_func = function() {
            return new minsky.MinusNode({"val": -1})
    }

    t.throws(throw_plus_func, plus_func(-1));

    t.throws(throw_minus_func, minus_func(-1));

    t.end();
});

test('\nincrement', function (t) {
    const inputs = [0, 1, 2];
    const outputs = [1, 2, 3];
    const increment = function (x) {
        let increment_machine = new minsky.RegisterMachine(
            {
                "start": new minsky.PlusNode({register: "A", val: x})
            }
        );
        increment_machine.run();
        return increment_machine.registers["A"];
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
        let decrement_machine = new minsky.RegisterMachine(
            {
                "start": new minsky.MinusNode({register: "A", val: x})
            }
        );
        decrement_machine.run();
        return decrement_machine.registers["A"];
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
        let not_zero_machine = new minsky.RegisterMachine(
            {
                "start": new minsky.MinusNode({register: "A", val: x, on_decrement: "A1"}),
                "A1": new minsky.MinusNode({register: "A", on_decrement: "A1", on_empty: "A2"}),
                "A2": new minsky.PlusNode({register: "A"})
            }
        );
        not_zero_machine.run();
        return not_zero_machine.registers["A"];
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
        const is_zero_machine = new minsky.RegisterMachine(
            {
                "start": new minsky.MinusNode({register: "A", val: x, on_empty: "A1", on_decrement: "A2"}),
                "A1": new minsky.PlusNode({register: "A"}),
                "A2": new minsky.MinusNode({register: "A", on_decrement: "A2"})
            }
        );
        is_zero_machine.run();
        return is_zero_machine.registers["A"];
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
    const inputs = [{"x": 10, "y": 100}, {"x": 100, "y": 100}, {"x": 100, "y": 10}];
    const outputs = [[10, 100, 110], [100, 100, 200], [100, 10, 110]];
    const double_adder = function (x, y) {
        let double_adder_machine = new minsky.RegisterMachine(
            {
                "startA": new minsky.MinusNode({register: "A", val: x, on_decrement: "CAddA", on_empty: "DRestoreA"}), // initial A
                "CAddA": new minsky.PlusNode({register: "C", val: 0, on_increment: "DAddA"}),
                "DAddA": new minsky.PlusNode({register: "D", val: 0, on_increment: "startA"}),
                "DRestoreA": new minsky.MinusNode({register: "D", on_decrement: "RestoredA", on_empty: "startB"}),
                "RestoredA": new minsky.PlusNode({register: "A", on_increment: "DRestoreA"}),
                "startB": new minsky.MinusNode({register: "B", val: y, on_decrement: "CAddB", on_empty: "DRestoreB"}), // initial B
                "CAddB": new minsky.PlusNode({register: "C", on_increment: "DAddB"}),
                "DAddB": new minsky.PlusNode({register: "D", on_increment: "startB"}),
                "DRestoreB": new minsky.MinusNode({register: "D", on_decrement: "RestoredB"}),
                "RestoredB": new minsky.PlusNode({register: "B", on_increment: "DRestoreB"})
            }
        );

        double_adder_machine.start = double_adder_machine.nodes["startA"];
        double_adder_machine.run();
        const A = double_adder_machine.registers["A"];
        const B = double_adder_machine.registers["B"];
        const C = double_adder_machine.registers["C"];
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
