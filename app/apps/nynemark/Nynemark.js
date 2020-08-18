import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';


// import { default as SimpleMDE } from "simplemde/src/js/simplemde";
import { default as SimpleMDE } from "simplemde/dist/simplemde.min";

console.log(SimpleMDE);

export class Nynemark extends Task
{
	title    = 'Nynemark 95';
	icon     = '/w98/document-32-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.init = Date.now();

		this.window.args.charCount = 'initializing...';
		this.window.ruleSet.add('textarea', tag => {

			this.editor = new SimpleMDE({element: tag.element});

			this.editor.value("# Welcome to Nynemark\n\nThe Nynex Markdown editor.\n");

		});

		return Bindable.make(this);
	}

	attached()
	{
		// this.window.args.menuBar  = new MenuBar(this.args, this.window);

		this.window.args.bindTo('document', (v,k,t,d) => {

			this.window.args.charCount = v ? v.length : 0;

		});
	}
}
