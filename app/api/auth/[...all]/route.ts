import { handler } from "@/lib/auth-server";

const { GET: _GET, POST: _POST } = handler;

export const GET = async (req: Request) => {
  console.log("GET /api/auth hit", req.url);
  return _GET(req);
};

export const POST = async (req: Request) => {
  console.log("POST /api/auth hit", req.url);
  return _POST(req);
};
