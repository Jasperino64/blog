import { Navbar } from "@/components/web/Navbar";
import { DesktopHeader } from "@/components/web/DesktopHeader";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 min-h-screen">
      <Navbar />
      <div className="flex-1 w-full min-w-0 flex flex-col md:pt-8 pt-5">
        <div className="hidden md:flex justify-end mb-6 w-full">
          <DesktopHeader />
        </div>
        {children}
      </div>
    </div>
  );
}
