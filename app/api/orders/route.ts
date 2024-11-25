import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { items, email } = await request.json();
    
    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + (item.quantity * (item.price || 5.99)), 
      0
    );

    // Create order with email
    const { rows: [order] } = await sql`
      INSERT INTO orders (total_amount, email)
      VALUES (${totalAmount}, ${email})
      RETURNING id
    `;

    // Create order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, grocery_id, quantity, price)
        VALUES (
          ${order.id},
          ${item.id},
          ${item.quantity},
          ${item.price || 5.99}
        )
      `;
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { rows: orders } = await sql`
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
      WHERE o.email = ${email}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' }, 
      { status: 500 }
    );
  }
}