import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

export class ImageViewer extends Task
{
	static helpText = 'Image viewer.';

	title     = 'Image Viewer';
	icon      = '/w95/3-16-4bit.png';
	template  = require('./image-viewer.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.args.src = taskPath[0] || '/dawid-zawila-9d33wIMMzoE-unsplash-crop.jpg';
	}
}
