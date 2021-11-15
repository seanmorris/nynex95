import { Tag  } from 'curvature/base/Tag';
import { Task } from 'task/Task';

import { MenuBar } from '../../window/MenuBar';

export class CardEditor extends Task
{
	static helpText = 'Card Editor';

	title    = 'Card Editor';
	icon     = '/w95/3-16-4bit.png';
	template = require('./main.tmp');

	width  = '380px';
	height = '675px';

	videoId = '';
	cards   = [];

	cardCount = 0;

	menus = {
		File: {
			// New: { callback: () => this.newDocument() }
			Open: { callback: () => this.importJson() }
			, Save: { callback: () => this.saveDocument() }
			, 'Save As': { callback: () => this.saveDocumentAs() }
			, Quit: { callback: () => this.quit() }
		}
		, View: {
			// New: { callback: () => this.newDocument() }
			'Json Preview': { callback: () => this.printJson() }
			// , Save: { callback: () => this.saveDocument() }
			// , 'Save As': { callback: () => this.saveDocumentAs() }
			// , Quit: { callback: () => this.quit() }
		}
		, Help: {
			About: { callback: () => this.aboutDialog() }
		}
	};

	commands = {
		w: () => this.saveDocument()
		, s: () => this.saveDocument()
		, o: () => this.importJson()
		, q: () => this.quit()
	};

	menuBar = new MenuBar(this, this.window);

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.controller = this;

		this.bindTo('cards', v => {

			this.debindCardCount && this.debindCardCount();

			this.debindCardCount = v.bindTo(v => this.cardCount = this.cards.length, {wait:100});
		});
	}

	selectProperty($event, key)
	{
		this.lastSelected = key;
	}

	addProperty($event, $subview)
	{
		$subview.args.adding = true;

		this.window.onTimeout(100, () => $subview.tags.newName.focus());
	}

	cancelAddProperty($event, $subview, cardIndex)
	{
		$subview.args.adding = false;
	}

	confirmAddProperty($event, $subview, cardIndex)
	{
		const newName = $subview.tags.newName.value;

		document.activeElement && document.activeElement.blur();

		if(!newName)
		{
			this.window.onTimeout(100, () => $subview.tags.newName.focus());
			return;
		}

		$subview.args.adding = false;

		this.cards[cardIndex][newName] = '';

		$subview.tags.newName.value = '';

		this.window.onNextFrame(() => $subview.tags.newName.focus());
	}

	removeCard(event, cardIndex)
	{
		this.cards.splice(cardIndex, 1);
	}

	removeProperty(event, key, cardIndex)
	{
		delete this.cards[cardIndex][key];
	}

	mousemove(event)
	{
		// this.window.onNextFrame(() => {
		// 	this.cards[0].x = event.screenX;
		// 	this.cards[0].y = event.screenY;
		// });
	}

	newCard()
	{
		this.cards.push({
			content:'', class: '', start:0, end: 10000
		});

		this.window.tags.scroller.scrollTo({
			behavior: 'smooth'
			, top: this.window.tags.scroller.scrollHeight
		});
	}

	exportJson()
	{
		const doc = {
			videoId: this.videoId
			, autoplay: Number(this.autoplay)
			, controls: Number(this.controls)
			, volume: Number(this.volume)
			, startTime: Number(this.startTime)
			, cards: this.cards
		}

		const json = JSON.stringify(doc, null, 4);

		return json;
	}

	printJson()
	{
		const jsonArgs = {
			title:'Json Preview'
			, template:`<pre class = "liquid white inset scroll">[[json]]</pre>`
			, json: this.exportJson()
		};

		const subWindow = this.openSubWindow(jsonArgs);

		subWindow.focus();
	}

	aboutDialog()
	{
		const aboutArgs = {
			template: require('./about.tmp')
			, title:  'About Card Editor'
			, width:   '300px'
			, height:  '350px'
		};

		const subWindow = this.openSubWindow(aboutArgs);

		subWindow.focus();
	}

	saveDocument()
	{
		if(this.fileHandle)
		{
			this.fileHandle.createWritable().then(writable => {
				writable.write(this.exportJson());
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
				writable.write(this.exportJson());
				writable.close();
				this.print(`Wrote ${this.filename}`);
			});
		});
	}

	importJson()
	{
		const tag = new Tag('<input type = file accept = "application/json">');

		this.window.listen(tag, 'input', event => {

			this.window.args.filename = tag.files[0].name;

			const fileReader = new FileReader();

			fileReader.onload = () => {

				const imported = JSON.parse(fileReader.result);

				if(typeof imported.videoId === 'string')
				{
					this.videoId = imported.videoId;
				}

				if(!isNaN(imported.startTime))
				{
					this.startTime = Number(imported.startTime);
				}

				if(!isNaN(imported.autoplay))
				{
					this.autoplay = Number(imported.autoplay);
				}

				if(!isNaN(imported.volume))
				{
					this.volume = Number(imported.volume);
				}

				if(!isNaN(imported.controls))
				{
					this.controls = Number(imported.controls);
				}

				if(Array.isArray(imported.cards))
				{
					this.cards = imported.cards;
				}

			};

			fileReader.readAsText(tag.files[0]);

		});

		tag.click();
	}

	quit()
	{
		this.window.close();
	}
}
