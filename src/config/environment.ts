import * as dotenv from 'dotenv';

dotenv.config();

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

if (!GITHUB_TOKEN) {
  console.error(
    'Please ensure you have set the GITHUB_TOKEN in your .env file.',
  );
  process.exit(1);
}
