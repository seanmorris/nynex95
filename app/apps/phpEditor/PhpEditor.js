import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { HtmlFrame } from '../../control/HtmlFrame'

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

// import { PhpTask } from './PhpTask';

import * as ace from 'brace';

// import 'brace/mode/html';
import 'brace/mode/php';
import 'brace/mode/markdown';
import 'brace/theme/monokai';

import { Console as Terminal } from 'subspace-console/Console';

const Range = ace.acequire('ace/range').Range;

export class PhpEditor extends Task
{
	static helpText = 'Run PHP in your browser.';

	title    = 'SM PHP Shell';
	icon     = '/apps/php-16-24bit.png';
	template = require('./php-editor.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.classes.loading   = true;
		this.window.classes.phpEditor = true;

		this.window.classes['mode-script'] = true;

		this.window.args.width  = this.window.args.minWidth  = `720px`;
		this.window.args.height = this.window.args.minHeight = `800px`;

		this.modes = ['script', 'iffe', 'term'];
		this.mode  = 'script';


		this.returnConsole = new Terminal;
		// this.inputConsole  = new Terminal({path:{php: PhpTask}});
		this.outputConsole = new Terminal;
		this.errorConsole  = new Terminal;

		this.window.args.exitCode = 'NUL';

		// this.inputConsole.runCommand('php');
		// this.inputConsole.runCommand('/clear');

		this.window.args.layout = 'horizontal';
		this.window.args.htmlFrame = new HtmlFrame;

		// this.inputConsole.runCommand(
		// 	`'Extensions available: ' . implode(', ', get_loaded_extensions())`
		// );

		// this.inputConsole.runCommand('var_dump( (object)[ "php" => "working!" ] )');

		this.window.args.status = 'initializing...';

		this.window.args.returnConsole = this.returnConsole;
		// this.window.args.inputConsole  = this.inputConsole;
		this.window.args.outputConsole = this.outputConsole;
		this.window.args.errorConsole  = this.errorConsole;

		this.window.args.input = '<?php ';
		this.window.args.input = `<?php
// Only "single" expressions can
// return strings directly...
// So wrap the commands in an IFFE.

(function() {
	$stdout = fopen('php://stdout', 'w');
	$stderr = fopen('php://stderr', 'w');

	global $count;

	fwrite($stdout, sprintf(
		"Ran %d time%s!<br />\\n"
		, ++$count
		, $count==1?'':'s'
	));

	fwrite($stderr, 'testing STDERR.');

	return 'Ran @' . (new DateTime)->format('Y-m-d h:i:s.v') . ' UTC';

})();`;
		const Php = require('php-wasm/PhpWebDrupal').PhpWebDrupal;

		const php = new Php({persist: {mountPath: '/persist'}});

		this.window.listen(php, 'ready', () => {
			this.window.classes.loading = false;
			this.window.args.status = 'PHP Ready!';

			if(!this.window.args.input.trim())
			{
				return;
			}
		});

		this.window.args.persist = true;

		this.window.args.output = '';

		this.window.toggle = (varname) => {
			this.window.args[varname] = !this.window.args[varname];

			if(varname === 'persist')
			{
				this.window.refresh();
			}
		}

		this.window.layout = (layout) => {
			this.window.args.layout = layout;
		}

		this.window.runCode = (event) => {

			this.window.classes.loading = true;
			this.window.args.status = 'PHP Running...';

			this.window.tags.runButton.disabled = true;

			this.window.args.output = '';

			if(!this.window.args.persist)
			{
				this.window.refresh();
			}

			const code = String(this.window.args.input)
				.replace(/^<\?php/,'')
				.replace(/;$/,'');

			navigator.locks.request("php-persist", async (lock) => {

				php.exec(code).then(retVal => {

					this.window.classes.loading = false;
					this.window.args.status = 'PHP Ready!';
					this.window.tags.runButton.disabled = false;

					this.returnConsole.args.output.push(retVal);

				});

			});

			// this.window.args.exitCode = exitCode;
		};

		this.window.listen(php, 'output', event => {

			const detail   = event.detail.join("\n").trim();

			this.outputConsole.args.output.push(detail);
			this.window.args.htmlFrame.args.frameSource += detail;
		});

		this.window.listen(php, 'error', event => {

			const detail = event.detail.join("\n ").trim();

			if(!detail)
			{
				return;
			}

			this.errorConsole.args.output.push(detail);
		});

		this.window.refresh = () => {

			php.refresh();

			this.returnConsole.args.output.splice(0);
			this.outputConsole.args.output.splice(0);
			this.errorConsole.args.output.splice(0);
			this.window.args.htmlFrame.args.frameSource = '';
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
		this.returnConsole.scroller = this.returnConsole && this.returnConsole.findTag('.terminal');
		// this.inputConsole.scroller  = this.inputConsole  && this.inputConsole.findTag('.terminal');
		this.outputConsole.scroller = this.outputConsole && this.outputConsole.findTag('.terminal');
		this.errorConsole.scroller  = this.errorConsole  && this.errorConsole.findTag('.terminal');

		this.window.findTags('textarea[data-php]').forEach(element => {
			const resizer = element.parentNode;

			let editor = ace.edit(element.node);

			editor.session.setUseWorker(false);

			editor && editor.resize();

			editor.setTheme('ace/theme/monokai');
			editor.session.setMode('ace/mode/php');

			if(ResizeObserver)
			{
				const resizeObserver = new ResizeObserver(entries => {
					editor && editor.resize();
				});

				resizeObserver.observe(resizer);

				this.window.onRemove(() => resizeObserver.unobserve(resizer));
			}

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
		});
	}
}
