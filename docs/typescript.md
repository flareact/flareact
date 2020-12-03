# TypeScript Support

Flareact supports TypeScript out of the box.

To get started, add `typescript` to your project:

```bash
yarn add typescript
yarn add -D @types/react
```

Then you can write components in TypeScript:

```tsx
type IndexProps = {
  message: string;
};

export async function getEdgeProps() {
  return {
    props: {
      message: "Hello",
    } as IndexProps,
  };
}

export default function Index({ message }: IndexProps) {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
```

Coming soon:

- Official Flareact type definitions
