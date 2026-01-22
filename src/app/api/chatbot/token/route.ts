import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const secret = process.env.CHATBOT_IDENTITY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Chatbot secret not configured' }, { status: 500 });
    }

    // Get user info from your auth system
    // This is a simplified version - you should get actual user data
    const userInfo = {
      user_id: userId,
      // Add more user attributes as needed
      // email: user.email,
      // role: user.role,
    };

    const token = jwt.sign(userInfo, secret, { expiresIn: '1h' });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating chatbot token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}