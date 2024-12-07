import { authOptions } from '@/lib/auth/auth-options'
import NextAuth from 'next-auth/next'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }