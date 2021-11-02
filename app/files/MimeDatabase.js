import { Database } from 'curvature/model/Database';

export class MimeDatabase extends Database
{
	_version_1(database)
	{
		const mimeStore = this.createObjectStore('mime-types', {keyPath: 'extension'});

		mimeStore.createIndex('extension', 'extension', {unique: true});

		mimeStore.createIndex('type', 'type', {unique: false});
		mimeStore.createIndex('icon', 'icon', {unique: false});
	}
}
