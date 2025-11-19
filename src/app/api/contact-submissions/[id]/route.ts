import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: params.id }
    });
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email, message, status, response } = await request.json();
    
    const submission = await prisma.contactSubmission.update({
      where: { id: params.id },
      data: { name, email, message, status, response }
    });

    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.contactSubmission.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}