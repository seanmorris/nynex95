<?php
ini_set('session.save_path', '/home/web_user');
session_id('fake-cookie');
session_start();

$stdErr = fopen('php://stderr', 'w');
$errors = [];

register_shutdown_function(function() use($stdErr, &$errors){
    fwrite($stdErr, json_encode(['session_id' => session_id()]) . "\n");
    fwrite($stdErr, json_encode(['headers'=>headers_list()]) . "\n");
    fwrite($stdErr, json_encode(['errors' => error_get_last()]) . "\n");
});

set_error_handler(function(...$args) use($stdErr, &$errors){
	fwrite($stdErr, print_r($args,1));
});

$origin  = 'http://localhost:3333';
$docroot = '/preload/drupal-7.59';
$path    = '/';
$script  = 'index.php';

$_SERVER['REQUEST_URI']     = $docroot;
$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
$_SERVER['SERVER_NAME']     = $origin;
$_SERVER['SERVER_PORT']     = 3333;
$_SERVER['REQUEST_METHOD']  = 'GET';
$_SERVER['SCRIPT_FILENAME'] = $docroot . '/' . $script;
$_SERVER['SCRIPT_NAME']     = $docroot . '/' . $script;
$_SERVER['PHP_SELF']        = $docroot . '/' . $script;

chdir($docroot);

define('DRUPAL_ROOT', getcwd());

require_once DRUPAL_ROOT . '/includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);

$uid     = 1;
$user    = user_load($uid);
$account = array('uid' => $user->uid);
user_login_submit(array(), $account);

menu_execute_active_handler();