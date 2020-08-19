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

		this.window.args.status = 'initializing...';

		this.window.args.input = '<?php ';
		// this.window.args.input = `\`\`\`php <?php ob_end_flush(); echo "Hello," . PHP_EOL . " world!" ?> \`\`\``;

		const php = new ( require('php-wasm/Php').Php );

		php.addEventListener('ready', () => {
			this.window.classes.loading = false;
			this.window.args.status = 'PHP Ready!';

			if(!this.window.args.input.trim())
			{
				return;
			}

			php.run(this.window.args.input + "\n");
		});

		this.window.args.output = '';

		this.window.click = (event) => {

			this.window.classes.loading = true;
			this.window.args.status = 'PHP Running...';

			this.window.args.output = '';

			this.window.onIdle(()=>php.run(this.window.args.input));

		};

		this.window.ruleSet.add('textarea', ({element}) => {
			const resizeTarget   = element.parentElement;
			const resizeObserver = new ResizeObserver(entries => {
				editor.resize();
			});

			resizeObserver.observe(resizeTarget);

			this.window.onRemove(()=>resizeObserver.unobserve(resizeTarget));

			let editor = ace.edit(element);

			editor.setTheme('ace/theme/monokai');

			editor.session.setMode('ace/mode/markdown');

			editor.session.setMode('ace/mode/markdown', () => {

				const rules = editor.session.$mode.$highlightRules.getRules();

				for (const stateName in rules)
				{
					if (Object.prototype.hasOwnProperty.call(rules, stateName))
					{
						rules[stateName].unshift({
							token: 'markdown-generic-code-tag'
							, regex: /```/
							, next: 'start'
						});

						rules[stateName].unshift({
							token: 'markdown-open-code-tag'
							, regex: /```(\S+)?/
							, next: 'start'
						});


						if(['string.xml', 'string.xml2'].includes(stateName))
						{
							rules[stateName].unshift({
								token: 'markdown-code-unclosed-string'
								, regex: /(?<=['"])[^'"]+?(?=\`)/
								, next: 'start'
								,  onMatch: function(value, state, stack, line) {

									console.log(value, state, stack, line)

									return this.token;
								},
							});
						}
					}
				}

				// force recreation of tokenizer
				editor.session.$mode.$tokenizer = null;
				editor.session.bgTokenizer.setTokenizer(editor.session.$mode.getTokenizer());
				// force re-highlight whole document
				editor.session.bgTokenizer.start(0);
			});


			editor.setOptions({
				autoScrollEditorIntoView: true
				, maxLines:               0
				, printMargin:            false
				, readOnly:               false
			});

			editor.commands.on("exec", event => {

				if(event.command.readOnly)
				{
					return;
				}

				const rowCol = editor.selection.getCursor();
				const lines  = editor.session.getLength() - 1;

				if(rowCol.row !== lines)
				{
					event.preventDefault();
					event.stopPropagation();
					return;
				}

				if(event.command.name === 'backspace' && rowCol.column === 0)
				{
					event.preventDefault();
					event.stopPropagation();
					return;
				}

				const selection = editor.selection.getRange();


				if(selection)
				{
					const newSelection = selection.clipRows(lines, lines);

					// console.log(newSelection.startOffset);

					editor.selection.setRange(newSelection);

					if(newSelection.start.row !== lines || newSelection.end.row !== lines)
					{
						event.preventDefault();
						event.stopPropagation();
						return;
					}
				}

			});

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

				const lines = editor.session.getLength();

				if(event.end.row !== event.start.row)
				{
					const newLine   = editor.session.getLine(lines - 1);
					const addedLine = editor.session.getLine(lines - 2);

					let phpCommand = (addedLine + newLine).trim();

					if(addedLine.trim())
					{
						editor.session.replace(new Range(lines - 1, 0, lines - 1, Infinity), "");
						editor.session.replace(new Range(lines - 2, 0, lines - 2, Infinity), phpCommand);
					}

					if(!!phpCommand)
					{
						phpCommand = phpCommand.replace(/^\<\?php/, '');
						phpCommand = phpCommand.replace(/\?\>\s+?/, '');

						if(!phpCommand.match(/(^(echo|print)|;$)/))
						{
							phpCommand = `print "<?php " . var_export(${phpCommand}, TRUE) . ";?>";`;
						}


						this.window.onIdle(()=>php.run(`<?php ${phpCommand};`));
					}
				}

				if(event.action !== 'remove')
				{
					return;
				}

				if(event.end.column !== 0)
				{
					return;
				}

				if(event.end.row === lines && event.start.row === lines)
				{
					return;
				}

				// editor.session.insert(
				// 	editor.getCursorPosition()
				// 	, "\n"
				// );

				this.window.onNextFrame(()=>{
					editor.gotoLine(lines + 1);
					editor.navigateLineEnd();
				});

				this.window.args.input = editor.getValue();
			};

			editor.session.on('change', aceChanged);

			this.window.onRemove(()=>{
				editor.session.off('change', aceChanged);
				editor.destroy();
				editor = undefined;
			});

			editor.resize();

			php.addEventListener('output', event => {
				const lines  = editor.session.getLength() - 1;

				editor.gotoLine(lines + 1);
				editor.navigateLineEnd();

				this.window.classes.loading = false;
				this.window.args.status = 'PHP Ready!';

				const retVal   = event.detail.join("\n");
				const prevLine = editor.session.getLine(lines);

				console.log(prevLine, retVal);

				if(!prevLine || prevLine.match(/^\s*?\<\?php/))
				{
					if(!retVal)
					{
						return;
					}
				}

				if(this.printOpen)
				{
					clearTimeout(this.printOpen);
				}

				this.printOpen = this.window.onTimeout(100, () => {
					editor.session.insert(
						editor.getCursorPosition()
						, '<?php '
					)

				});

				editor.session.insert(
					editor.getCursorPosition()
					, "```text " + retVal + " ```\n"
				);
			});

			php.addEventListener('error', event => {
				const lines  = editor.session.getLength() - 1;

				editor.gotoLine(lines + 1);
				editor.navigateLineEnd();

				this.window.args.status = 'PHP Ready - ERRORS!';
				this.window.classes.loading = false;

				editor.session.insert(
					editor.getCursorPosition()
					, '#' + event.detail.join("\n ")
				);

				console.log(event);
			});
		});

	}
}

// 		this.window.args.input = `<?php

// class HelloWorld
// {
//     public function __toString()
//     {
//         return "Hello, world!";
//     }
// }

// print new HelloWorld;

// //phpinfo();
