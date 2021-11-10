import { View } from 'curvature/base/View';
import { MenuBar } from '../../window/MenuBar';

export class Message extends View
{
	constructor(args, parent)
	{
		const menus = {
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

		super(args, parent);

		this.args.menuBar = new MenuBar({menus});

		this.template  = require('./message.tmp');
	}
}
