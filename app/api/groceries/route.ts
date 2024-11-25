import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    console.log("hel");
  try {
    const { rows } = await sql`SELECT * FROM groceries ORDER BY created_at DESC`;
   
    
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch groceries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const { rows } = await sql`
      INSERT INTO groceries (name)
      VALUES (${name})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add grocery item' }, { status: 500 });
  }
}