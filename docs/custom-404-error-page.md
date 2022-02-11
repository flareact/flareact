# Custom 404 Not Found Error Page

Accessing a path that has no corresponding [page](/docs/pages) will give the following, unstyled, 404 Not Found error message:

```
could not find some-path/index.html in your content namespace
```

## Static html page

If you want to customize the 404 Not Found page for your application, you can add a static `404.html` HTML document in `/public`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>404 Not Found</title>
  </head>
  <body>
    <h1>404 Not Found</h1>
    <p>The page cannot be found.</p>
  </body>
</html>
```

You can reference other assets, such as stylesheets and images, stored as [static files](/docs/static-file-serving) from within the HTML document.

## React powered 404 page

To create a custom React powered 404 page you can create a `pages/404.js` file.

```
// pages/404.js
export async function getEdgeProps({ params }) {
    const { originalPath } = params;
    const data = await someFallbackDataRequest();
    
    return {
        props: {
            originalPath,
            data,
        },
        notFound: true, // send 404 header
        revalidate: 60, // Revalidate your data once every 60 seconds
    }
}

export default function Index({ originalPath, data }) {
    return (
        <div>
          <h1>{originalPath} - 404 Not Found </h1>
          <ul>
            {data.map((item) => {
              return <li key={item.id}>...</li>;
            })}
          </ul>
        </div>
    )
}
```

Note: `404.js` will take precedence over `404.html`. A 404 response will be returned on hard page loads only.