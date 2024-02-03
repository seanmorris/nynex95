import { FileModel } from "./FileModel";

const openFileDb = FileDatabase.open('files', 1);

export class FileSystem
{
	readDir(path)
	{
		openFileDb.then(fileDb => {
			const query = {
				store:   'files'
				, index: 'directory'
				, range: path
				, type:  FileModel
			};

			return fileDb.select(query);
		});
	}

	readFile()
	{

	}
}
