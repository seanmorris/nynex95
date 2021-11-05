import { View } from 'curvature/base/View';

export class Card extends View
{
	template = `
	<div class = "video-card [[class]]"
		data-starting = "[[starting]]"
		data-removing = "[[removing]]"
		style = "--progress:[[progress]];--timing:[[timing]];"
	>
		<div class = "content">[[content]]</div>
		<div class = "progress-track">
			<div class = "progress-indicator"></div>
		</div>
	</div>`

	constructor(args, parent)
	{
		super(args, parent);

		if(this.args.content instanceof View)
		{
			this.args.bindTo((v,k) => {
				if(k !== 'content')
				{
					this.args.content.args[k] = v;
				}
			});
		}
	}
}
