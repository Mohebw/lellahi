import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json(null);
  return NextResponse.json(session);
}
