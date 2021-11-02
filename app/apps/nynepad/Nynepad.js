import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { Tag } from 'curvature/base/Tag';

export class Nynepad extends Task
{
	title    = 'Nynepad 95';
	icon     = '/w95/60-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.init = Date.now();

		this.window.args.charCount  = 'initializing...';
		this.window.args.document   = '';
		this.window.args.filename   = 'untitled';
		this.window.args.wrapping   = true;
		this.window.args.spellCheck = false;

		this.window.args.menus = {
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
						text => this.window.args.document = text
					)
				} }
				, Delete: { callback: () => document.execCommand("forwardDelete") }
				, 'Word Wrap': { callback: () => {

					let text = this.window.args.document;

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

					this.window.args.document = text;
				} }
			}
			, View: {
				'Spell Check': {
					callback:() => {

						this.window.args.spellCheck = !this.window.args.spellCheck;

						this.window.tags.field.focus();
						this.window.tags.field.select();


						this.window.onNextFrame( () => {
							document.execCommand('insertText', false, this.window.args.document);
							this.window.tags.field.focus()
						});
					}
				}
				, Wrapping: { callback: () => this.window.args.wrapping = !this.window.args.wrapping }
			}
			// , Search: {
			// 	Find: { callback: () => document.execCommand("find") }
			// 	, 'Find Next': { callback: () => document.execCommand("find-next") }
			// }
		};

		return Bindable.make(this);
	}

	attached()
	{
		this.window.args.menuBar  = new MenuBar(this.window.args, this.window);

		this.window.args.bindTo('document', (v,k,t,d) => {

			this.window.args.charCount = v ? v.length : 0;

		});
	}

	newDocument()
	{
		this.window.args.document = ''
		this.window.args.filename = 'untitled';
	}

	saveDocument()
	{
		if(this.fileHandle)
		{
			this.fileHandle.createWritable().then(writable => {
				writable.write(this.window.args.document);
				writable.close();
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
				writable.write(this.window.args.document);
				writable.close();
			});
		});
	}

	openFile()
	{
		const tag = new Tag('<input type = file>');

		this.window.listen(tag, 'input', event => {

			this.window.args.filename = tag.files[0].name;

			const fileReader = new FileReader();

			fileReader.onload = () => this.window.args.document = fileReader.result;

			fileReader.readAsText(tag.files[0]);

		});

		tag.click();
	}

	saveFile()
	{
		const blob = new Blob([this.window.args.document], {type:'text/plain'});

		const url = URL.createObjectURL(blob);

		const tag = new Tag(`<a href = "${url}" download = "${this.window.args.filename}">`);

		tag.click();
	}

	quit()
	{
		this.window.close();
	}
}
