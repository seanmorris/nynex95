import { Mixin }    from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base//Bindable';

const priv = Symbol('priv');

export class Sealed extends Mixin
{
	before__constructor()
	{
		Object.seal(this);
	}
}
