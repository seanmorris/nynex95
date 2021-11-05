import { Task } from 'task/Task';
import { Diskette } from '../../widgets/diskette/Diskette';

export class WidgetViewer extends Task
{
	static helpText = 'Widget viewer';

	template = require('./widgetViewer.tmp');
	title    = 'WidgetViewer';
	icon     = '/w95/3-16-4bit.png';
	prompt   = '>>';
	// silent   = true

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.args.widget = new Diskette;

		this.window.args.width  = `540px`;
		this.window.args.height = `560px`;

		this.window.args.width  = `286px`;
		this.window.args.height = `320px`;

		this.window.maximize = () => {};

		this.window.classes.focused = false;

		this.window.classes['widget-viewer-win'] = true;

		this.window.classes.transparent = true;
		this.window.classes.pane        = false;
	}
}
