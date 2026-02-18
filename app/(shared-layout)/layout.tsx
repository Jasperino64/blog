import { Navbar } from "@/components/web/Navbar";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full mx-auto px-4">
      <Navbar />
      <div className="w-full mx-auto">{children}</div>
    </div>
  );
}
