// Controllers translate HTTP requests into responses. Business logic belongs
// in services once features are added, keeping controllers small.
export function getHealth(_request, response) {
  response.status(200).json({
    success: true,
    message: 'RepoPulse API Running',
  })
}
