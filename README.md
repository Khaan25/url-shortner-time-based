# Next.js 15 URL Shortener with App Router and Shadcn UI

**Live Link:** [https://url-shortner-zia-unkey.vercel.app/](https://url-shortner-zia-unkey.vercel.app/)

This project showcases a URL shortener service built with Next.js 15, leveraging the new App Router and the shadcn/ui component library. Additionally, it integrates with Unkey.com for enforcing rate limits. It also provides tiered access to shortened URLs.

## Key Features

- Next.js 15 with the new App Router
- URL shortening with variable short URL lengths based on user tier
- Rate limiting based on Unkey configurations
- Tiered access (basic and premium users)
- UI components from the shadcn/ui library

## Setup and Configuration

1. Install project dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
   or
   ```
   bun install
   ```

2. Configure environment variables:
   Create a `.env` file in the project root with the following content:
   ```
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   UNKEY_API_KEY=unkey_some_token
   REDIS_URL=https://some-redis-url.upstash.io
   REDIS_TOKEN=some-redis-token
   ```

3. Set up Unkey:
   - Register at [unkey.com](https://unkey.com)
   - Create a new API.
   - Add the API key to the `.env` file.

4. Set up Upstash:
   - Register at [upstash.com](https://upstash.com)
   - Create a new Redis database.
   - Add the Redis URL and token to the `.env` file.

5. Launch the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
   or
   ```
   bun dev
   ```

## Using the URL Shortener

- Head over to `http://localhost:3000` and enter the URL you want to shorten.
- Select your tier.
- Copy the generated short URL and share it with others.
- Access the original URL by navigating to `http://localhost:3000/{shortCode}`.

## Tiered Access and Rate Limiting

- Basic users receive 8-character short codes
- Premium users receive 5-character short codes

Rate limiting can be configured differently for each tier in the code.
