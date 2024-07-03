import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { nama, kelas, umur } = await req.json();

  const { data, error } = await supabase
    .from("action")
    .insert([{ nama, kelas, umur }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function PUT(req: NextRequest) {
  const { id, nama, kelas, umur } = await req.json();

  const { data, error } = await supabase
    .from("action")
    .update({ nama, kelas, umur })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
