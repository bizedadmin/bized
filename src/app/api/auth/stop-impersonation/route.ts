import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET() {
    const cookieStore = await cookies();
    cookieStore.delete("bized_impersonate");
    return redirect("http://platform.localhost:3000/businesses");
}
