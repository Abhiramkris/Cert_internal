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
      <Card className="bg-white border-2 border-zinc-200 text-zinc-900 rounded-none overflow-hidden shadow-none mb-8">
        <CardHeader className="bg-white border-b border-zinc-100 py-6 px-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-zinc-100 bg-zinc-50 flex items-center justify-center rounded-none shadow-sm">
              <IndianRupee className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Financial Unit</span>
              <CardTitle className="text-lg font-black text-zinc-900 uppercase tracking-[0.1em] italic">New Payment Record</CardTitle>
            </div>
          </div>
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
          >
            <div className="space-y-0">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-b border-zinc-50 items-center group/field">
                  <Label htmlFor="amount" className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover/field:text-zinc-950 transition-colors">Amount (INR Unit)</Label>
                  <div className="md:col-span-2">
                     <Input id="amount" name="amount" type="number" step="0.01" required className="h-11 bg-[#fafafa] border border-zinc-100 rounded-none px-4 text-[11px] font-black uppercase tracking-widest text-zinc-900 focus:bg-white focus:border-zinc-900 transition-all placeholder:text-zinc-200" placeholder="0.00" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-b border-zinc-50 items-center group/field">
                  <Label htmlFor="payment_type" className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover/field:text-zinc-950 transition-colors">Payment Method</Label>
                  <div className="md:col-span-2">
                     <select 
                        id="payment_type" 
                        name="payment_type" 
                        required
                        className="w-full h-11 bg-[#fafafa] border border-zinc-100 px-4 text-[11px] font-black uppercase tracking-widest text-zinc-900 focus:bg-white focus:border-zinc-900 transition-all appearance-none cursor-pointer outline-none rounded-none"
                     >
                        <option value="STRIPE">Credit Card / Stripe</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="PAYPAL">PayPal</option>
                        <option value="CASH">Other / Cash</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-b border-zinc-50 items-start group/field">
                  <Label htmlFor="notes" className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover/field:text-zinc-950 transition-colors pt-4">Description</Label>
                  <div className="md:col-span-2">
                     <textarea id="notes" name="notes" className="min-h-[100px] w-full bg-[#fafafa] border border-zinc-100 p-4 text-[11px] font-black uppercase tracking-widest text-zinc-900 focus:bg-white focus:border-zinc-900 transition-all outline-none resize-none placeholder:text-zinc-200 rounded-none" placeholder="e.g. Initial deposit, Phase 1 milestone..." />
                  </div>
               </div>

               <div className="pt-8 flex justify-end">
                  <PendingButton loading={isPending} type="submit" className="h-12 px-10 bg-zinc-950 text-white rounded-none border border-zinc-200 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-sm">
                     Authorize Payment Record
                  </PendingButton>
               </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-2 border-zinc-200 text-zinc-900 rounded-none overflow-hidden shadow-none">
        <CardHeader className="bg-white border-b border-zinc-100 py-6 px-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-zinc-100 bg-zinc-50 flex items-center justify-center rounded-none shadow-sm">
              <History className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Audit Ledger</span>
              <CardTitle className="text-lg font-black text-zinc-900 uppercase tracking-[0.1em] italic">Payment History</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Timestamp</th>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Vector</th>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Manifest</th>
                  <th className="px-8 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Quantum (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {payments.length > 0 ? payments.map((p, i) => (
                  <tr key={i} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest tabular-nums">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-none text-[9px] font-black bg-zinc-100 text-zinc-600 uppercase tracking-widest border border-zinc-200">
                        {(p.payment_method || '-').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[11px] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">{p.notes || '-'}</td>
                    <td className="px-8 py-6 text-right font-black text-zinc-950 text-base tracking-tighter italic">₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-zinc-300 font-black text-[10px] uppercase tracking-[0.4em] italic bg-zinc-50/10">Zero Records Found</td>
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
