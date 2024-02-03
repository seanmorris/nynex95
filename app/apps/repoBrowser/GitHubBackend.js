import { Router } from "curvature/base/Router";
import { GitHub } from "../gitHub/GitHub";
import { Folder as Resource } from "./Folder";
import { mapUri } from "./MapUri";

export class GitHubBackend
{
	populate({uri, folder, pathOpen, browser})
	{
		// const parsedUri = new URL(uri);
		// const pathname  = parsedUri.pathname.substr(2);
		// const url = `https://api.github.com/repos/${pathname}${parsedUri.search}`;

		const url = uri;

		const gitHubToken = GitHub.getToken();

		const headers = { Accept: 'application/vnd.github.v3.json' };

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		return fetch(url, {headers}).then(r => r.json()).then(files => {

			const result = [];

			if(Array.isArray(files))
			{
				files.sort((a, b) => {

					if(a.type !== 'dir' && b.type !== 'dir')
					{
						return 0;
					}

					if(a.type !== 'dir')
					{
						return 1;
					}

					if(b.type !== 'dir')
					{
						return -1;
					}
				});

				files.map((file, key) => {
					const name = file.name;
					const img  = file.type === 'dir'
						? '/w95/4-16-4bit.png'
						: '/w95/60-16-4bit.png';

					const resource = new Resource({
						browser
						, url: file.url
						, icon: img
						, name
						, file
						, pathOpen
					}, folder);

					folder.files[name] = resource;

					result.push(resource);

					folder.onTimeout(key * 16, () => folder.args.files.push(resource));
				});

				return new Promise(accept => {
					folder.onTimeout(files.length*20, () => accept(files));
				});
			}
			else
			{
				const file = files;
				browser.window.args.download = file.download_url;
			}
		});
	}

	displayFile({file, dir, browser})
	{
		const name = file.name;
		const type = name.split('.').pop();

		if(file.type === 'file')
		{
			browser.window.args.content  = '';
			browser.window.args.url      = '';
			browser.window.args.filename = '';
		}

		const gitHubToken = GitHub.getToken();

		const headers = {};

		const renderable = (type === 'md' || type === 'html');

		headers.Accept = 'application/vnd.github.v3.raw';

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		const url = (file.download_url
			? file.download_url
			: file.url
		) + `?t_=${Date.now()}`;

		if(file.path)
		{
			const path = `/${browser.repoName}/${file.path}`;
			Router.go(`/${browser.cmd}${path}`, 2);
		}

		browser.window.args.url = url;
		browser.window.args.sha = file.sha;

		if(file.content)
		{
			browser.window.args.content  = decodeURIComponent(escape(atob(file.content)));
			browser.window.args.filename = file.name;
		}
		else
		{
			const credentials = 'omit';
			const mode = 'cors';
			fetch(url).then(r => r.text()).then(body => {
				browser.window.args.content  = body;
				browser.window.args.filename = file.name;
				browser.parent               = dir;
			});
		}
	}

	loadFile({uri, browser, filepath})
	{
		// const parsedUri = new URL(uri);
		// const pathname  = parsedUri.pathname.substr(2);
		// const url = `https://api.github.com/repos/${pathname}${parsedUri.search}`;

		const url = uri;

		const headers = {Accept: 'application/vnd.github.v3.json'};

		const gitHubToken = GitHub.getToken();

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		return fetch(url, {headers}).then(r=>r.json()).then(file => {

			if(!file || !file.name)
			{
				browser.window.args.url      = '';
				browser.window.args.sha      = '';
				browser.window.args.content  = '';
				browser.window.args.filename = '';
				browser.window.args.filepath = '';

				return;
			}

			const type = file.name.split('.').pop();

			const renderable = (type === 'md' || type === 'html');

			const url = file.download_url
				? file.download_url
				: file.url;

			browser.window.args.url      = file.url;
			browser.window.args.download = url;
			browser.window.args.sha      = file.sha;

			browser.window.args.filepath = filepath;

			if(file.content)
			{
				try
				{
					browser.window.args.content = decodeURIComponent(escape(atob(file.content)));
				}
				catch(error)
				{
					console.warn(error);
				}
			}

			browser.window.args.filename = file.name;
		});
	}

	saveFile()
	{

	}
}
