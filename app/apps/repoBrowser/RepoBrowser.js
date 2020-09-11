import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { GitHub } from '../gitHub/GitHub';

import { Folder } from './Folder';
import { Icons as IconControl } from '../../control/Icons';
import { Html as HtmlControl }  from '../../control/Html';
import { Json as JsonControl } from '../../control/Json';
import { Image as ImageControl } from '../../control/Image';
import { Plaintext as PlaintextControl } from '../../control/Plaintext';

import { Console as Terminal } from 'subspace-console/Console';

export class RepoBrowser extends Task
{
	title    = 'Repo Browser';
	icon     = '/w95/73-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.current = null;

		this.window.args.branch = 'master';

		this.window.args.width  = `760px`;
		this.window.args.height = `640px`;

		this.window.selectParent = (event) => {

			if(!this.current.parent || !(this.current.parent instanceof Folder))
			{
				return;
			}

			this.current.parent.select();
			this.current.parent.expand(null, null, true);
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

		this.window.args.repoName = 'seanmorris/nynex95';

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		this.window.args.repoIcons = [];

		this.print(`Scanning repos.`);

		fetch(reposUrl, {headers}).then(r=>r.json()).then((repos)=>{

			this.print(`Scanning complete.`);

			this.window.args.repoIcons = [];

			repos.map(repo => {

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
	}

	attached()
	{
		this.console = new Terminal({scroller:this.window.tags.termscroll.element});

		this.window.args.terminal = this.console;

		this.console.args.prompt = '';

		this.window.args.menuBar  = new MenuBar(this.args, this.window);

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

			folder.select();
		});

		this.window.args.repoUrl = 'https://nynex.unholysh.it/github-proxy/repos/seanmorris/nynex95/';

		this.window.args.bindTo('filename', v => {

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

			switch(filetype)
			{
				// case 'md':
				// case 'html':
				// 	this.window.args.control = new HtmlControl(
				// 		{srcdoc:this.window.args.content}
				// 		, this
				// 	);
				// 	break;

				case 'ico':
				case 'gif':
				case 'png':
				case 'jpg':
				case 'jpeg':
				case 'webp':
					this.window.args.control = new ImageControl(
						{src:this.window.args.url}
						, this
					);
					break;

				case 'json':
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
	}

	print(line)
	{
		if(this.console)
		{
			this.console.args.output.push(line);
		}
	}
}
