export default function Index(data: any) {
  console.log(data)
  return (
    <div>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}
