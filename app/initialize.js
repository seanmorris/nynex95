import { Home    } from 'home/Home';
import { Window  } from 'window/Window';
import { Router  } from 'curvature/base/Router';
import { Matrix  } from 'matrix-api/Matrix';
import { Loading } from './ui/Loading';

const matrix = new Matrix;

const homeView = Home.instance();

const loginToken = (new URLSearchParams(location.search)).get('loginToken');

if(loginToken)
{
	const load = new Loading;

	load.listen(
		document
		, 'DOMContentLoaded'
		, event => load.render(document.body)
		, {once: true}
	);

	matrix.completeSso(loginToken);
}
else
{
	document.addEventListener('DOMContentLoaded', function() {

		if(location.pathname === '/satellite-window')
		{
			return;
		}

		Router.listen(homeView);

		homeView.render(document.body);
	});
}
