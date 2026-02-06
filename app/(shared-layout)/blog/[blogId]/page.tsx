interface Props {
  params: Promise<{
    blogId: string;
  }>;
}
export default async function page({ params }: Props) {
  const { blogId } = await params;
  return (
    <div>
      <h1>blog</h1>
      <p>id: {blogId}</p>
    </div>
  );
}
