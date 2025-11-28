import { NextResponse } from "next/server";
import { verifyToken } from "./utils/verifyToken";


const PUBLIC_ONLY_ROUTES = ['/login', '/register', '/demo', '/'];
const PUBLIC_ROUTES = ['/'];

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Verify token and get the payload
    const payload = await verifyToken(req);
    const isAuthenticated = Boolean(payload);
    // Check if the route is public or public-only
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const isPublicOnly = PUBLIC_ONLY_ROUTES.includes(pathname);

    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Create a new Headers object
    const headers = new Headers(req.headers);

    // Add the user payload to the headers if authenticated
    if (isAuthenticated) {
        headers.set('user', JSON.stringify(payload));
    }

    // Prevent logged-in users from accessing login/register pages
    if (isAuthenticated && isPublicOnly) {
        return NextResponse.redirect(new URL('/dashboard', req.url), {
            headers,  // Ensure headers are passed in the redirect as well
        });
    }

    // Allow everyone to access truly public routes (like '/')
    if (isPublic) {
        return NextResponse.next({
            request: {
                headers, // Pass the modified headers here
            },
        });
    }

    // Redirect unauthenticated users away from protected routes
    if (!isAuthenticated && !isPublicOnly && !isPublic) {
        return NextResponse.redirect(new URL('/login', req.url));
    }


    // For authenticated users, proceed to the next route with headers
    return NextResponse.next({
        request: {
            headers: headers, // Pass the modified headers here
        },
    });
}


export const config = {
    matcher: [
        '/((?!_next/.*|favicon\\.ico|manifest\\.json|robots\\.txt|service-worker\\.js|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico|bmp|tiff|avif|webmanifest|json)).*)',
    ],
};