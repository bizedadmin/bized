import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'All fields are required.' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this email already exists.' },
                { status: 400 }
            );
        }

        // Hash password
        const checkUser = await User.find({})
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = checkUser.length === 0 ? 'admin' : 'user';

        // Generate unique slug
        const { generateUniqueUserSlug } = await import('@/lib/slugs');
        const slug = await generateUniqueUserSlug(name);

        // Create user
        await User.create({
            name,
            email,
            password: hashedPassword,
            slug,
            role: role
        });

        return NextResponse.json(
            { message: 'User registered successfully.' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: 'An error occurred while registering the user.' },
            { status: 500 }
        );
    }
}
