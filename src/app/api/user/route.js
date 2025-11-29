import { NextResponse } from 'next/server';
import { dbConnect, User } from '@/lib/mongoose';

export async function GET(req) {
    try {
        await dbConnect();

        const userHeader = req.headers.get('user');
        if (!userHeader) {
            return NextResponse.json({ error: 'User header missing' }, { status: 400 });
        }
        const valueFromMiddleware = JSON.parse(userHeader);

        const email = valueFromMiddleware.email;
        if (!email) {
            return NextResponse.json({ error: 'Email missing in user header' }, { status: 400 });
        }

        const user = await User.findOne({ email }).lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Remove password from response
        const { password, ...userData } = user;

        return NextResponse.json(userData, { status: 200 });
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
        const valueFromMiddleware = JSON.parse(userHeader);
        const email = valueFromMiddleware.email;
        if (!email) {
            return NextResponse.json({ error: 'Email missing in user header' }, { status: 400 });
        }

        const updates = await req.json();

        const user = await User.findOneAndUpdate(
            { email },
            { $set: updates },
            { new: true, lean: true }
        );
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { password, ...userData } = user;
        return NextResponse.json({ user: userData }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
