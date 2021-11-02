import { Mixin }    from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base/Bindable';

const target = Symbol('target');

export class Target extends Mixin
{
	after__constructor()
	{
		try
		{
			this[target] = new EventTarget;
		}
		catch(error)
		{
			this[target] = document.createDocumentFragment();
		}
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
