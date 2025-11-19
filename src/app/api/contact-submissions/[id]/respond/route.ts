import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { response } = await request.json();
    
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: params.id }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update submission with response
    await prisma.contactSubmission.update({
      where: { id: params.id },
      data: { response, status: 'responded' }
    });

    // Send email response
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GOOGLE_EMAIL,
      to: submission.email,
      subject: `Re: Your message to Food Bundles`,
      html: `
        <h3>Response to Your Contact Form Submission</h3>
        <p>Dear ${submission.name},</p>
        <p>Thank you for contacting us. Here's our response to your message:</p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;">
          ${submission.message}
        </blockquote>
        <p><strong>Our Response:</strong></p>
        <p>${response}</p>
        <p>Best regards,<br>Food Bundles Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send response' }, { status: 500 });
  }
}