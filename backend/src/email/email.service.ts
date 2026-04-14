import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendEstimateEmail(params: {
    customerEmail: string;
    customerName: string;
    laborCost: number;
    partsCost: number;
    totalCost: number;
    currency: string;
    note?: string;
    approveUrl: string;
    rejectUrl: string;
  }) {
    const {
      customerEmail,
      customerName,
      laborCost,
      partsCost,
      totalCost,
      currency,
      note,
      approveUrl,
      rejectUrl,
    } = params;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #1f4e79;">Repair Estimate Approval</h2>
        <p>Hello ${customerName},</p>
        <p>Your repair estimate is ready. Please review the breakdown below:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Labor Cost</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${laborCost} ${currency}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Parts Cost</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${partsCost} ${currency}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${totalCost} ${currency}</strong></td>
          </tr>
        </table>

        ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}

        <div style="margin-top: 24px;">
          <a href="${approveUrl}" style="display:inline-block;padding:12px 20px;margin-right:12px;background:#28a745;color:white;text-decoration:none;border-radius:6px;">
            Approve
          </a>
          <a href="${rejectUrl}" style="display:inline-block;padding:12px 20px;background:#dc3545;color:white;text-decoration:none;border-radius:6px;">
            Reject
          </a>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: customerEmail,
      subject: 'Repair Estimate Approval',
      html,
    });
  }

  async sendEstimateDecisionEmail(params: {
    customerEmail: string;
    customerName: string;
    decision: 'APPROVED' | 'REJECTED';
  }) {
    const { customerEmail, customerName, decision } = params;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #1f4e79;">Estimate Decision Confirmation</h2>
        <p>Hello ${customerName},</p>
        <p>Your estimate has been <strong>${decision}</strong>.</p>
        <p>Thank you for your response.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: customerEmail,
      subject: 'Estimate Decision Confirmation',
      html,
    });
  }
}
