import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { Tag } from 'curvature/base/Tag';

export class Nynepad extends Task
{
	static helpText = 'Text editor.';

	title      = 'Nynepad 95';
	icon       = '/w95/60-16-4bit.png';
	template   = require('./main.tmp');

	prompt     = '[Nynepad] <';
	outPrompt  = '[Nynepad] >';

	charCount  = 'initializing...';
	document   = '';

	filename   = 'untitled';
	wrapping   = true;
	spellCheck = false;

	menus = {
		File: {
			New: { callback: () => this.newDocument() }
			, Open: { callback: () => this.openFile() }
			, Save: { callback: () => this.saveDocument() }
			, 'Save As': { callback: () => this.saveDocumentAs() }
			, Quit: { callback: () => this.quit() }
		}
		, Edit: {
			Undo: { callback: () => document.execCommand("undo") }
			, Redo: { callback: () => document.execCommand("redo") }
			, 'Select All': { callback: () => {
				this.window.onNextFrame(()=>{
					this.window.tags.field.focus();
					this.window.tags.field.select();
				});
			} }
			, Cut: { callback: () => document.execCommand("cut") }
			, Copy: { callback: () => document.execCommand("copy") }
			, Paste: { callback: () => {
				navigator.clipboard.readText().then(
					text => this.document = text
				)
			} }
			, Delete: { callback: () => document.execCommand("forwardDelete") }
			, 'Word Wrap': { callback: () => {

				let text = this.document;

				console.log(text);

				text = text.replace(/\r/, '').replace(/\n/, ' ');

				let lineLength = 0;
				let lastSpace  = false;

				for(let i = 0; i < text.length; i++)
				{
					if(lastSpace && lineLength > 80)
					{
						text = text.substring(0,lastSpace) + '\n' + text.substring(lastSpace+1);
						lineLength = i - lastSpace;
						lastSpace  = false;

						continue;
					}

					if(text[i] === ' ')
					{
						lastSpace = i;
					}

					lineLength++;
				}

				this.window.tags.field.focus();
				this.window.tags.field.select();

				document.execCommand('insertText', false, text);

				this.document = text;
			} }
		}
		, View: {
			'Spell Check': {
				callback:() => {

					this.spellCheck = !this.spellCheck;

					this.window.tags.field.focus();
					this.window.tags.field.select();


					this.window.onNextFrame( () => {
						document.execCommand('insertText', false, this.document);
						this.window.tags.field.focus()
					});
				}
			}
			, Wrapping: { callback: () => this.wrapping = !this.wrapping }
		}
		// , Search: {
		// 	Find: { callback: () => document.execCommand("find") }
		// 	, 'Find Next': { callback: () => document.execCommand("find-next") }
		// }
	};

	menuBar = new MenuBar(this, this.window);

	commands = {
		w: () => this.saveDocument()
		, s: () => this.saveDocument()
		, o: () => this.openFile()
		, q: () => this.quit()
	};

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.init = Date.now();



		this.window.controller = this;

		this.bindTo('document', (v,k,t,d) => {

			this.charCount = v ? v.length : 0;

		});
	}

	attached()
	{
		this.window.tags.field.focus();
	}

	newDocument()
	{
		this.document = ''
		this.filename = 'untitled';
	}

	saveDocument()
	{
		if(this.fileHandle)
		{
			this.fileHandle.createWritable().then(writable => {
				writable.write(this.document);
				writable.close();
				this.print(`Rewrote ${this.filename}`);
			});

			return;
		}

		this.saveDocumentAs();
	}

	saveDocumentAs()
	{
		window.showSaveFilePicker().then(handle => {
			this.fileHandle = handle;

			this.fileHandle.createWritable().then(writable => {
				writable.write(this.document);
				writable.close();
				this.print(`Wrote ${this.filename}`);
			});
		});
	}

	openFile()
	{
		const tag = new Tag('<input type = file>');

		this.window.listen(tag, 'input', event => {

			this.filename = tag.files[0].name;

			const fileReader = new FileReader();

			fileReader.onload = () => this.document = fileReader.result;

			fileReader.readAsText(tag.files[0]);

		});

		tag.click();
	}

	saveFile()
	{
		const blob = new Blob([this.document], {type:'text/plain'});

		const url = URL.createObjectURL(blob);

		const tag = new Tag(`<a href = "${url}" download = "${this.filename}">`);

		tag.click();
	}

	quit()
	{
		this.window.close();
	}
}
