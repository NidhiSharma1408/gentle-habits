export default async (request) => {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/api\/claude/, '');
  const targetUrl = `https://api.anthropic.com${targetPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('Host', 'api.anthropic.com');

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method !== 'GET' ? await request.text() : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
};

export const config = { path: '/api/claude/*' };
