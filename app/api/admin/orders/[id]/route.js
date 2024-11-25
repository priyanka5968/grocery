import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PATCH(
  request,
  { params } 
) {
  try {
    const { status } = await request.json();
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}