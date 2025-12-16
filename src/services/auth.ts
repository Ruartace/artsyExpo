import { httpPost } from '@/utils/request'
import type { UserRole } from '@/types'

export type LoginResponse = { userId: string; role: UserRole; token: string }

export async function login(account: string, password: string) {
  return httpPost<LoginResponse>('/users/login/', { account, password })
}

export async function logout(token: string) {
  return httpPost<void>('/users/logout/', { token }, { Authorization: `Token ${token}` })
}
export async function getInfo(token:string){
  return httpPost<LoginResponse>('/users/info/',{},{Authorization: `Token ${token}`})
}
