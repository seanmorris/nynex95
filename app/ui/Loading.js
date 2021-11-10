import { View } from 'curvature/base/View';

class Circle extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template         = require('./circle.tmp');
		this.args.repeatCount = 'indefinite';
		this.args.color       = this.args.color || '000';
		this.args.speed       = this.args.speed ||0.333;

		this.args.bindTo('speed', v=>{
			this.args.halfSpeed = v*3;
		});
	}
}

export class Loading extends View
{
	template = `<div class = "loading">[[spinner]]</loading>`;

	constructor(args,parent)
	{
		super(args, parent);

		this.args.spinner = new Circle;
	}
}
