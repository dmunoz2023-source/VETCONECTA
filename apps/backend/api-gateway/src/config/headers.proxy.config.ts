export const HEADERS_PROXY_CONFIG = {
  requestId: 'x-request-id',
  userId: 'x-user-id',
  userRole: 'x-user-role',
  clientId: 'x-client-id'
} as const

export type TypesHeaders = typeof HEADERS_PROXY_CONFIG[keyof typeof HEADERS_PROXY_CONFIG]

export const getHeaders = (header?: TypesHeaders) => {
  if (!header) {
    return Object.values(HEADERS_PROXY_CONFIG)
  }
  
  return HEADERS_PROXY_CONFIG[header]
}