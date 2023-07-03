import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { Room } from "@/room";

// creates new room and redirects
export async function GET(request: Request) {
    const room = Room.create();
    return NextResponse.redirect(`${request.url}/${room.id}`)
}