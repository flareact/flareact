# Flareact Template - Material UI 

Based off the original [flareact-template](https://github.com/flareact/flareact-template), flareact with styled-components [example] (https://github.com/flareact/flareact/tree/canary/examples/with-styled-components) and code from the [@mui](https://mui.com/) project.


Get started with Flareact by installing [Wrangler](https://github.com/cloudflare/wrangler) and running:

```bash
wrangler generate my-project https://github.com/shaunm/flareact-mui
```

Next, fill in `account_id` and `name` inside your `wrangler.toml` file.

Finally, run `yarn dev` to see magic happen 🎉

Go edit a page in your `/pages` directory to get started 👍

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button?paid=true)](https://deploy.workers.cloudflare.com/?url=https://github.com/shaunm/flareact-mui&paid=true)



### Further Steps:

For better debugging, make sure you are using Node > 17 then install `yarn add miniflare@next` and change the `dev` entry in `package.json` to `NODE_OPTIONS=--openssl-legacy-provider flareact build && miniflare --watch --verbose`

Note: This won't run on the worker server because it's running an older version of Node, so be sure to save a copy of package.json without these changes and build from that instead
