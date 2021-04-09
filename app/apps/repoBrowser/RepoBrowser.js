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
	useProxy = false;

	constructor(taskList, taskCmd = '', taskPath = [])
	{
		super(taskList, taskCmd, taskPath);

		this.username = taskPath.shift()   || 'seanmorris';
		this.reponame = taskPath.shift()   || 'nynex95';
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

			if(!this.parent)
			{
				return;
			}

			this.parent.select();

			if(this.parent instanceof Folder)
			{
				this.parent.expand(null, null, true);
			}

		};

		this.window.classes['hide-right'] = true;

		this.window.save = (event) => {

			const raw = this.window.args.plain.args.content;

			const branch  = 'master';
			const message = 'Nynex self-edit.';
			const content = btoa(unescape(encodeURIComponent(raw)));
			const sha     = this.window.args.sha;

			// const url = new URL(this.window.args.url).pathname;

			const postChange  = {message, content, sha};

			const headers = {
				'Content-Type': 'application/json'
				, Accept:       'application/vnd.github.v3.json'
			};

			const gitHubToken = GitHub.getToken();

			let loginPromise = Promise.resolve();

			if(gitHubToken && gitHubToken.access_token)
			{
				headers.Authorization = `token ${gitHubToken.access_token}`;
			}
			else
			{
				loginPromise = home.run('github').thread

				loginPromise.then(result=>{
					this.window.args.repoIcons = [];
					this.loadRepos();
				});
			}

			loginPromise.then(()=>{
				const gitHubToken = GitHub.getToken();
				const method = 'PUT';
				const body   = JSON.stringify(postChange);
				const mode   = 'cors';

				const credentials = 'omit';

				if(gitHubToken && gitHubToken.access_token)
				{
					headers.Authorization = `token ${gitHubToken.access_token}`;
				}
				else
				{
					return;
				}

				return fetch(
					this.window.args.repoUrl
						+ '/contents/'
						+ this.window.args.filepath
						+ (this.window.args.filepath ? '/' : '')
						+ this.window.args.filename
					, {method, headers, body, mode}
				).then(response => response.json()
				).then(json => {
					this.window.args.sha = json.content.sha;
				});
			});
		}

		this.window.toggleSection = (section) => {

			const clas = 'hide-' + section;

			this.window.classes[clas] = !!!this.window.classes[clas];

			const center   = this.window.findTag('[data-center-col]');
			const control  = this.window.findTag('[data-control-sector]')
			const terminal = this.window.findTag('[data-terminal-sector]');

			if(center)
			{
				center.style.minWidth = null;
				center.style.height   = null;
			}

			if(control)
			{
				control.style.maxHeight = null;
				control.style.height    = null;
			}

			if(terminal)
			{
				terminal.style.maxHeight = terminal.style.minHeight || '5em';
				terminal.style.height    = null;
			}
		}

		const home = Home.instance();

		this.window.githubLogin = (event) => {

			home.run('github').thread.then(result=>{

				this.window.args.repoIcons = [];
				this.loadRepos();

			});
		};

		this.window.onRendered = () => {
			this.console = new Terminal({scroller: this.window.tags.termscroll.element });

			this.console.addEventListener('listRendered', event => {
				this.window.onTimeout(300, () => {
					const height = this.window.tags.termscroll.element.clientHeight;
					const scroll = this.window.tags.termscroll.element.scrollHeight;

					this.window.tags.termscroll.scrollTo({
						top: scroll + height, behavior: 'smooth'
					});
				});
			});

			this.window.args.terminal = this.console;

			this.console.args.prompt = '';

			// this.window.args.menuBar  = new MenuBar(this.args, this.window);

			this.window.args.filetype = '';
			this.window.args.chars    = '';

			this.window.classes['repo-browser'] = true;

			this.window.args.bindTo('repoUrl', v => {

				this.print(`Scanning repository @ ${v}.`);

				this.window.args.files = [];

				if(!v)
				{
					return;
				}

				const folder = new Folder({
					expanded:   true
					, browser:  this
					, pathOpen: this.filepath
					, url:      v + '/contents?ref=master&t=' + Date.now()
				}, this.window);

				this.window.args.files.push(folder);

				if(!this.filepath)
				{
					this.window.onNextFrame(()=>this.loadFile('README.md'));
				}
				else
				{
					// this.window.onNextFrame(()=>this.loadFile(this.filepath));
					// folder.select();
				}

				this.loadRepos();

				folder.expand();
			});

			this.window.args.bindTo('filename', v => {

				// v && this.print(`Loading file: "${v}"`);

				if(this.window.args.plain)
				{
					this.window.args.plain.remove();
					this.window.args.plain = '';
				}

				if(this.window.args.control)
				{
					this.window.args.control.remove();
					this.window.args.control = '';
				}

				if(!v)
				{
					return;
				}

				const gitHubToken = GitHub.getToken();
				const filetype = (v||'').split('.').pop();

				this.window.args.filetype = filetype || '';

				this.window.args.chars = 0;

				this.window.args.hasSource = false;

				this.window.args.plain   = new PlaintextControl(
					this.window.args, this
				);

				this.window.args.plain.args.url = this.window.args.url;

				switch(filetype)
				{
					case 'md':
						this.window.args.viewRaw   = 'view-control-rendered';

						this.window.args.hasSource = true;

						this.window.args.control = new MarkdownControl(
							{content:''}, this
						);

						break;

					case 'html':
						this.window.args.viewRaw   = 'view-control-rendered';

						this.window.args.hasSource = true;

						this.window.args.control = new HtmlControl(
							{content:''}, this
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
							{src:this.window.args.download}
							, this
						);
						break;

					case 'json':
						this.window.args.hasSource = true;

						this.window.args.expanded = true;
						this.window.args.control = new JsonControl(
							{
								expanded:  true
								, content: ''
							}, this
						);

						break;

					default:
						this.window.args.viewRaw = 'view-control-plain';
						this.window.args.control = new PlaintextControl(
							{content:''}, this
						);
						break;
				}

				this.window.args.control.args.content = this.window.args.content || '';

				this.window.args.chars = (this.window.args.content||'').length;
			});

			this.window.args.bindTo('content', v => {
				if(this.window.args.control)
				{
					this.window.args.control.args.content = v;
				}
				if(this.window.args.plain)
				{
					this.window.args.plain.args.content = v;
				}
			});

			this.window.addEventListener('resized', (event) => {
				if(this.window.args.control && this.window.args.control.resize)
				{
					this.window.args.control.resize();
				}
				if(this.window.args.plain && this.window.args.plain.resize)
				{
					this.window.args.plain.resize();
				}
			});

			if(this.filepath)
			{
				// this.loadFile(this.filepath);
			}
		};

		this.endpoint = this.useProxy
			? 'https://nynex.seanmorr.is/github-proxy/'
			: 'https://api.github.com/'
		;

		this.endpointRepos = `${this.endpoint}repos`
		this.startingRepo  = `${this.username || 'seanmorris'}/${this.reponame || 'nynex95'}`;

		this.window.args.repoUrl   = `${this.endpointRepos}/${this.startingRepo}`;
		this.window.args.repoName  = this.startingRepo;
		this.window.args.repoIcons = false;

		this.window.args.repoIcons = [];
	}

	print(line)
	{
		if(this.console)
		{
			this.console.args.output.push(line);
		}
	}

	loadFile(filepath)
	{
		const headers = {Accept: 'application/vnd.github.v3.json'};

		const gitHubToken = GitHub.getToken();

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		const fileUrl = this.window.args.repoUrl
			+ '/contents/'
			+ filepath;

		fetch(fileUrl, {headers}).then(r=>r.json()).then(file=>{

			if(!file || !file.name)
			{
				this.window.args.url      = '';
				this.window.args.sha      = '';
				this.window.args.content  = '';
				this.window.args.filename = '';
				return;
			}

			const type = file.name.split('.').pop();

			const renderable = (type === 'md' || type === 'html');

			const url = file.download_url
				? file.download_url
				: file.url;

			this.window.args.url      = file.url;
			this.window.args.download = url;
			this.window.args.sha      = file.sha;

			if(file.content)
			{
				try
				{
					this.window.args.content = decodeURIComponent(escape(atob(file.content)));
				}
				catch(error)
				{
					console.warn(error);
				}
			}

			this.window.args.filename = file.name;
		});
	}

	loadRepos(page = 0)
	{
		const gitHubToken = GitHub.getToken();

		page || this.print(`Scanning for repositories...`);

		this.window.args.repos = this.window.args.repos || false;

		const reposUrl = `${this.endpoint}user/repos?per_page=100&page=${1+parseInt(page)}`
		const headers  = {};

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		fetch(reposUrl, {headers}).then(r=>r.json()).then((repos)=>{

			if(!repos || !repos.length)
			{
				return;
			}

			repos.map && this.window.args.repoIcons.push(...repos.map(repo => {

				this.window.args.repos = true;

				this.print(`Found repo "${repo.name}"`);

				return new Icon({
					action: () => {
						this.window.args.repoName = repo.full_name;
						this.window.args.repoUrl  = repo.url;
					}
					, name:  repo.name
					, icon: 'network_drive'
					, path: 'w98'
					, bits: 4
				});
			}));

			if(repos && repos.length)
			{
				this.loadRepos(page + 1);
			}
		});
	}
}
