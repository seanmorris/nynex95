import { Mixin }    from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base/Bindable';

export const CssSwitch = {
	[Mixin.Constructor]: function()	{

		this.classes = Bindable.makeBindable({});

		this.args.classes = this.args.classes || Bindable.makeBindable([]);

		this.classes.bindTo(
			(v,k) => {
				this.args.classes = Object.keys(this.classes).filter(k => this.classes[k] && k);
			}
			, {wait: 0}
		);
	}
}
