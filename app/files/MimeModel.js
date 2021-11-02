import { Model } from 'curvature/model/Model';

export class MimeModel extends Model
{
	static get keyProps(){ return ['extension'] }

	extension;
	actions = {};
	type;
	icon;
}
