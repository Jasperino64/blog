import { Navbar } from "@/components/web/Navbar";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w- mx-auto px-4">
      <Navbar />
      {children}
    </div>
  );
}
