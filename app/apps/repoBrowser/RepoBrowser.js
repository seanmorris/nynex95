import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { Folder } from './Folder';

export class RepoBrowser extends Task
{
	title    = 'Repo Browser';
	icon     = '/w95/73-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);
	}

	attached()
	{
		this.window.args.files = this.window.args.files || [];
		this.window.args.files.push(new Folder({browser:this}));

		// fetch('https://api.github.com/repos/seanmorris/nynex95/contents')
		// .then(response => response.json())
		// .then(files => {

		// 	this.window.args.files = files;

		// 	this.window.args.files.map(f => {

		// 		console.log(f = Bindable.make(f));

		// 		f.subfiles = []

		// 		return f;
		// 	});

		// 	console.log(this.window.args.files);

		// });
	}
}
