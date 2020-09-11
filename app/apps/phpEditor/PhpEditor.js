import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { PhpTask } from './PhpTask';

import * as ace from 'brace';

// import 'brace/mode/html';
import 'brace/mode/php';
import 'brace/mode/markdown';
import 'brace/theme/monokai';

import { Console as Terminal } from 'subspace-console/Console';

console.log(ace);

const Range = ace.acequire('ace/range').Range;

export class PhpEditor extends Task
{
	title    = 'SM PHP Shell';
	icon     = '/apps/php-16-24bit.png';
	template = require('./php-editor.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.loading   = true;
		this.window.classes.phpEditor = true;

		// this.window.classes['mode-script'] = true;
		this.window.classes['mode-term'] = true;

		this.window.args.width  = `620px`;
		this.window.args.height = `740px`;

		this.modes = ['script', 'iffe', 'term'];
		// this.mode  = 'script';
		this.mode  = 'terminal';

		this.returnConsole = new Terminal;
		this.inputConsole  = new Terminal({path:{php: PhpTask}});
		this.outputConsole = new Terminal;
		this.errorConsole  = new Terminal;

		this.inputConsole.runCommand('php');
		this.inputConsole.runCommand('/clear');

		this.window.onTimeout(
			0, () => this.inputConsole.runCommand(`'Extensions available: ' . implode(', ', get_loaded_extensions() )`)
		);

		this.window.args.status = 'initializing...';

		this.window.args.returnConsole = this.returnConsole;
		this.window.args.inputConsole  = this.inputConsole;
		this.window.args.outputConsole = this.outputConsole;
		this.window.args.errorConsole  = this.errorConsole;

		this.window.args.input = '<?php ';
		this.window.args.input = `<?php

// Only "single" expressions can return strings directly
// So wrap the commands in an IFFE.

(function() {
    global $persist;

    $stdout = fopen('php://stdout', 'w');
    $stderr = fopen('php://stderr', 'w');

    fwrite($stdout, sprintf("Ran %d times!\\n", $persist++));

    fwrite($stderr, 'testing stderror');

    return 'this is a return value.';

})();`;

		const Php = require('php-wasm/PhpWeb').PhpWeb;

		const php = new Php();

		php.addEventListener('ready', () => {
			this.window.classes.loading = false;
			this.window.args.status = 'PHP Ready!';

			if(!this.window.args.input.trim())
			{
				return;
			}
		});

		this.window.args.output = '';

		this.window.click = (event) => {

			// this.returnConsole.args.output.splice(0);
			// this.outputConsole.args.output.splice(0);
			// this.errorConsole.args.output.splice(0);

			this.window.classes.loading = true;
			this.window.args.status = 'PHP Running...';

			this.window.args.output = '';

			const code = String(this.window.args.input)
				.replace(/^<\?php/,'')
				.replace(/;$/,'');

			php.exec(code).then(exitCode => {

				this.returnConsole.args.output.push(exitCode);

				this.window.args.exitCode = exitCode;
				// php.refresh();

			});
		};

		this.window.ruleSet.add('textarea[data-php]', ({element}) => {

			const resizer = element.parentNode;

			let editor = ace.edit(element);

			if(ResizeObserver)
			{
				const resizeObserver = new ResizeObserver(entries => {
					editor && editor.resize();
				});

				resizeObserver.observe(resizer);
			}

			editor.setTheme('ace/theme/monokai');

			editor.session.setMode('ace/mode/php');

			// editor.session.setMode('ace/mode/markdown', () => {

			// 	const rules = editor.session.$mode.$highlightRules.getRules();

			// 	for (const stateName in rules)
			// 	{
			// 		if (Object.prototype.hasOwnProperty.call(rules, stateName))
			// 		{
			// 			rules[stateName].unshift({
			// 				token:   'markdown-generic-code-tag'
			// 				, regex: /```/
			// 				, next:  'start'
			// 			});

			// 			rules[stateName].unshift({
			// 				token:   'markdown-open-code-tag'
			// 				, regex: /```(\S+)?/
			// 				, next:  'start'
			// 			});

			// 			rules[stateName].unshift({
			// 				token:   'php-open-tag'
			// 				, regex: /<\?=/i
			// 				, next:  'start'
			// 				, onMatch: (value, state, stack, line) => {

			// 					console.log(value, state, stack, line)

			// 					return this.token;
			// 				},
			// 			});

			// 		}
			// 	}

			// 	// force recreation of tokenizer
			// 	editor.session.$mode.$tokenizer = null;
			// 	editor.session.bgTokenizer.setTokenizer(editor.session.$mode.getTokenizer());
			// 	// force re-highlight whole document
			// 	editor.session.bgTokenizer.start(0);
			// });

			// editor.setOptions({
			// 	autoScrollEditorIntoView: true
			// 	, maxLines:               0
			// 	, printMargin:            false
			// 	, readOnly:               false
			// });

			const aceChanged = (event) => {

				if(!editor.curOp || !editor.curOp.command.name)
				{
					const added = new Range(
						event.start.row
						, 0
						, event.end.row -1
						, Infinity
					);

					this.window.onTimeout(0, ()=>{
						editor.session.addMarker(added, 'output-line', 'fullLine');
					});

					return;
				}

				this.window.args.input = editor.session.getValue();
			};

			editor.session.on('change', aceChanged);

			this.window.onRemove(()=>{
				editor.session.off('change', aceChanged);
				editor.destroy();
				editor = undefined;
			});

			editor.resize();

			php.addEventListener('output', event => {

				this.window.classes.loading = false;
				this.window.args.status = 'PHP Ready!';

				const detail   = event.detail.join("\n").trim();

				this.outputConsole.args.output.push(detail);
			});

			php.addEventListener('error', event => {

				const detail = event.detail.join("\n ").trim();

				if(!detail)
				{
					return;
				}

				this.window.args.status = 'PHP Ready - ERRORS!';
				this.window.classes.loading = false;

				this.errorConsole.args.output.push(detail);
			});
		});

		this.window.refresh = () => {

			php.refresh();

			this.returnConsole.args.output.splice(0);
			this.outputConsole.args.output.splice(0);
			this.errorConsole.args.output.splice(0);

		};

		this.window.modeTo = (mode) => {
			if(!this.modes.includes(mode))
			{
				return;
			}

			for(const m in this.modes)
			{
				const testMode = this.modes[m];

				this.window.classes['mode-'+testMode] = testMode == mode;
			}

			this.mode = mode;
		};
	}

	attached()
	{
		this.returnConsole.scroller = this.returnConsole.findTag('.terminal');
		this.inputConsole.scroller  = this.inputConsole.findTag('.terminal');
		this.outputConsole.scroller = this.outputConsole.findTag('.terminal');
		this.errorConsole.scroller  = this.errorConsole.findTag('.terminal');
	}
}
