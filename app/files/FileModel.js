import { Model } from 'curvature/model/Model';

export class FileModel extends Model
{
	static get keyProps(){ return ['path'] }

	created;
	accessed;
	lastModified;
	directory;
	buffer;
	path;
	size;
	type;
	link;

	static createFile()
	{
		const file = new FileModel;

		file.consume({
			created: Date.now()
			, accessed: Date.now()
			, lastModified: Date.now()
		});
	}

	symlink()
	{
		const link = FileModel.createFile();

		link.consume({link: this.path});
	}
}
