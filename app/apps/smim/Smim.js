import { Bindable  } from 'curvature/base/Bindable';
import { Tag  } from 'curvature/base/Tag';
import { Task } from 'task/Task';

import { Login } from './Login';
import { FriendsList } from './FriendsList';

import { MenuBar } from '../../window/MenuBar';

import { Matrix } from 'matrix-api/Matrix';

const matrix = new Matrix;

export class Smim extends Task
{
	title    = 'SMIM';
	template = require('./main.tmp');
	width    = '300px';
	height   = '600px';

	matrix   = matrix;

	menus = {
		File: {
			// New: { callback: () => this.newDocument() }
			Quit: { callback: () => this.quit() }
		}
		, Edit: {
			Settings: { callback: () => {} }
		}
		, Help: {
			About: { callback: () => this.aboutDialog() }
		}
	};

	commands = { q: () => this.quit() };

	menuBar = new MenuBar(this, this.window);

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.controller = this.window.controller = this;

		this.main = new Login({}, this);

		const rooms = this.rooms = {};

		matrix.addEventListener('logged-in', event => {
			this.main = new FriendsList({rooms}, this);

			matrix.listenForServerEvents();

			this.syncMatrix();
		});
	}

	syncMatrix()
	{
		matrix.sync().then(response => {
			console.log(response);

			if(!response || !response.rooms || !response.rooms.join)
			{
				return;
			}

			const rows = Bindable.make([]);

			this.main.args.gridList.records.add({});

			const card = this.main.args.gridList.args.cards.list[0];

			Object.entries(response.rooms.join).forEach(([room, state]) => {

				console.log({room, state});
				// console.log({room, unread: state['org.matrix.msc2654.unread_count']});
				// card.records.add({room, unread: state['org.matrix.msc2654.unread_count']});
				card.records.add({room, unread: state.unread_notifications.notification_count});

				if(!state || !state.timeline)
				{
					return;
				}

				// if(state.timeline.events)
				// {
				// 	state.timeline.events.forEach(chunk => {
				// 		chunk.room_id = room;

				// 		const event = MatrixEvent.from(chunk);

				// 		const store = 'events';
				// 		const index = 'event_id';
				// 		const range = event.event_id;
				// 		const type  = MatrixEvent;

				// 		database.select({store, index, range, type}).one().then(res => {

				// 			if(response.index)
				// 			{
				// 				res.result.consume(chunk);

				// 				database.update('events', response.result);
				// 			}
				// 			else
				// 			{
				// 				database.insert('events', event);
				// 			}
				// 		});
				// 	});
				// }

				if(!state.timeline.prev_batch)
				{
					return;
				}

				// const lowWater = localStorage.getItem('room-lowWater::' + room);
				const lowWater = 0;

			// 	matrix.syncRoomHistory(
			// 		room
			// 		, lowWater || state.timeline.prev_batch
			// 		, chunk => {

			// 			console.log(chunk);

			// 			// const event = MatrixEvent.from(chunk);

			// 			// const store = 'events';
			// 			// const index = 'event_id';
			// 			// const range = event.event_id;
			// 			// const type  = MatrixEvent;

			// 			// const query = {store, index, range, type};

			// 			// database.select(query).one().then(res => {
			// 			// 	if(res.index)
			// 			// 	{
			// 			// 		res.record.consume(chunk);

			// 			// 		database.update('events', res.record);
			// 			// 	}
			// 			// 	else
			// 			// 	{
			// 			// 		database.insert('events', event);
			// 			// 	}
			// 			// });
			// 		}
			// 	);
			});
		});
	}

	aboutDialog()
	{
		const aboutArgs = {
			template: require('./about.tmp')
			, title:  'About...'
			, width:   '300px'
			, height:  '350px'
		};

		const subWindow = this.openSubWindow(aboutArgs);

		subWindow.focus();
	}

	quit()
	{
		this.window.close();
	}
}
