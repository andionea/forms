import { NextResponse } from "next/server";

// Pune aici URL-ul pe care l-ai copiat la Pasul 2 de la Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_4hFnyGzpH_-7rmSkrV9wzGnrd2r3p4-Np0yjtbtgReHvY_3ee_3ZriUS-Ca0D5zz4g/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Trimitem datele direct către Google Web App prin POST
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.status === "success") {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Eroare Apps Script", details: result.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Eroare la trimiterea datelor:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}