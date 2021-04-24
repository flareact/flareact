# Custom 404 Not Found Error Page

Accessing a path that has no corresponding [page](/docs/pages) will give the following, unstyled, 404 Not Found error message:

```
could not find some-path/index.html in your content namespace
```

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

Note that it is currently **not possible to use a React page component** from `/pages` to generate the 404 Not Found page.
