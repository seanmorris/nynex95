import { Mixin }    from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base//Bindable';

export class CssSwitch extends Mixin
{
	after__constructor()
	{
		this.classes = Bindable.makeBindable({});

		this.classes.bindTo(
			(v,k) => this.args.classes = Object.assign({}, this.classes)
			, {frame: 1}
		);
	}
}
