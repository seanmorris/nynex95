import { View } from 'curvature/base/View';
import { GridList } from '../../control/GridList';

import { Message } from './Message';

export class FriendsList extends View
{
	template = require('./friends-list.tmp');

	constructor(args = [], parent)
	{
		super(args, parent);

		this.args.gridList = new GridList;
	}

	handleInfoClicked(event)
	{
		console.log(document.activeElement);
	}

	handleMsgClicked(event)
	{
		const subwindowArgs = {
			template: new Message
			, title:  'Message...'
			, width:   '400px'
			, height:  '350px'
		};

		const subWindow = this.parent.openSubWindow(subwindowArgs);

		subWindow.focus();
	}

	handleButtonMouseDown(event)
	{
		event.preventDefault();
	}
}
