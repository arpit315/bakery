import nodemailer from 'nodemailer';

// Transporter instance (lazy initialization)
let transporter = null;

// Create transporter (called lazily on first email send)
const getTransporter = () => {
    if (transporter) return transporter;

    // For development, use Ethereal (fake SMTP)
    // For production, use real SMTP (Gmail, SendGrid, etc.)

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
        console.log('📧 Email configured with:', process.env.EMAIL_HOST);
        // Use configured SMTP
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        return transporter;
    }

    console.log('⚠️ Email not configured - using dev fallback');
    // Fallback to console logging in development
    transporter = {
        sendMail: async (options) => {
            console.log('📧 Email would be sent:');
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('---');
            return { messageId: 'dev-' + Date.now() };
        }
    };
    return transporter;
};

// Send email helper
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const emailTransporter = getTransporter();
        const info = await emailTransporter.sendMail({
            from: process.env.EMAIL_FROM || '"Bakery Boutique" <noreply@bakeryboutique.com>',
            to,
            subject,
            html,
            text,
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

// Email templates
export const emailTemplates = {
    // Email OTP verification
    emailOTP: (name, otp) => ({
        subject: '🔐 Verify Your Email - Bakery Boutique',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f8e1e7 0%, #fef3e2 100%); border-radius: 16px;">
                    <h1 style="color: #ec4899; margin: 0;">🧁 Bakery Boutique</h1>
                </div>
                <div style="padding: 30px 20px; text-align: center;">
                    <h2 style="color: #333;">Hello ${name}! 👋</h2>
                    <p style="color: #666; font-size: 16px;">
                        Please use the following OTP to verify your email address:
                    </p>
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ec4899;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        This OTP is valid for 10 minutes. Do not share it with anyone.
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
            </div>
        `,
        text: `Hello ${name}! Your OTP for Bakery Boutique email verification is: ${otp}. Valid for 10 minutes.`
    }),

    // Order confirmation
    orderConfirmation: (order) => ({
        subject: `🎉 Order Confirmed - ${order.orderNumber} - Bakery Boutique`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f8e1e7 0%, #fef3e2 100%); border-radius: 16px;">
                    <h1 style="color: #ec4899; margin: 0;">🧁 Bakery Boutique</h1>
                </div>
                <div style="padding: 30px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span style="font-size: 60px;">🎉</span>
                        <h2 style="color: #333; margin: 10px 0;">Order Confirmed!</h2>
                        <p style="color: #666;">Thank you for your order, ${order.customerName}!</p>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-top: 0;">Order Details</h3>
                        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
                        <p style="margin: 5px 0;"><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-top: 0;">Delivery Address</h3>
                        <p style="margin: 5px 0;">${order.customerAddress}</p>
                        <p style="margin: 5px 0;">Pincode: ${order.customerPincode}</p>
                        <p style="margin: 5px 0;">Phone: ${order.customerPhone}</p>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
                        <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
                        ${order.items.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div style="padding-top: 15px; margin-top: 10px; border-top: 2px solid #ec4899;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Subtotal:</span>
                                <span>₹${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Delivery:</span>
                                <span>₹${order.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 10px;">
                                <span>Total:</span>
                                <span style="color: #ec4899;">₹${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                    <p style="color: #666; margin: 0;">
                        Your delicious treats are being prepared! 🍰
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 10px;">
                        Questions? Contact us at support@bakeryboutique.com
                    </p>
                </div>
            </div>
        `,
        text: `Order Confirmed! Order Number: ${order.orderNumber}. Total: ₹${order.total.toFixed(2)}. Thank you for ordering from Bakery Boutique!`
    }),

    // Welcome email
    welcome: (name) => ({
        subject: '🎂 Welcome to Bakery Boutique!',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f8e1e7 0%, #fef3e2 100%); border-radius: 16px;">
                    <h1 style="color: #ec4899; margin: 0;">🧁 Bakery Boutique</h1>
                </div>
                <div style="padding: 30px 20px; text-align: center;">
                    <span style="font-size: 60px;">🎉</span>
                    <h2 style="color: #333;">Welcome, ${name}!</h2>
                    <p style="color: #666; font-size: 16px;">
                        Thank you for joining Bakery Boutique! We're thrilled to have you as part of our sweet family.
                    </p>
                    <p style="color: #666; font-size: 16px;">
                        Explore our delicious collection of freshly baked cakes, pastries, cookies, and more!
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu" 
                       style="display: inline-block; background: #ec4899; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px;">
                        Browse Our Menu 🍰
                    </a>
                </div>
            </div>
        `,
        text: `Welcome to Bakery Boutique, ${name}! Thank you for joining us. Explore our menu at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu`
    }),

    // Registration OTP (for new signups)
    registrationOTP: (name, otp) => ({
        subject: '🔐 Complete Your Registration - Bakery Boutique',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f8e1e7 0%, #fef3e2 100%); border-radius: 16px;">
                    <h1 style="color: #ec4899; margin: 0;">🧁 Bakery Boutique</h1>
                </div>
                <div style="padding: 30px 20px; text-align: center;">
                    <h2 style="color: #333;">Almost there, ${name}! 👋</h2>
                    <p style="color: #666; font-size: 16px;">
                        Please use the following OTP to complete your registration:
                    </p>
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ec4899;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        This OTP is valid for 10 minutes. Do not share it with anyone.
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
            </div>
        `,
        text: `Hello ${name}! Your OTP for Bakery Boutique registration is: ${otp}. Valid for 10 minutes.`
    }),

    // Order delivered notification
    orderDelivered: (order) => ({
        subject: `🎉 Order Delivered - ${order.orderNumber} - Bakery Boutique`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f8e1e7 0%, #fef3e2 100%); border-radius: 16px;">
                    <h1 style="color: #ec4899; margin: 0;">🧁 Bakery Boutique</h1>
                </div>
                <div style="padding: 30px 20px; text-align: center;">
                    <span style="font-size: 60px;">🎉</span>
                    <h2 style="color: #333;">Your Order Has Been Delivered!</h2>
                    <p style="color: #666; font-size: 16px;">
                        Hello ${order.customerName}, your delicious treats have arrived!
                    </p>
                </div>
                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #333; margin-top: 0;">Order Details</h3>
                    <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
                </div>
                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #333; margin-top: 0;">Items Delivered</h3>
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 12px;">
                    <p style="color: #155724; margin: 0; font-size: 16px;">
                        We hope you enjoy your treats! 🍰
                    </p>
                    <p style="color: #155724; margin: 10px 0 0 0; font-size: 14px;">
                        Thank you for choosing Bakery Boutique!
                    </p>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" 
                       style="display: inline-block; background: #ec4899; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold;">
                        View Your Orders
                    </a>
                </div>
            </div>
        `,
        text: `Your order ${order.orderNumber} has been delivered! Total: ₹${order.total.toFixed(2)}. Thank you for choosing Bakery Boutique!`
    })
};

export default { sendEmail, emailTemplates };
