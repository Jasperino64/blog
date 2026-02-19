import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jasper's Stuff",
  description: "Stuff I made and share with the world.",
  category: "Web development",
  authors: [{ name: "Jasper Chen" }],
  generator: "Next.js",
  keywords: ["blog", "Jasper's Blog", "Jasper Chen"],
  openGraph: {
    title: "Jasper's Stuff",
    description: "Stuff I made and share with the world.",
    type: "website",
    locale: "en_US",
    siteName: "Jasper's Stuff",
  },
};

export default function Home() {
  return <div>Home</div>;
}
