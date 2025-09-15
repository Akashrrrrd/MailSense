import * as React from 'react';

export const WelcomeEmail = ({ name = 'there' }: { name?: string }) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <h1>Welcome to MailSense, {name}!</h1>
    <p>Thank you for joining our service. We're excited to have you on board!</p>
    <p>Best regards,<br/>The MailSense Team</p>
  </div>
);
