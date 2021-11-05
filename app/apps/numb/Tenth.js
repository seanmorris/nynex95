import { View } from 'curvature/base/View';

export class Tenth extends View
{
	template = `
		<span>This is the tenth card. It uses an active view:</span>
		<span class = "countdown">[[percent]]%</span>`;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.bindTo(
			'progress'
			, v => this.args.percent = Number(100*v||0).toFixed(0)
		);

		// this.args.countdown = 10;

		// this.timer = this.onInterval(1000, () => {
		// 	this.args.countdown--;
		// });
	}
}
