import { View } from 'curvature/base/View';
import { MeltingText } from 'subspace-console/view/MeltingText';

export class Login extends View
{
	template = require('./login.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.melting = new MeltingText;
	}

	login()
	{
		this.parent.matrix.initSso(location.origin + '/accept-sso');
	}
}
