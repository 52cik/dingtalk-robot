import crypto from 'crypto';

function sign(secret: string, content: string): string {
  const str = crypto.createHmac('sha256', secret).update(content).digest().toString('base64');
  return encodeURIComponent(str);
}

export default sign;
