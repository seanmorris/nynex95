import { Task } from 'task/Task';
import { Diskette } from '../../widgets/diskette/Diskette';

export class WidgetViewer extends Task
{
	title    = 'WidgetViewer';
	icon     = '/w95/3-16-4bit.png';
	template = require('./widgetViewer.tmp');
	// silent   = true

	constructor(taskList)
	{
		super(taskList);

		this.window.args.widget = new Diskette;

		this.window.args.width  = `540px`;
		this.window.args.height = `560px`;

		this.window.args.width  = `286px`;
		this.window.args.height = `320px`;

		this.window.maximize = () => {};
	}

	attached()
	{
		this.window.classes.focused = false;

		this.window.classes['widget-viewer-win'] = true;

		this.window.classes.transparent = true;
		this.window.classes.pane        = false;
	}
}
