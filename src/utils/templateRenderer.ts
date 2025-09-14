import ejs from "ejs";
import path from "path";
import fs from "fs";

// Preload header and footer templates
const headerTemplate = fs.readFileSync(
  path.join(__dirname, "../../templates/header.ejs"),
  "utf8"
);
const footerTemplate = fs.readFileSync(
  path.join(__dirname, "../../templates/footer.ejs"),
  "utf8"
);

export const renderEmailTemplate = (
  templateName: string,
  data: Record<string, any>
): string => {
  const emailTemplate = fs.readFileSync(
    path.join(__dirname, `../../templates/${templateName}.ejs`),
    "utf8"
  );

  const header = ejs.render(headerTemplate);
  const footer = ejs.render(footerTemplate);

  console.log("headerTemplate", headerTemplate, footerTemplate, emailTemplate)
  const body = ejs.render(emailTemplate, data);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject || 'TourBirth Email'}</title>
      <style>
        /* Global Styles */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }
        
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        /* Header Styles */
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px 20px;
          text-align: center;
          border-radius: 0 0 20px 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .logo-container {
          display: inline-block;
          background: white;
          padding: 20px 30px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          position: relative;
        }
        
        .logo-image {
          max-width: 200px;
          height: auto;
          display: block;
          margin: 0 auto;
          border-radius: 8px;
        }
        
        .logo-fallback {
          display: none;
          margin-top: 15px;
        }
        
        .logo-text {
          font-family: 'Arial', sans-serif;
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .logo-subtitle {
          font-family: 'Arial', sans-serif;
          font-size: 14px;
          color: #666;
          margin: 5px 0 0 0;
          font-weight: 300;
        }
        
        .header-decoration {
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
          margin: 20px auto 0;
          border-radius: 2px;
        }

        /* Footer Styles */
        .footer {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          margin-top: 40px;
          border-radius: 20px 20px 0 0;
          overflow: hidden;
          position: relative;
        }
        
        .footer-content {
          padding: 40px 30px 20px;
          position: relative;
          z-index: 1;
        }
        
        .footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .link-group h4 {
          color: #4ecdc4;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .footer-link {
          display: block;
          color: #bdc3c7;
          text-decoration: none;
          margin-bottom: 12px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .social-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .social-link {
          color: #bdc3c7;
          text-decoration: none;
          font-size: 14px;
        }
        
        .footer-contact {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
          color: #ecf0f1;
          font-size: 14px;
        }
        
        .contact-icon {
          font-size: 16px;
          opacity: 0.8;
        }
        
        .contact-text {
          font-weight: 500;
        }
        
        .footer-bottom {
          text-align: center;
          color: #bdc3c7;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .footer-bottom p {
          margin: 0 0 10px 0;
        }

        /* Welcome Email Styles */
        .welcome-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .welcome-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .welcome-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .welcome-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .welcome-subtitle {
          font-size: 18px;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }
        
        .welcome-content {
          padding: 40px 30px;
        }
        
        .welcome-message {
          text-align: center;
          margin-bottom: 40px;
          line-height: 1.6;
          color: #333;
        }
        
        .welcome-message p {
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .feature-card {
          background: #f8f9fa;
          padding: 25px 20px;
          border-radius: 15px;
          text-align: center;
          border: 1px solid #e9ecef;
        }
        
        .feature-icon {
          font-size: 32px;
          margin-bottom: 15px;
        }
        
        .feature-card h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }
        
        .feature-card p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .cta-section {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
        }
        
        .cta-text {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
        }
        
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .button-arrow {
          font-size: 18px;
        }
        
        .welcome-footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
          color: #666;
          line-height: 1.6;
        }
        
        .welcome-footer p {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        
        .contact-info {
          font-weight: 600;
          color: #333;
          margin-top: 20px !important;
        }

        /* Account Verification Styles */
        .verification-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .verification-hero {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .verification-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .verification-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .verification-subtitle {
          font-size: 18px;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }
        
        .verification-content {
          padding: 40px 30px;
        }
        
        .verification-message {
          text-align: center;
          margin-bottom: 40px;
          line-height: 1.6;
          color: #333;
        }
        
        .verification-message p {
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        
        .otp-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          margin-bottom: 40px;
          border: 2px solid #e9ecef;
        }
        
        .otp-label {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }
        
        .otp-display {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .otp-digit {
          width: 50px;
          height: 60px;
          background: white;
          border: 2px solid #667eea;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }
        
        .otp-note {
          color: #666;
          font-size: 14px;
          margin: 0;
          font-style: italic;
        }
        
        .security-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .security-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }
        
        .security-icon {
          font-size: 24px;
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .security-text h4 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
        
        .security-text p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .verification-footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
          color: #666;
          line-height: 1.6;
        }
        
        .verification-footer p {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        
        .resend-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
        }
        
        .verification-footer .contact-info {
          font-weight: 600;
          color: #333;
          margin-top: 20px !important;
        }

        /* OTP Template Styles */
        .otp-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .otp-hero {
          background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .otp-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .otp-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .otp-subtitle {
          font-size: 18px;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }
        
        .otp-content {
          padding: 40px 30px;
        }
        
        .otp-message {
          text-align: center;
          margin-bottom: 40px;
          line-height: 1.6;
          color: #333;
        }
        
        .otp-message p {
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        
        .otp-display-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 35px;
          border-radius: 20px;
          text-align: center;
          margin-bottom: 40px;
          border: 2px solid #e9ecef;
          position: relative;
          overflow: hidden;
        }
        
        .otp-label {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 25px;
          position: relative;
          z-index: 1;
        }
        
        .otp-code {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 25px;
          position: relative;
          z-index: 1;
        }
        
        .otp-character {
          width: 55px;
          height: 65px;
          background: white;
          border: 3px solid #4ecdc4;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: #4ecdc4;
          box-shadow: 0 6px 20px rgba(78, 205, 196, 0.3);
        }
        
        .otp-instruction {
          color: #666;
          font-size: 15px;
          margin: 0;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }
        
        .otp-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 15px;
          border: 1px solid #e9ecef;
        }
        
        .detail-icon {
          font-size: 24px;
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .detail-content h4 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
        
        .detail-content p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .otp-footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
          color: #666;
          line-height: 1.6;
        }
        
        .otp-footer p {
          margin: 0 0 20px 0;
          font-size: 14px;
        }
        
        .support-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .support-link {
          color: #4ecdc4;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
        }
        
        .separator {
          color: #ccc;
          font-weight: 300;
        }

        /* Password Reset Styles */
        .reset-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .reset-hero {
          background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .reset-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .reset-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .reset-subtitle {
          font-size: 18px;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }
        
        .reset-content {
          padding: 40px 30px;
        }
        
        .reset-message {
          text-align: center;
          margin-bottom: 40px;
          line-height: 1.6;
          color: #333;
        }
        
        .reset-message p {
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        
        .reset-content .otp-section {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
          border: 2px solid #fed7d7;
        }
        
        .reset-content .otp-digit {
          border: 2px solid #ff6b6b;
          color: #ff6b6b;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
        }
        
        .security-tips {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 40px;
          border: 1px solid #e9ecef;
        }
        
        .tips-title {
          text-align: center;
          margin: 0 0 25px 0;
          color: #333;
          font-size: 20px;
          font-weight: 600;
        }
        
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .tip-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }
        
        .tip-icon {
          font-size: 20px;
          width: 40px;
          height: 40px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tip-item p {
          margin: 0;
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }
        
        .reset-footer {
          text-align: center;
        }
        
        .warning-box {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 2px solid #ffc107;
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          display: flex;
          align-items: flex-start;
          gap: 20px;
          text-align: left;
        }
        
        .warning-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .warning-content h4 {
          margin: 0 0 10px 0;
          color: #856404;
          font-size: 18px;
          font-weight: 600;
        }
        
        .warning-content p {
          margin: 0;
          color: #856404;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .support-section {
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #666;
        }
        
        .support-section p {
          margin: 0 0 15px 0;
          font-size: 14px;
        }
        
        .reset-footer .support-links {
          justify-content: center;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .reset-footer .support-link {
          color: #ff6b6b;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
        }

        /* Waitlist Confirmation Styles */
        .waitlist-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .waitlist-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .waitlist-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .waitlist-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .waitlist-subtitle {
          font-size: 18px;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }
        
        .waitlist-content {
          padding: 40px 30px;
        }
        
        .waitlist-details {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: 1px solid #e9ecef;
        }
        
        .waitlist-details h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
          font-weight: 600;
        }
        
        .detail-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f1f3f4;
        }
        
        .detail-item:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }
        
        .detail-value {
          font-weight: 500;
          color: #333;
          font-size: 14px;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }
        
        .whats-next {
          margin: 40px 0;
        }
        
        .whats-next h3 {
          text-align: center;
          margin: 0 0 30px 0;
          color: #333;
          font-size: 24px;
          font-weight: 600;
        }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 25px;
        }
        
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 15px;
          border: 1px solid #e9ecef;
        }
        
        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .step-content h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
        
        .step-content p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .waitlist-footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
          color: #666;
          line-height: 1.6;
        }
        
        .waitlist-footer p {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        
        .waitlist-footer .contact-info {
          font-weight: 600;
          color: #333;
          margin-top: 20px !important;
        }

        /* Waitlist Notification Styles */
        .notification-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .notification-hero {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .notification-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .notification-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .notification-subtitle {
          font-size: 18px;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }
        
        .notification-content {
          padding: 40px 30px;
        }
        
        .alert-message {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 2px solid #ffc107;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .alert-message p {
          margin: 0;
          color: #856404;
          font-weight: 600;
          font-size: 16px;
        }
        
        .entry-details {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: 1px solid #e9ecef;
        }
        
        .entry-details h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
          font-weight: 600;
        }
        
        .detail-value.highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 12px;
        }
        
        .action-required {
          margin: 40px 0;
        }
        
        .action-required h3 {
          text-align: center;
          margin: 0 0 30px 0;
          color: #333;
          font-size: 24px;
          font-weight: 600;
        }
        
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .action-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 15px;
          border: 1px solid #e9ecef;
        }
        
        .action-icon {
          font-size: 24px;
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
        
        .action-content h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
        
        .action-content p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .quick-actions {
          margin: 40px 0;
          text-align: center;
        }
        
        .quick-actions h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
          font-weight: 600;
        }
        
        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .action-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .action-button.secondary {
          background: #f8f9fa;
          color: #333;
          border: 2px solid #e9ecef;
        }
        
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .notification-footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
          color: #666;
          line-height: 1.6;
        }
        
        .notification-footer p {
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        /* Responsive Design */
        @media only screen and (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 15px;
          }
          
          .email-header {
            padding: 20px 15px;
          }
          
          .logo-container {
            padding: 15px 20px;
          }
          
          .logo-image {
            max-width: 150px;
          }
          
          .logo-text {
            font-size: 24px;
          }
          
          .welcome-hero,
          .verification-hero,
          .otp-hero,
          .reset-hero,
          .waitlist-hero,
          .notification-hero {
            padding: 30px 20px;
          }
          
          .welcome-title,
          .verification-title,
          .otp-title,
          .reset-title,
          .waitlist-title,
          .notification-title {
            font-size: 28px;
          }
          
          .welcome-content,
          .verification-content,
          .otp-content,
          .reset-content,
          .waitlist-content,
          .notification-content {
            padding: 30px 20px;
          }
          
          .features-grid,
          .steps-grid,
          .action-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .otp-display,
          .otp-code {
            gap: 8px;
          }
          
          .otp-digit,
          .otp-character {
            width: 45px;
            height: 55px;
            font-size: 20px;
          }
          
          .security-info,
          .otp-details,
          .tips-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .cta-section {
            padding: 25px 20px;
          }
          
          .warning-box {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }
          
          .footer-content {
            padding: 30px 20px 15px;
          }
          
          .footer-links {
            grid-template-columns: 1fr;
            gap: 25px;
            text-align: center;
          }
          
          .link-group {
            margin-bottom: 20px;
          }
          
          .social-links {
            align-items: center;
          }
          
          .contact-item {
            flex-direction: column;
            gap: 5px;
          }
          
          .support-links,
          .action-buttons {
            flex-direction: column;
            gap: 10px;
          }
          
          .separator {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${header}
        ${body}
        ${footer}
      </div>
    </body>
    </html>
  `;
};
