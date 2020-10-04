import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { PhpWeb as PHP } from 'php-wasm/PhpWeb';

export class Drupal extends Task
{
	title    = 'Drupal 7';
	icon     = '/apps/drupal-16-24bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.init = Date.now();

		this.php = new PHP({locateFile: (x) => `/${x}`});

		this.window.classes.loading = true;

		this.window.args.content = '';

		this.php.addEventListener('ready', () => {
			this.window.classes.loading = false;

			this.php.run(require('./init.tmp.php'));

			if(navigator.serviceWorker)
			{
				navigator.serviceWorker.addEventListener(
					'message', event => this.navigate(event.data)
				);
			}
		});

		this.php.addEventListener('output', event => {
			if(!event.detail)
			{
				return;
			}

			const html = event.detail.join("\n");

			this.window.args.content += html;
		});

		return Bindable.make(this);
	}

	attached()
	{
		// this.window.args.menuBar  = new MenuBar(this.args, this.window);

		this.window.args.bindTo('document', (v,k,t,d) => {

			this.window.args.charCount = v ? v.length : 0;

		});
	}

	navigate({path, method, _GET, _POST})
	{
		this.window.args.content = '';
		const code = `
<?php
ini_set('session.save_path', '/home/web_user');
session_id('fake-cookie');
session_start();

$stdErr = fopen('php://stderr', 'w');
$errors = [];

fwrite($stdErr, json_encode(['session' => $_SESSION]) . "\n");

register_shutdown_function(function() use($stdErr){
	fwrite($stdErr, json_encode(['session_id' => session_id()]) . "\n");
	fwrite($stdErr, json_encode(['headers'=>headers_list()]) . "\n");
	fwrite($stdErr, json_encode(['errors' => error_get_last()]) . "\n");
	fwrite($stdErr, json_encode(['session' => $_SESSION]) . "\n");
});

set_error_handler(function(...$args) use($stdErr, &$errors){
	fwrite($stdErr, json_encode($args, JSON_PRETTY_PRINT) . "\n" );
});

$request = (object) json_decode(
	'${ JSON.stringify({path, method, _GET, _POST}) }'
	, JSON_OBJECT_AS_ARRAY
);

parse_str(substr($request->_GET, 1), $_GET);

$_POST = $request->_POST;

$origin  = 'http://localhost:3333';
$docroot = '/preload/drupal-7.59';
$script  = 'index.php';

$path = $request->path;
$path = preg_replace('/^\\/php-wasm/', '', $path);

$_SERVER['REQUEST_URI']     = $path;
$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
$_SERVER['SERVER_NAME']     = $origin;
$_SERVER['SERVER_PORT']     = 3333;
$_SERVER['REQUEST_METHOD']  = $request->method;
$_SERVER['SCRIPT_FILENAME'] = $docroot . '/' . $script;
$_SERVER['SCRIPT_NAME']     = $docroot . '/' . $script;
$_SERVER['PHP_SELF']        = $docroot . '/' . $script;
$_SERVER['DOCUMENT_ROOT']   = '/';
$_SERVER['HTTPS']           = '';

chdir($docroot);

define('DRUPAL_ROOT', getcwd());

require_once DRUPAL_ROOT . '/includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);

$uid     = 1;
$user    = user_load($uid);
$account = array('uid' => $user->uid);
user_login_submit(array(), $account);

menu_execute_active_handler();
`;

		this.php.run(code).finally(() => this.php.refresh());
	};
}
