import { useQuery } from "convex/react";
import { Input } from "../ui/input";
import { Loader2, Search, Terminal } from "lucide-react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function SearchInput() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    setOpen(true);
  }

  const results = useQuery(
    api.posts.searchPosts,
    searchQuery.length > 2
      ? {
          queryString: searchQuery,
          limit: 5,
        }
      : "skip",
  );

  return (
    <div className="relative w-full max-w-sm z-10">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          className="pl-8 w-full bg-background"
          value={searchQuery}
          onChange={handleInputChange}
        />
      </div>
      {open && searchQuery.length > 2 && (
        <div className="absolute top-full mt-2 rounded-md bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          {results === undefined ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No results found
            </p>
          ) : (
            <div className="py-1">
              {results.map((post) => (
                <Link
                  href={`/blog/${post._id}`}
                  key={post._id}
                  className="flex flex-col px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <p className="font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foregroun pt-1">
                    {post.body.substring(0, 60)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
