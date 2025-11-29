import { NextResponse } from 'next/server';
import { dbConnect, Dataset } from '@/lib/mongoose';

export async function GET(req) {
  try {
    await dbConnect();
    const userHeader = req.headers.get('user');
    if (!userHeader) {
      return NextResponse.json({ error: 'User header missing' }, { status: 400 });
    }
    const { user_id } = JSON.parse(userHeader);
    if (!user_id) {
      return NextResponse.json({ error: 'User ID missing in header' }, { status: 400 });
    }
    const dataset = await Dataset.findOne({ user_id }).lean();
    return NextResponse.json({ dataset }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const userHeader = req.headers.get('user');
    if (!userHeader) {
      return NextResponse.json({ error: 'User header missing' }, { status: 400 });
    }
    const { user_id } = JSON.parse(userHeader);
    if (!user_id) {
      return NextResponse.json({ error: 'User ID missing in header' }, { status: 400 });
    }
    const entry = await req.json();

    // Upsert: add new entry or update if date exists
    let dataset = await Dataset.findOne({ user_id });
    if (!dataset) {
      dataset = await Dataset.create({ user_id, entries: [entry] });
    } else {
      const idx = dataset.entries.findIndex(e => e.date === entry.date);
      if (idx >= 0) {
        dataset.entries[idx] = entry;
      } else {
        dataset.entries.push(entry);
      }
      await dataset.save();
    }
    return NextResponse.json({ dataset }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
