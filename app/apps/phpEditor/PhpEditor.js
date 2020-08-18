import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class PhpEditor extends Task
{
	title    = 'SM PHP Editor';
	icon     = '/apps/php-16-24bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.loading = true;
		this.window.classes.phpEditor = true;

		this.window.args.status = 'initializing...';

		const php = new ( require('php-wasm/Php').Php );

		this.init = Date.now();

		php.addEventListener('ready', () => {
			this.window.classes.loading = false;
			this.window.args.status = 'PHP Ready!';

			php.run(this.window.args.input);
		});

		this.window.args.output = '';

		php.addEventListener('output', event => {
			this.window.classes.loading = false;
			this.window.args.status = 'PHP Ready!';

			this.window.args.output += event.detail.join("\n");
		});

		this.window.click = (event) => {

			this.window.classes.loading = true;
			this.window.args.status = 'PHP Running...';

			this.window.args.output = '';

			this.window.onIdle(()=>php.run(this.window.args.input));

		};

		this.window.args.input =
`<?php

class HelloWorld
{
    public function __toString()
    {
        return "Hello, world!";
    }
}

print new HelloWorld;`;

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
