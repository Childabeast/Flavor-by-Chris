import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        const isAdmin = userId === process.env.ADMIN_USER_ID;
        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error("Failed to check admin status:", error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
