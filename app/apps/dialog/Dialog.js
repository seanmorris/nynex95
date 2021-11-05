import { Task } from 'task/Task';

export class Dialog extends Task
{
	template = require('./dialog.html');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);
	}
}
