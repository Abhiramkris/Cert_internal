'use client'

import { recordPayment } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CreditCard, IndianRupee, History, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface PaymentFormProps {
  projectId: string
  payments: any[]
}

export function PaymentForm({ projectId, payments }: PaymentFormProps) {
  const [isPending, setIsPending] = useState(false)
  
  return (
    <div className="space-y-6">
      <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl overflow-hidden shadow-sm">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6">
          <CardTitle className="flex items-center gap-2.5 text-sm font-bold text-zinc-900">
            <IndianRupee className="w-4 h-4 text-zinc-400" />
            New Payment Record
          </CardTitle>
          <CardDescription className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Financial Reconciliation</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form 
            action={async (formData) => {
              setIsPending(true)
              try {
                const res = await recordPayment(projectId, formData)
                toast.success('Payment recorded successfully')
                const form = document.getElementById('payment-form') as HTMLFormElement
                if (form) form.reset()
              } catch (error) {
                toast.error('Failed to record payment')
              } finally {
                setIsPending(false)
              }
            }} 
            id="payment-form"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
          >
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Amount (INR)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required className="bg-zinc-50 border-zinc-200 rounded-xl h-11 text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold text-zinc-900 shadow-sm placeholder:text-zinc-300" placeholder="0.00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_type" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Payment Method</Label>
              <select 
                id="payment_type" 
                name="payment_type" 
                required
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 appearance-none cursor-pointer shadow-sm"
              >
                <option value="STRIPE" className="bg-white">Credit Card / Stripe</option>
                <option value="BANK_TRANSFER" className="bg-white">Bank Transfer</option>
                <option value="PAYPAL" className="bg-white">PayPal</option>
                <option value="CASH" className="bg-white">Other / Cash</option>
              </select>
            </div>
            <PendingButton loading={isPending} type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-widest shadow-lg transition-all">
              Add Record
            </PendingButton>
            <div className="md:col-span-3 grid gap-2">
              <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Payment Description</Label>
              <Input id="notes" name="notes" className="bg-zinc-50 border-zinc-200 rounded-xl h-11 text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold text-zinc-900 shadow-sm" placeholder="e.g. Initial deposit, Phase 1 milestone..." />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl overflow-hidden shadow-sm">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6">
          <CardTitle className="flex items-center gap-2.5 text-sm font-bold text-zinc-900">
            <History className="w-4 h-4 text-zinc-400" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <th className="px-8 py-5 text-left font-bold">Date</th>
                  <th className="px-8 py-5 text-left font-bold">Method</th>
                  <th className="px-8 py-5 text-left font-bold">Details</th>
                  <th className="px-8 py-5 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {payments.length > 0 ? payments.map((p, i) => (
                  <tr key={i} className="group hover:bg-zinc-50/30 transition-colors">
                    <td className="px-8 py-5 text-zinc-500 font-bold">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-bold bg-zinc-100 text-zinc-500 uppercase tracking-widest border border-zinc-200/50">{p.payment_type}</span>
                    </td>
                    <td className="px-8 py-5 text-zinc-700 font-bold">{p.notes || '-'}</td>
                    <td className="px-8 py-5 text-right font-bold text-zinc-900 text-sm tracking-tight">₹{p.amount.toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-zinc-400 font-bold text-xs uppercase tracking-widest italic bg-zinc-50/10">No payment records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
