![](/sm/player-64-24bit.png)

# Hello, World!

Welcome to my **new** blog! This is an *extremely* experimental engine powered mostly by github actions & cloudflare workers. Its hosted in github pages and cached in cloudflare's cdn.

The workers are managed by terraform, and indexes are rebuild when a content file is changed, all of this runs on `git push` via github actions.

The interface is capable of editing files in its own repository, via the Github API, so long as the logged in user has the rights on github. These edits **will** trigger github actions. You can toggle to/from the source code of this document with the icons in the top right. You can view your changes, but cannot save them without edit permissions on the github repo.

## UI

I call this user interface "Nynex95". The name comes from the version identifier Windows **9x**, as well as the first phone company to ever provide me with dialup internet access, way back in the '90s.

For more information on the UI, see [using Nynex](/repo-browser/seanmorris/nynex95/content/using-nynex.md).

For more information on Curvature, the JS framework, see the [Curvature Playground](https://curvature.unholysh.it).

## To do

There is **a lot** left to do. I want to be able to upload & asset files directly through this UI, as well as perhaps even design & develop javascript compontents with it.

I plan to add some terraform scripting to spin up a websocket server on Heroku, using redis `PubSub`. This would allow multiple users on the server to interact in real time.

I also want to add an indexer-action to generate RSS feeds for the `content/` directory.

## Aim

The aim is to allow users to serve social content over cloud services with free accounts.

Users should be able to simply fork the project on github, clear out the content directory, add their API keys for Cloudflare & Heroku to their github secrets, and go.

Users communicating with one instance will be able to communicate with users on all instances, and the need for social networks will hopefully be completely obviated.

The new instance should also have the ablility to call back to the one it was forked from, and join a swarm.

I was originally inspired by Jeff Hunter & JC Stanton's work in linking up the `NirvanaNET` BBSs in the 1990s.
