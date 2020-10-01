import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { GitHub } from '../gitHub/GitHub';

import { Folder } from './Folder';
import { Icons as IconControl } from '../../control/Icons';
import { Html as HtmlControl }  from '../../control/Html';
import { Markdown as MarkdownControl }  from '../../control/Markdown';
import { Json as JsonControl } from '../../control/Json';
import { Image as ImageControl } from '../../control/Image';
import { Plaintext as PlaintextControl } from '../../control/Plaintext';

import { Console as Terminal } from 'subspace-console/Console';

export class RepoBrowser extends Task
{
	title    = 'Repo Browser';
	icon     = '/w95/73-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList, taskCmd = '', taskPath = [])
	{
		super(taskList, taskCmd, taskPath);

		console.log(taskPath);

		this.username = taskPath.shift() || 'seanmorris';
		this.reponame = taskPath.shift() || 'nynex95';
		this.filepath = taskPath.join('/');

		this.current = null;

		this.window.args.branch = 'master';

		this.window.args.width  = `760px`;
		this.window.args.height = `640px`;

		this.window.args.viewRaw = 'view-control-rendered';

		this.window.args.hasSource = false;

		this.window.viewControl = (type) => {
			this.window.args.viewRaw = `view-control-${type}`;
		}

		this.window.selectParent = (event) => {

			console.log(this.parent);

			// if(!this.parent || !(this.parent instanceof Folder))
			// {
			// 	return;
			// }

			this.parent.select();

			if(this.parent instanceof Folder)
			{
				this.parent.expand(null, null, true);
			}

		};

		this.window.classes['hide-right'] = true;

		this.window.save = (event) => {

			const raw     = this.window.args.control.args.content

			console.log(raw);

			// const branch  = 'nynex-changes';
			const branch  = 'master';
			const message = 'Nynex self-edit.';
			const content = btoa(unescape(encodeURIComponent(raw)));
			const sha     = this.window.args.control.args.sha;
			const url     = new URL(this.window.args.control.args.url).pathname;

			const gitHubToken = GitHub.getToken();
			const postChange  = {message, content, sha};

			const headers = {
				'Content-Type': 'application/json'
				, accept:       'application/vnd.github.v3.json'
			};

			if(gitHubToken && gitHubToken.access_token)
			{
				headers.authorization = `token ${gitHubToken.access_token}`;
			}

			const method = 'PUT';
			const body   = JSON.stringify(postChange)

			console.log(body);

			return fetch(
				'https://nynex.unholysh.it' + url
				, {method, headers, body}
			).then(response => response.json());
		}

		this.window.toggleSection = (section) => {

			console.log(section,this.window.classes);

			const clas = 'hide-' + section;

			this.window.classes[clas] = !!!this.window.classes[clas];

			const centerCol = this.window.findTag('[data-center-col]');

			console.log(centerCol);

			if(centerCol)
			{
				centerCol.style.minWidth = '';
				centerCol.style.height   = '';
			}
		}

		const gitHubToken = GitHub.getToken();
		const reposUrl    = 'https://nynex.unholysh.it/github-proxy/user/repos'
		const headers     = {};

		this.endpoint = 'https://nynex.unholysh.it/github-proxy/';
		this.endpointRepos = `${this.endpoint}repos/`

		this.startingRepo = `${this.username || 'seanmorris'}/${this.reponame || 'nynex95'}`;

		this.window.args.repoUrl = `${this.endpointRepos}${this.startingRepo}/`;

		this.window.args.repoName = this.startingRepo;

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		this.window.args.repoIcons = false;

		this.print(`Scanning repos.`);

		this.window.args.repos = false;

		fetch(reposUrl, {headers}).then(r=>r.json()).then((repos)=>{

			this.print(`Scanning complete.`);

			if(!repos)
			{
				return;
			}

			this.window.args.repoIcons = [];

			repos.map && repos.map(repo => {

				this.window.args.repos = true;

				this.print(`Found repo ${repo.name}`);

				this.window.args.repoIcons.push(new Icon({
					action: () => {
						this.window.args.repoName = repo.full_name;
						this.window.args.repoUrl  = repo.url;
					}
					, name:  repo.name
					, icon: 'network_drive'
					, path: 'w98'
					, bits: 4
				}));
			});
		});

		const home = Home.instance();

		this.window.githubLogin = (event) => {
			home.run('github');
		};
	}

	attached()
	{
		this.console = new Terminal({scroller:this.window.tags.termscroll.element});

		this.window.args.terminal = this.console;

		this.console.args.prompt = '';

		// this.window.args.menuBar  = new MenuBar(this.args, this.window);

		this.window.args.filetype = '';
		this.window.args.chars    = '';

		this.window.classes['repo-browser'] = true;

		this.window.args.bindTo('repoUrl', v => {

			this.window.args.files = [];

			if(!v)
			{
				return;
			}

			this.print(`Scanning repo @ ${v}.`);

			const folder = new Folder({
				expanded:  true
				, browser: this
				, url:     v + '/contents?ref=master&t=' + Date.now()
			}, this.window);

			this.window.args.files.push(folder);

			if(!this.filepath)
			{
				folder.select();
			}
			else
			{
				folder.expand();
			}
		});

		this.window.args.bindTo('filename', v => {

			console.log(v, this.window.args.url);

			const gitHubToken = GitHub.getToken();

			const filetype = (v||'').split('.').pop();

			if(this.window.args.control)
			{
				this.window.args.control.remove();
			}

			if(!v)
			{
				return;
			}

			this.window.args.filetype = filetype || '';

			this.window.args.chars = 0;

			this.window.args.plain = new PlaintextControl(
				{
					filetype
					, sha: this.window.args.sha
					, url: this.window.args.url
					, content: this.window.args.content
				}
				, this
			);

			this.window.args.hasSource = false;

			switch(filetype)
			{
				case 'md':
					this.window.args.hasSource = true;
					this.window.args.control = new MarkdownControl({
						source: this.window.args.content
					});
					break;

				case 'html':
					this.window.args.hasSource = true;
					this.window.args.control = new HtmlControl(
						{srcdoc:this.window.args.content}
						, this
					);
					break;

				case 'ico':
				case 'gif':
				case 'png':
				case 'jpg':
				case 'jpeg':
				case 'webp':
					this.window.args.viewRaw = 'view-control-rendered';
					this.window.args.control = new ImageControl(
						{src:this.window.args.url}
						, this
					);
					break;

				case 'json':
					this.window.args.hasSource = true;

					this.window.args.control = new JsonControl(
						{
							expanded: 'expanded'
							, tree: this.window.args.content
								? JSON.parse(this.window.args.content)
								: []
						}
						, this
					);
					break;

				default:
					this.window.args.control = new PlaintextControl(
						{
							filetype
							, sha: this.window.args.sha
							, url: this.window.args.url
							, content: this.window.args.content
						}
						, this
					);
					break;
			}

			this.window.args.chars = (this.window.args.content||'').length;
		});

		if(this.filepath)
		{
			const headers = {
				accept: 'application/vnd.github.v3.json'
			};

			const fileUrl = this.window.args.repoUrl+ 'contents/' + this.filepath;

			console.log(fileUrl);


			fetch(fileUrl, {headers}).then(r=>r.json()).then(file=>{
				const type = file.name.split('.').pop();

				const renderable = (type === 'md' || type === 'html');

				const url = renderable
					? file.download_url
					: file.download_url;

				console.log(url, type, renderable, file);

				fetch(url, {headers}).then(r => r.text()).then(body => {
					this.window.args.content  = body;
					this.window.args.url      = file.url;
					this.window.args.sha      = file.sha;
					this.window.args.filename = file.name;
				});
			});
		}
	}

	print(line)
	{
		if(this.console)
		{
			this.console.args.output.push(line);
		}
	}
}
