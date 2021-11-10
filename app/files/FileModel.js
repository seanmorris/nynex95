import { Model } from 'curvature/model/Model';

import { Icon } from '../icon/Icon';

import { MimeModel } from '../files/MimeModel';
import { MimeDatabase } from '../files/MimeDatabase';

import { FileDatabase } from '../files/FileDatabase';

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

	getUrl()
	{
		return URL.createObjectURL(
			new Blob([this.buffer])
			, {type: this.type}
		);
	}

	getIcon()
	{
		const query = {
			store:   'mime-types'
			, index: 'type'
			, range: this.type
			, type:  MimeModel
		};

		if(this.name.match(/\.\w+$/))
		{
			const extension = this.name.split('.').pop();

			query.index = 'extension';
			query.range = '.' + extension;
		}

		return MimeDatabase.open('mime-types', 1)
		.then(mimeDb => mimeDb.select(query).one().then(result => {

			let path = 'w95'
			let icon = 1;

			if(result.result && result.result.icon)
			{
				icon = result.result.icon.icon;
				path = result.result.icon.path;
			}

			return new Icon({
				action: () => FileModel.runFile(this)
				, name: this.name
				, type: this.type
				, bits: 4
				, icon
				, path
			});
		}));
	}

	static runFile(file)
	{
		const query = {
			store:   'mime-types'
			, index: 'type'
			, range: file.type
			, type:  MimeModel
		};

		if(file.name.match(/\.\w+$/))
		{
			const extension = file.name.split('.').pop();

			query.index = 'extension';

			query.index = 'extension';
			query.range = '.' + extension;
		}

		return MimeDatabase.open('mime-types', 1)
		.then(mimeDb => mimeDb.select(query).one().then(result => {

			console.log(result);

			if(!result.index)
			{
				return;
			}

			const mime = result.result;

			if(mime.actions.open)
			{
				const openString = mime.actions.open;

				const cmdArgs = [
					file.buffer
						? file.getUrl()
						: ( file.path + '/' + file.name )
				];

				return [openString, cmdArgs];
			}
		}));
	}
}
