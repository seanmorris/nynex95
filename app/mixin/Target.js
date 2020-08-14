import { Mixin }    from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base//Bindable';

const target = Symbol('target');

export class Target extends Mixin
{
	after__constructor()
	{
		this[target] = new EventTarget;
	}

	dispatchEvent(...args)
	{
		this[target].dispatchEvent(...args);
	}

	addEventListener(...args)
	{
		this[target].addEventListener(...args);
	}

	removeEventListener(...args)
	{
		this[target].removeEventListener(...args);
	}
}
