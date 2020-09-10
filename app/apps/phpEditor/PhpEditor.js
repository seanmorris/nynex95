import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

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
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.loading = true;
		this.window.classes.phpEditor = true;

		this.modes = ['script', 'iffe', 'term'];
		this.mode  = 'script';

		this.returnConsole = new Terminal;
		this.inputConsole  = new Terminal;
		this.outputConsole = new Terminal;
		this.errorConsole  = new Terminal;

		this.inputConsole.args.prompt = '<?php';

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

    fwrite($stdout, "some output...\\n");

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

			this.returnConsole.args.output.splice(0);
			this.outputConsole.args.output.splice(0);
			this.errorConsole.args.output.splice(0);

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

			// editor.commands.on("exec", event => {

			// 	if(event.command.readOnly)
			// 	{
			// 		return;
			// 	}

			// 	const rowCol = editor.selection.getCursor();
			// 	const lines  = editor.session.getLength() - 1;

			// 	if(rowCol.row !== lines)
			// 	{
			// 		event.preventDefault();
			// 		event.stopPropagation();
			// 		return;
			// 	}

			// 	if(event.command.name === 'backspace' && rowCol.column === 0)
			// 	{
			// 		event.preventDefault();
			// 		event.stopPropagation();
			// 		return;
			// 	}

			// 	const selection = editor.selection.getRange();


			// 	if(selection)
			// 	{
			// 		const newSelection = selection.clipRows(lines, lines);

			// 		// console.log(newSelection.startOffset);

			// 		editor.selection.setRange(newSelection);

			// 		if(newSelection.start.row !== lines || newSelection.end.row !== lines)
			// 		{
			// 			event.preventDefault();
			// 			event.stopPropagation();
			// 			return;
			// 		}
			// 	}
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

				// const lines = editor.session.getLength();

				this.window.args.input = editor.session.getValue();

				// if(event.end.row !== event.start.row)
				// {
				// 	const newLine   = editor.session.getLine(lines - 1);
				// 	const addedLine = editor.session.getLine(lines - 2);

				// 	let phpCommand = (addedLine + newLine).trim();

				// 	if(addedLine.trim())
				// 	{
				// 		editor.session.replace(new Range(lines - 1, 0, lines - 1, Infinity), "");
				// 		editor.session.replace(new Range(lines - 2, 0, lines - 2, Infinity), phpCommand);
				// 	}

				// 	phpCommand = phpCommand.replace(/^<\?php/, '');
				// 	phpCommand = phpCommand.replace(/;$/, '');

				// 	console.log(phpCommand);

				// 	if(!!phpCommand)
				// 	{
				// 		console.log(phpCommand);

				// 		this.window.args.input =

				// 		// php.exec(`var_export(${phpCommand},1)`).then(retVal => {

				// 		// 	console.log(retVal);

				// 		// 	editor.session.insert(
				// 		// 		{row: lines - 1, column: 0}
				// 		// 		, ';' + String(retVal) + "?>\n\n<?php "
				// 		// 	);
				// 		// });
				// 	}
				// }

				// if(event.action !== 'remove')
				// {
				// 	return;
				// }

				// if(event.end.column !== 0)
				// {
				// 	return;
				// }

				// if(event.end.row === lines && event.start.row === lines)
				// {
				// 	return;
				// }

				// this.window.onNextFrame(()=>{
				// 	editor.gotoLine(lines + 1);
				// 	editor.navigateLineEnd();
				// });
			};

			editor.session.on('change', aceChanged);

			this.window.onRemove(()=>{
				editor.session.off('change', aceChanged);
				editor.destroy();
				editor = undefined;
			});

			editor.resize();

			php.addEventListener('output', event => {
				// const lines  = editor.session.getLength() - 1;

				this.window.classes.loading = false;
				this.window.args.status = 'PHP Ready!';

				const detail   = event.detail.join("\n").trim();
				// const prevLine = editor.session.getLine(lines);

				// console.log(prevLine, detail);

				this.outputConsole.args.output.push(detail);

				// if(!prevLine || prevLine.match(/^\s*?\<\?php/))
				// {
				// 	if(!detail)
				// 	{
				// 		return;
				// 	}
				// }

				// if(this.printOpen)
				// {
				// 	clearTimeout(this.printOpen);
				// }

				// this.printOpen = this.window.onTimeout(100, () => {
				// 	editor.session.insert(
				// 		editor.getCursorPosition()
				// 		, '<?php '
				// 	)

				// });

				// editor.session.insert(
				// 	editor.getCursorPosition()
				// 	, '// ' + detail + "\n"
				// );
			});

			php.addEventListener('error', event => {

				const detail = event.detail.join("\n ").trim();

				if(!detail)
				{
					return;
				}

				// const lines  = editor.session.getLength() - 1;

				// editor.gotoLine(lines + 1);
				// editor.navigateLineEnd();

				this.window.args.status = 'PHP Ready - ERRORS!';
				this.window.classes.loading = false;

				this.errorConsole.args.output.push(detail);
			});
		});

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
}
