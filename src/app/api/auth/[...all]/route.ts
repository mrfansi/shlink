import { getAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
  const auth = await getAuth();
  return auth.handler(req);
};

export { handler as GET, handler as POST };
