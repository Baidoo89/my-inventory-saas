'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from '../config'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

type SubscriptionContextType = {
  plan: string
  isExpired: boolean
  loading: boolean
  checkSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: 'Starter',
  isExpired: false,
  loading: true,
  checkSubscription: async () => {}
})

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState('Starter')
  const [isExpired, setIsExpired] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSubscription()
  }, [])

  async function checkSubscription() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        const { data } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_expiry, created_at')
        .eq('id', user.id)
        .single()

        if (data) {
        let activePlan = data.subscription_plan || 'Starter'
        let expired = false

        // Check Pro Expiry
        if (activePlan === 'Pro Shop' && data.subscription_expiry) {
            const expiry = new Date(data.subscription_expiry)
            const now = new Date()
            if (expiry < now) {
            activePlan = 'Starter' // Downgrade logic
            }
        }

        // Check Trial Expiry (if on Starter)
        if (activePlan === 'Starter') {
            const createdAt = data.created_at ? new Date(data.created_at) : new Date()
            const now = new Date()
            const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)
            
            if (diffDays > 14) {
            expired = true
            }
        }

        setPlan(activePlan)
        setIsExpired(expired)
        }
    } catch (error) {
        console.error("Error checking subscription:", error)
    } finally {
        setLoading(false)
    }
  }

  return (
    <SubscriptionContext.Provider value={{ plan, isExpired, loading, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
