
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\CustomInput.svelte generated by Svelte v3.44.2 */

    const file$2 = "src\\CustomInput.svelte";

    function create_fragment$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 8, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*val*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*val*/ 1 && input.value !== /*val*/ ctx[0]) {
    				set_input_value(input, /*val*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CustomInput', slots, []);
    	let { val } = $$props;

    	function empty() {
    		$$invalidate(0, val = '');
    	}

    	const writable_props = ['val'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CustomInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		val = this.value;
    		$$invalidate(0, val);
    	}

    	$$self.$$set = $$props => {
    		if ('val' in $$props) $$invalidate(0, val = $$props.val);
    	};

    	$$self.$capture_state = () => ({ val, empty });

    	$$self.$inject_state = $$props => {
    		if ('val' in $$props) $$invalidate(0, val = $$props.val);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [val, empty, input_input_handler];
    }

    class CustomInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { val: 0, empty: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomInput",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*val*/ ctx[0] === undefined && !('val' in props)) {
    			console.warn("<CustomInput> was created without expected prop 'val'");
    		}
    	}

    	get val() {
    		throw new Error("<CustomInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set val(value) {
    		throw new Error("<CustomInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get empty() {
    		return this.$$.ctx[1];
    	}

    	set empty(value) {
    		throw new Error("<CustomInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Toggle.svelte generated by Svelte v3.44.2 */

    const file$1 = "src\\Toggle.svelte";

    function create_fragment$1(ctx) {
    	let button0;
    	let t0;
    	let button0_disabled_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			t0 = text("Option 1");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("Option 2");
    			button0.disabled = button0_disabled_value = /*choosenOption*/ ctx[0] === 1;
    			add_location(button0, file$1, 4, 0, 56);
    			button1.disabled = button1_disabled_value = /*choosenOption*/ ctx[0] === 2;
    			add_location(button1, file$1, 7, 0, 157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			append_dev(button0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*choosenOption*/ 1 && button0_disabled_value !== (button0_disabled_value = /*choosenOption*/ ctx[0] === 1)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (dirty & /*choosenOption*/ 1 && button1_disabled_value !== (button1_disabled_value = /*choosenOption*/ ctx[0] === 2)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toggle', slots, []);
    	let { choosenOption = 1 } = $$props;
    	const writable_props = ['choosenOption'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toggle> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, choosenOption = 1);
    	const click_handler_1 = () => $$invalidate(0, choosenOption = 2);

    	$$self.$$set = $$props => {
    		if ('choosenOption' in $$props) $$invalidate(0, choosenOption = $$props.choosenOption);
    	};

    	$$self.$capture_state = () => ({ choosenOption });

    	$$self.$inject_state = $$props => {
    		if ('choosenOption' in $$props) $$invalidate(0, choosenOption = $$props.choosenOption);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [choosenOption, click_handler, click_handler_1];
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { choosenOption: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toggle",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get choosenOption() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choosenOption(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isValidEmail(val) {
      return val.includes('@');
    }

    /* src\App.svelte generated by Svelte v3.44.2 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let custominput;
    	let updating_val;
    	let t0;
    	let toggle;
    	let t1;
    	let input0;
    	let t2;
    	let label0;
    	let input1;
    	let t3;
    	let t4;
    	let h3;
    	let t6;
    	let label1;
    	let input2;
    	let t7;
    	let t8;
    	let label2;
    	let input3;
    	let t9;
    	let t10;
    	let label3;
    	let input4;
    	let t11;
    	let t12;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t16;
    	let hr0;
    	let t17;
    	let input5;
    	let t18;
    	let button0;
    	let t20;
    	let div;
    	let t21;
    	let hr1;
    	let t22;
    	let form;
    	let input6;
    	let input6_class_value;
    	let t23;
    	let button1;
    	let t24;
    	let button1_disabled_value;
    	let current;
    	let mounted;
    	let dispose;

    	function custominput_val_binding(value) {
    		/*custominput_val_binding*/ ctx[13](value);
    	}

    	let custominput_props = {};

    	if (/*val*/ ctx[6] !== void 0) {
    		custominput_props.val = /*val*/ ctx[6];
    	}

    	custominput = new CustomInput({ props: custominput_props, $$inline: true });
    	binding_callbacks.push(() => bind(custominput, 'val', custominput_val_binding));
    	/*custominput_binding*/ ctx[14](custominput);

    	toggle = new Toggle({
    			props: {
    				choosenOption: /*selectedOption*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(custominput.$$.fragment);
    			t0 = space();
    			create_component(toggle.$$.fragment);
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			input1 = element("input");
    			t3 = text("\r\n  Agree to terms?");
    			t4 = space();
    			h3 = element("h3");
    			h3.textContent = "Favorite Color?";
    			t6 = space();
    			label1 = element("label");
    			input2 = element("input");
    			t7 = text("\r\n  Red");
    			t8 = space();
    			label2 = element("label");
    			input3 = element("input");
    			t9 = text("\r\n  Green");
    			t10 = space();
    			label3 = element("label");
    			input4 = element("input");
    			t11 = text("\r\n  Blue");
    			t12 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Green";
    			option1 = element("option");
    			option1.textContent = "Red";
    			option2 = element("option");
    			option2.textContent = "Blue";
    			t16 = space();
    			hr0 = element("hr");
    			t17 = space();
    			input5 = element("input");
    			t18 = space();
    			button0 = element("button");
    			button0.textContent = "Save";
    			t20 = space();
    			div = element("div");
    			t21 = space();
    			hr1 = element("hr");
    			t22 = space();
    			form = element("form");
    			input6 = element("input");
    			t23 = space();
    			button1 = element("button");
    			t24 = text("Save");
    			attr_dev(input0, "type", "number");
    			add_location(input0, file, 47, 0, 1177);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file, 50, 2, 1234);
    			add_location(label0, file, 49, 0, 1223);
    			add_location(h3, file, 54, 0, 1314);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "name", "color");
    			input2.__value = "red";
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[18][0].push(input2);
    			add_location(input2, file, 56, 2, 1351);
    			add_location(label1, file, 55, 0, 1340);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "name", "color");
    			input3.__value = "green";
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[18][0].push(input3);
    			add_location(input3, file, 60, 2, 1450);
    			add_location(label2, file, 59, 0, 1439);
    			attr_dev(input4, "type", "radio");
    			attr_dev(input4, "name", "color");
    			input4.__value = "blue";
    			input4.value = input4.__value;
    			/*$$binding_groups*/ ctx[18][0].push(input4);
    			add_location(input4, file, 64, 2, 1553);
    			add_location(label3, file, 63, 0, 1542);
    			option0.__value = "green";
    			option0.value = option0.__value;
    			add_location(option0, file, 69, 2, 1685);
    			option1.__value = "red";
    			option1.value = option1.__value;
    			add_location(option1, file, 70, 2, 1725);
    			option2.__value = "blue";
    			option2.value = option2.__value;
    			add_location(option2, file, 71, 2, 1761);
    			if (/*singleFavColor*/ ctx[3] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[21].call(select));
    			add_location(select, file, 68, 0, 1645);
    			add_location(hr0, file, 74, 0, 1810);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "id", "username");
    			add_location(input5, file, 76, 0, 1820);
    			add_location(button0, file, 77, 0, 1883);
    			add_location(div, file, 79, 0, 1928);
    			add_location(hr1, file, 81, 0, 1959);
    			attr_dev(input6, "type", "email");
    			attr_dev(input6, "class", input6_class_value = "" + (null_to_empty(isValidEmail(/*enteredEmail*/ ctx[5]) ? '' : 'invalid') + " svelte-u5nd84"));
    			add_location(input6, file, 84, 2, 2004);
    			attr_dev(button1, "type", "submit");
    			button1.disabled = button1_disabled_value = !/*formIsValid*/ ctx[9];
    			add_location(button1, file, 89, 2, 2126);
    			add_location(form, file, 83, 0, 1969);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(custominput, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*price*/ ctx[0]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, label0, anchor);
    			append_dev(label0, input1);
    			input1.checked = /*agreed*/ ctx[1];
    			append_dev(label0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, input2);
    			input2.checked = input2.__value === /*favColor*/ ctx[2];
    			append_dev(label1, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, input3);
    			input3.checked = input3.__value === /*favColor*/ ctx[2];
    			append_dev(label2, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, label3, anchor);
    			append_dev(label3, input4);
    			input4.checked = input4.__value === /*favColor*/ ctx[2];
    			append_dev(label3, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*singleFavColor*/ ctx[3]);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, input5, anchor);
    			/*input5_binding*/ ctx[22](input5);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[23](div);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, input6);
    			set_input_value(input6, /*enteredEmail*/ ctx[5]);
    			append_dev(form, t23);
    			append_dev(form, button1);
    			append_dev(button1, t24);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[15]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[16]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[17]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[19]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[20]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[21]),
    					listen_dev(button0, "click", /*saveData*/ ctx[11], false, false, false),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[24]),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[12]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const custominput_changes = {};

    			if (!updating_val && dirty & /*val*/ 64) {
    				updating_val = true;
    				custominput_changes.val = /*val*/ ctx[6];
    				add_flush_callback(() => updating_val = false);
    			}

    			custominput.$set(custominput_changes);

    			if (dirty & /*price*/ 1 && to_number(input0.value) !== /*price*/ ctx[0]) {
    				set_input_value(input0, /*price*/ ctx[0]);
    			}

    			if (dirty & /*agreed*/ 2) {
    				input1.checked = /*agreed*/ ctx[1];
    			}

    			if (dirty & /*favColor*/ 4) {
    				input2.checked = input2.__value === /*favColor*/ ctx[2];
    			}

    			if (dirty & /*favColor*/ 4) {
    				input3.checked = input3.__value === /*favColor*/ ctx[2];
    			}

    			if (dirty & /*favColor*/ 4) {
    				input4.checked = input4.__value === /*favColor*/ ctx[2];
    			}

    			if (dirty & /*singleFavColor*/ 8) {
    				select_option(select, /*singleFavColor*/ ctx[3]);
    			}

    			if (!current || dirty & /*enteredEmail*/ 32 && input6_class_value !== (input6_class_value = "" + (null_to_empty(isValidEmail(/*enteredEmail*/ ctx[5]) ? '' : 'invalid') + " svelte-u5nd84"))) {
    				attr_dev(input6, "class", input6_class_value);
    			}

    			if (dirty & /*enteredEmail*/ 32 && input6.value !== /*enteredEmail*/ ctx[5]) {
    				set_input_value(input6, /*enteredEmail*/ ctx[5]);
    			}

    			if (!current || dirty & /*formIsValid*/ 512 && button1_disabled_value !== (button1_disabled_value = !/*formIsValid*/ ctx[9])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(custominput.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(custominput.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*custominput_binding*/ ctx[14](null);
    			destroy_component(custominput, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(label0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(label1);
    			/*$$binding_groups*/ ctx[18][0].splice(/*$$binding_groups*/ ctx[18][0].indexOf(input2), 1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(label2);
    			/*$$binding_groups*/ ctx[18][0].splice(/*$$binding_groups*/ ctx[18][0].indexOf(input3), 1);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(label3);
    			/*$$binding_groups*/ ctx[18][0].splice(/*$$binding_groups*/ ctx[18][0].indexOf(input4), 1);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(select);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(input5);
    			/*input5_binding*/ ctx[22](null);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[23](null);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let val = 'Matthew';
    	let price = 0;
    	let selectedOption = 2;
    	let agreed;
    	let favColor = 'green';
    	let singleFavColor = 'red';
    	let usernameInput;
    	let someDiv;
    	let customInput;
    	let enteredEmail = '';
    	let formIsValid = false;

    	function setValue(event) {
    		$$invalidate(6, val = event.target.value);
    	}

    	function saveData() {
    		// console.log(document.querySelector('#username').value);
    		console.log(usernameInput.value);

    		console.log(usernameInput);
    		console.log(someDiv);
    		customInput.empty();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function submit_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function custominput_val_binding(value) {
    		val = value;
    		$$invalidate(6, val);
    	}

    	function custominput_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			customInput = $$value;
    			$$invalidate(4, customInput);
    		});
    	}

    	function input0_input_handler() {
    		price = to_number(this.value);
    		$$invalidate(0, price);
    	}

    	function input1_change_handler() {
    		agreed = this.checked;
    		$$invalidate(1, agreed);
    	}

    	function input2_change_handler() {
    		favColor = this.__value;
    		$$invalidate(2, favColor);
    	}

    	function input3_change_handler() {
    		favColor = this.__value;
    		$$invalidate(2, favColor);
    	}

    	function input4_change_handler() {
    		favColor = this.__value;
    		$$invalidate(2, favColor);
    	}

    	function select_change_handler() {
    		singleFavColor = select_value(this);
    		$$invalidate(3, singleFavColor);
    	}

    	function input5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			usernameInput = $$value;
    			$$invalidate(7, usernameInput);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			someDiv = $$value;
    			$$invalidate(8, someDiv);
    		});
    	}

    	function input6_input_handler() {
    		enteredEmail = this.value;
    		$$invalidate(5, enteredEmail);
    	}

    	$$self.$capture_state = () => ({
    		CustomInput,
    		Toggle,
    		isValidEmail,
    		val,
    		price,
    		selectedOption,
    		agreed,
    		favColor,
    		singleFavColor,
    		usernameInput,
    		someDiv,
    		customInput,
    		enteredEmail,
    		formIsValid,
    		setValue,
    		saveData
    	});

    	$$self.$inject_state = $$props => {
    		if ('val' in $$props) $$invalidate(6, val = $$props.val);
    		if ('price' in $$props) $$invalidate(0, price = $$props.price);
    		if ('selectedOption' in $$props) $$invalidate(10, selectedOption = $$props.selectedOption);
    		if ('agreed' in $$props) $$invalidate(1, agreed = $$props.agreed);
    		if ('favColor' in $$props) $$invalidate(2, favColor = $$props.favColor);
    		if ('singleFavColor' in $$props) $$invalidate(3, singleFavColor = $$props.singleFavColor);
    		if ('usernameInput' in $$props) $$invalidate(7, usernameInput = $$props.usernameInput);
    		if ('someDiv' in $$props) $$invalidate(8, someDiv = $$props.someDiv);
    		if ('customInput' in $$props) $$invalidate(4, customInput = $$props.customInput);
    		if ('enteredEmail' in $$props) $$invalidate(5, enteredEmail = $$props.enteredEmail);
    		if ('formIsValid' in $$props) $$invalidate(9, formIsValid = $$props.formIsValid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*enteredEmail*/ 32) {
    			if (isValidEmail(enteredEmail)) {
    				$$invalidate(9, formIsValid = true);
    			} else {
    				$$invalidate(9, formIsValid = false);
    			}
    		}

    		if ($$self.$$.dirty & /*price*/ 1) {
    			console.log(price);
    		}

    		if ($$self.$$.dirty & /*agreed*/ 2) {
    			console.log(agreed);
    		}

    		if ($$self.$$.dirty & /*favColor*/ 4) {
    			console.log(favColor);
    		}

    		if ($$self.$$.dirty & /*singleFavColor*/ 8) {
    			console.log(singleFavColor);
    		}

    		if ($$self.$$.dirty & /*customInput*/ 16) {
    			console.log(customInput);
    		}
    	};

    	return [
    		price,
    		agreed,
    		favColor,
    		singleFavColor,
    		customInput,
    		enteredEmail,
    		val,
    		usernameInput,
    		someDiv,
    		formIsValid,
    		selectedOption,
    		saveData,
    		submit_handler,
    		custominput_val_binding,
    		custominput_binding,
    		input0_input_handler,
    		input1_change_handler,
    		input2_change_handler,
    		$$binding_groups,
    		input3_change_handler,
    		input4_change_handler,
    		select_change_handler,
    		input5_binding,
    		div_binding,
    		input6_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
