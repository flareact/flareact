# Custom Headers

Often times, you want to set custom response headers(eg 'set-cookie').

Pass a header object to `customHeaders` to tell Flareact to add those headers:

```js
export async function getEdgeProps() {
  const data = await someExpensiveDataRequest();

  return {
    props: {
      data,
    },
    customHeaders: {'set-cookie': 'cookie=monster; Expires=Wed, 21 Oct 2025 07:28:00 GMT'},
  };
}
```
