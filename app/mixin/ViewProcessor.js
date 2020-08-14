import { Mixin } from 'curvature/base/Mixin';

export class ViewProcessor extends Mixin
{
	join(list)
	{
		if(!Array.isArray(list) && typeof list !== 'object')
		{
			list = [list];
		}
		else if(!Array.isArray(list) && typeof list === 'object')
		{
			list = Object.keys(list).filter((key)=>{
				return list[key];
			});
		}

		return list.join(' ');
	}

	_count(list)
	{
		console.log(list);

		if(!Array.isArray(list) && typeof list !== 'object')
		{
			list = [list];
		}
		else if(!Array.isArray(list) && typeof list === 'object')
		{
			list = Object.keys(list).filter((key)=>{
				return list[key];
			});
		}

		return list.length || 0;
	}
}

