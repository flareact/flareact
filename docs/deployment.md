# Deployment

To deploy your Flareact site to Cloudflare, run:

```bash
yarn deploy
```

Behind the scenes, Flareact bundles your client assets in a production-ready format and then runs `wrangler publish`.

## Deploying to a custom route

In your `wrangler.toml` file, you can use specify a route for your site instead of the `workers_dev` default host.

To set a route, change `workers_dev = false` and specify your route:

```toml
workers_dev = false
route = "flareact.com/*"
```

At this point, you'll also be required to include a `zone_id`. If you don't want to include this in your version control (e.g. your project is open-source), you can define it in a local `.env` file which is ignored by Git:

```
CF_ZONE_ID=<your zone ID>
CF_ACCOUNT_ID=<your account ID>
```

**Note:**: Per the [Cloudflare Docs](https://developers.cloudflare.com/workers/learning/getting-started#6d-configuring-your-project), if your route is configured to a hostname, you will need to add a DNS record to Cloudflare to ensure that the hostname can be resolved externally. If your Worker acts as your origin (the response comes directly from a Worker), you should enter a placeholder (dummy) AAAA record pointing to `100::`, which is the [reserved IPv6 discard prefixOpen external link](https://tools.ietf.org/html/rfc6666).

## Deploying to environments

Cloudflare allows you to [define additional environments](https://developers.cloudflare.com/workers/platform/environments) for your Workers site.

After adding a new environment to your `wrangler.toml` file:

```toml
[env.staging]
name = "your-site-staging"
workers_dev = true
```

You can pass the `--env <NAME>` flag to the `yarn deploy` command:

```bash
yarn deploy --env staging
```

## Deploying from GitHub Actions

To deploy from GitHub Actions, you can use the [wrangler action](https://github.com/cloudflare/wrangler-action).

In your project, create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy
on:
  - push
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: 12
      - run: yarn install
      - run: yarn build
      - name: Publish
        uses: cloudflare/wrangler-action@1.2.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
        env:
          CF_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
          IS_WORKER: true
```

Optionally update your `push:` directive to include only certain branches.

You also might want to add a `CF_ZONE_ID` if you're deploying to a custom domain.
