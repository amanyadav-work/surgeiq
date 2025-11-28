import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

// GET request handler
export async function GET(req) {
    try {
        const userHeader = req.headers.get('user')
        const valueFromMiddleware = JSON.parse(userHeader)

        console.log({ valueFromMiddleware })

        const data = {
            message: 'Hello from the GET API!',
            userId: valueFromMiddleware.userId,
            userData: valueFromMiddleware.data,
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST request handler
export async function POST(req, res) {
    try {
        const cookieStore = cookies();
        const authToken = cookieStore.get('auth_token');

        console.log('Auth Token from cookie (POST):', authToken?.value);

        const userHeader = req.headers.get('user')
        const valueFromMiddleware = JSON.parse(userHeader)

        console.log({ valueFromMiddleware })

        return NextResponse.json({
            message: 'Data received successfully',
            data: "body",
            timestamp: new Date().toISOString()
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request data' },
            { status: 400 }
        );
    }
}