# Hello, World!

Welcome to my **new** blog! This is an *extremely* experimental engine powered mostly by github actions & cloudflare workers. Its hosted in github pages and cached in cloudflare's cdn.

The workers are managed by terraform, and indexes are rebuild when a content file is changed, all of this runs on `git commit` via the github actions.

The interface is capable of editing files in its own repository, if the logged in user has the rights on github. These edits **will** trigger github actions. You can toggle to/from the source code of this document with the icons in the top right. You can view your changes, but cannot save them without edit permissions on the github repo.

## UI

I call this user interface "Nynex". The name comes from the version identifier Windows **9x**, as well as the first phone company to ever provide me with dialup internet access, way back in the '90s.

For more information on the UI, see [whats Nynex?](/repo-browser/seanmorris/nynex95/content/whats-nynex.md)

## To do

There is **a lot** left to do. I want to be able to upload & asset files directly through this UI, as well as perhaps even design & develop javascript compontents with it.

I plan to add some terraform scripting to spin up a websocket server on Heroku, using redis `PubSub`. This would allow multiple users on the server to interact in real time.

## Aim

The aim is to allow users to simply fork the project on github, clear out the content directory, add their API keys for cloudflare & heroku to their github secrets. Once this is done, the new instance can callback to the old and join a swarm.

Users communicating with one instance will be able to communicate with users on all instances, and the need for social networks will hopefully be completely obviated.

I was originally inspired by Jeff Hunter & JC Stanton's work in linking up the `NirvanaNET` BBSs in the 1990s.
