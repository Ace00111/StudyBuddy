import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const dbPath = path.join(process.cwd(), 'users_database.json');
    let users = [];

    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      users = JSON.parse(data);
    }

    // Check if user already exists
    const existingIndex = users.findIndex((u: any) => u.email === email);
    if (existingIndex > -1) {
      users[existingIndex] = { ...users[existingIndex], name, lastUpdated: new Date().toISOString() };
    } else {
      users.push({ email, name, joinedAt: new Date().toISOString() });
    }

    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

    return NextResponse.json({ success: true, message: 'User synchronized with database' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to sync with database' }, { status: 500 });
  }
}
