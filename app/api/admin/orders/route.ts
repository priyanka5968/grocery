import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'created_at';
    const direction = searchParams.get('direction') || 'desc';
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;

    // Build the WHERE clause
    let whereClause = '';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      whereClause = 'WHERE status = $1';
      params.push(status);
    }
    
    if (email) {
      whereClause = whereClause ? `${whereClause} AND email LIKE $${params.length + 1}` 
                               : 'WHERE email LIKE $1';
      params.push(`%${email}%`);
    }

    // Safe list of allowed sort fields
    const allowedSortFields = ['id', 'email', 'total_amount', 'status', 'created_at'];
    const safeSort = allowedSortFields.includes(sort) ? sort : 'created_at';
    const safeDirection = direction === 'asc' ? 'asc' : 'desc';

    const query = `
      SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        o.email,
        json_agg(
          json_build_object(
            'id', oi.id,
            'grocery_id', oi.grocery_id,
            'name', g.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN groceries g ON oi.grocery_id = g.id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.${safeSort} ${safeDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const { rows } = await sql.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}