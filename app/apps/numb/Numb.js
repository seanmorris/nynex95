import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Tag  } from 'curvature/base/Tag';
import { Bag } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';

import { Card } from './Card';
import { Tenth } from './Tenth';

export class Numb extends Task
{
	title    = 'numb-linkin park.mp3.exe';
	icon     = '/apps/numb-16-8bit.png';
	template = require('./main.tmp');

	menus = {
		File: {
			'Open Card File': { callback: () => this.importJson() }
			, Quit: { callback: () => this.quit() }
		}
	}

	menuBar   = new MenuBar(this, this.window);

	source    = new Bag();
	cards     = this.source.map(item => new Card(item));
	deck      = new Set();

	videoId   = '_C70vDkYvqk'

	startTime = 0;
	autoplay  = 0;
	controls  = 0;

	removers  = new Map;

	smoothingStats = []

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.classes.clones = true;

		// const videoCode    = '_C70vDkYvqk';
		// const videoCode    = 'ETfiUYij5UE';


		this.bindTo('videoId', v => {

			if(!v) { this.src = ''; this.frame.src = ''; return; }

			this.src = `https://www.youtube.com/embed/${v}?enablejsapi=1`
				+ `&origin=${encodeURIComponent(location.origin)}`
				+ `&controls=${Number(!!(this.controls))}`
				+ `&autoplay=${Number(!!(this.autoplay))}`;

			if(this.frame)
			{
				this.frame.src = this.src;
			}
		});
	}

	calculateSmoothing()
	{
		const now = Date.now();

		if(this.lastSmoothTime)
		{
			this.smoothingStats.push(now - this.lastSmoothTime);
		}

		const frameDrag = 15;

		if(this.smoothingStats.length > frameDrag)
		{
			this.smoothingStats.splice(0, Math.max(0, -frameDrag + this.smoothingStats.length));
		}

		this.lastSmoothTime = now;
	}

	attached()
	{
		const frame = this.frame = this.window.findTag('iframe');

		this.window.listen(window, 'message', event => this.handleMessage(event));
		this.window.listen(frame, 'load', event => this.handleFrameLoaded(event));
	}

	handleMessage(event)
	{
		if(!event.source === this.frame.contentWindow)
		{
			return;
		}

		if(event.origin !== 'https://www.youtube.com')
		{
			console.warn('Message did not come from expected origin.');
			return;
		}

		const eventData = JSON.parse(event.data);

		if(!eventData.info || !eventData.info.currentTime)
		{
			return;
		}

		const elapsed = 1000 * eventData.info.currentTime;

		this.calculateSmoothing();

		const smoothing = 2 * Math.round(
			this.smoothingStats.reduce((a,b) => a+b, 0) / this.smoothingStats.length
		);

		for(const card of this.deck)
		{
			const cardElapsed = Math.max(0, elapsed + -card.start);
			const duration    = -smoothing + card.end + -card.start;

			card.progress = Math.min(1, cardElapsed / duration);
			card.timing   = Math.floor(smoothing);

			if(this.isInCardInterval(elapsed, card))
			{
				if(!this.cards.has(card))
				{
					card.starting = true;
					this.cards.add(card);
					this.window.onNextFrame(() => card.starting = false);
				}
				else if(card.removing)
				{
					clearTimeout(this.removers.get(card));
					card.removing = false;
				}
			}
			else
			{
				if(this.cards.has(card))
				{
					this.removers.set(card, this.window.onTimeout(smoothing, () => {
						this.cards.remove(card);
						this.removers.get(card);
					}));

					card.removing = true;
				}
			}
		}

		for(const card of this.source.list)
		{
			if(card && !this.deck.has(card))
			{
				this.cards.remove(card);
			}
		}
	}

	handleFrameLoaded()
	{
		if(!this.src)
		{
			return;
		}

		const origin  = 'https://www.youtube.com';

		{
			const message = JSON.stringify({event: 'listening'});
			this.frame.contentWindow.postMessage(message, origin);
		}

		if(this.startTime)
		{
			const message = JSON.stringify({
				event:  'command', func: 'seekTo', args: [this.startTime, this.autoplay]
			});

			this.frame.contentWindow.postMessage(message, origin);

			if(!this.autoplay)
			{
				const message = JSON.stringify({event:  'command', func: 'pauseVideo'});
				this.frame.contentWindow.postMessage(message, origin);
			}
		}


		if(this.volume)
		{
			const message = JSON.stringify({
				event:  'command', func: 'setVolume', args: [this.volume]
			});

			this.frame.contentWindow.postMessage(message, origin);
		}


		{
			// const message = JSON.stringify({event:  'command', func: 'getVideoData'});
			// this.frame.contentWindow.postMessage(message, origin);
		}
	}

	isInCardInterval(time, card)
	{
		if(card.start <= time && time <= card.end)
		{
			return true;
		}

		if(card.start <= time && 0 > card.end)
		{
			return true;
		}

		return false;
	}

	importJson()
	{
		const tag = new Tag('<input type = file accept = "*.json">');

		this.window.listen(tag, 'input', event => {

			this.window.args.filename = tag.files[0].name;

			const fileReader = new FileReader();

			fileReader.onload = () => {

				this.cards.items().map(item => this.cards.remove(item));

				const imported = JSON.parse(fileReader.result);

				if(!typeof imported.videoId === 'string')
				{
					return;
				}

				if(!isNaN(imported.startTime))
				{
					this.startTime = Number(imported.startTime);
				}

				if(!isNaN(imported.volume))
				{
					this.volume = Number(imported.volume);
				}

				this.controls = Number(!!imported.controls);
				this.autoplay = Number(!!imported.autoplay);

				if(Array.isArray(imported.cards))
				{
					this.deck = new Set(imported.cards.map(Bindable.make));
				}

				this.videoId = '';

				this.window.onTimeout(100, () => this.videoId = imported.videoId);
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
