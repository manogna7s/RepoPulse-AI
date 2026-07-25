// A final 404 middleware produces consistent JSON instead of Express's default
// HTML response, which is easier for API clients to handle.
export function notFound(request, response) {
  response.status(404).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  })
}
