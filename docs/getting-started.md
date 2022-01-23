# Getting Started

Howdy! Let's get you set up with Flareact.

It's important to know that you must have a [Cloudflare account](https://cloudflare.com/) to use Flareact.

## Quickstart

If you want to get started right now, you can click the button below to fork the `flareact-template` repo and set up your account without installing any CLI tools:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/flareact/flareact-template)

Otherwise, follow the instructions below to get started.

## Installation

Make sure you have the [wrangler CLI](https://github.com/cloudflare/wrangler) tool installed:

```bash
npm i @cloudflare/wrangler -g
```

You may need to run `wrangler login` to authenticate your Cloudflare account.

Next, use wrangler to create a new Flareact project using the [template](https://github.com/flareact/flareact-template):

```bash
wrangler generate my-project https://github.com/flareact/flareact-template
```

Finally, switch to your directory and run `yarn` or `npm install`:

```bash
cd my-project
yarn
```

## Manual Installation

To add Flareact to an existing project, add `flareact` as a dependency:

```js
yarn add flareact
```

Or using npm:

```js
npm install flareact
```

Next, make sure you have the following files (check out the [template repo](https://github.com/flareact/flareact-template) to see the contents of each):

- `index.js`
- `wrangler.toml`
- `cargo-generate.toml`

Open `package.json` file and add the following `scripts`:

```json
"scripts": {
  "dev": "flareact dev",
  "build": "flareact build",
  "deploy": "flareact publish"
}
```

These scripts refer to the different stages of developing an application:

- `dev` - Runs `flareact dev` which kicks off `wrangler dev` and `flareact` in development mode
- `build` - Runs `flareact build` which kicks creates a production client-side bundle (useful for deploying from CI)
- `deploy` - Runs `flareact publish` which builds your application and runs `wrangler publish` to deploy it

Flareact uses the concept of pages. A page is a React Component exported from a `.js` file in the `pages` directory.

Pages are associated with a route based on their file name. For example, `pages/about.js` is mapped to `site.com/about`. You can even add dynamic route parameters with the filename.

You will need **at least one** page inside your `/pages` directory. To add a landing/index page, add the following to `pages/index.js`:

```js
export default function Index() {
  return <h1>Home</h1>;
}
```

## Development

To preview your Flareact site locally, run `yarn dev` in your terminal. Behind the scenes, Wrangler creates a tunnel from your local site to Cloudflare's edge — bringing your development and production environments closer together.

By default, your site will be available at [http://localhost:8080/](http://localhost:8080/).

**Note**: Be sure to fill in your `account_id` in `wrangler.toml`. You can also add it to a local `.env` file in your project:

```bash
CF_ACCOUNT_ID=youraccountid
```

Or pass it to `yarn dev` as an environment variable:

```bash
CF_ACCOUNT_ID=youraccountid
yarn dev
```
