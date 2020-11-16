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
