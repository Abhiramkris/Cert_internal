'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, differenceInMinutes } from 'date-fns'
import { Camera, MapPin, Loader2, Edit2, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function AttendanceClient({ 
  initialRecords,
  userId,
  isHR,
  isManager
}: { 
  initialRecords: any[],
  userId: string,
  isHR: boolean,
  isManager: boolean
}) {
  const [records, setRecords] = useState(initialRecords)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  
  const [adjustingRecord, setAdjustingRecord] = useState<any>(null)
  const [adjustReason, setAdjustReason] = useState('')
  const [newInTime, setNewInTime] = useState('')
  const [newOutTime, setNewOutTime] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()

  const todayRecord = records.find(r => r.user_id === userId && r.date === new Date().toISOString().split('T')[0])
  const needsCheckOut = todayRecord && !todayRecord.out_time

  const startCheckOut = async () => {
    setIsCameraOpen(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.warn('Location access denied', err)
        )
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error(err)
      toast.error('Camera access is required for check out.')
      setIsCameraOpen(false)
    }
  }

  const handleCheckOut = async () => {
    if (!videoRef.current || !canvasRef.current || !todayRecord) return
    setIsCheckingOut(true)

    try {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
      }
      
      const blob = await new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(resolve, 'image/jpeg', 0.8))
      if (!blob) throw new Error('Failed to capture photo')

      const fileName = `${userId}/${new Date().toISOString()}-out.jpg`
      const { error: uploadError } = await supabase.storage.from('attendance').upload(fileName, blob)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('attendance').getPublicUrl(fileName)
      const outTime = new Date().toISOString()

      const { error: dbError } = await supabase
        .from('attendance')
        .update({
          out_time: outTime,
          out_location: location ? JSON.stringify(location) : null,
          out_photo_url: publicUrl,
        })
        .eq('id', todayRecord.id)

      if (dbError) throw dbError

      // Check Office Location Distance for Check-out
      if (location) {
        // Find user role from todayRecord
        const role = todayRecord.profiles?.role || ''
        if (role !== 'Sales') {
          const { data: settings } = await supabase.from('company_settings').select('value').eq('key', 'office_location').single()
          if (settings?.value) {
            const { lat: officeLat, lng: officeLng, radius } = settings.value
            const R = 6371e3
            const φ1 = location.lat * Math.PI/180
            const φ2 = officeLat * Math.PI/180
            const Δφ = (officeLat-location.lat) * Math.PI/180
            const Δλ = (officeLng-location.lng) * Math.PI/180
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            const distance = R * c

            if (distance > radius) {
              toast.warning(`You checked out outside the office space! (${Math.round(distance)}m away)`)
              const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'Admin').limit(1).single()
              if (admin) {
                await supabase.from('notifications').insert({
                  user_id: admin.id,
                  type: 'OUT_OF_OFFICE',
                  message: `User ${todayRecord.profiles?.full_name || userId} checked out outside the office (${Math.round(distance)}m away).`
                })
              }
            }
          }
        }
      }

      setRecords(records.map(r => r.id === todayRecord.id ? { ...r, out_time: outTime, out_photo_url: publicUrl } : r))
      toast.success('Successfully checked out!')
      closeCamera()
      
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Check out failed.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const closeCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    setIsCameraOpen(false)
  }

  const submitAdjustment = async () => {
    if (!adjustingRecord || !newInTime || !adjustReason) {
      toast.error('Please fill all required fields.')
      return
    }

    try {
      const { error: logError } = await supabase.from('attendance_logs').insert({
        attendance_id: adjustingRecord.id,
        adjusted_by: userId,
        reason: adjustReason,
        previous_in_time: adjustingRecord.in_time,
        previous_out_time: adjustingRecord.out_time,
        new_in_time: new Date(`${adjustingRecord.date}T${newInTime}`).toISOString(),
        new_out_time: newOutTime ? new Date(`${adjustingRecord.date}T${newOutTime}`).toISOString() : null,
      })

      if (logError) throw logError

      const { error: updateError } = await supabase.from('attendance').update({
        in_time: new Date(`${adjustingRecord.date}T${newInTime}`).toISOString(),
        out_time: newOutTime ? new Date(`${adjustingRecord.date}T${newOutTime}`).toISOString() : null,
        status: 'adjusted'
      }).eq('id', adjustingRecord.id)

      if (updateError) throw updateError

      // Fetch admin user to send notification
      const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'Admin').limit(1).single()
      if (admin) {
        await supabase.from('notifications').insert({
          user_id: admin.id,
          type: 'ATTENDANCE_ADJUSTED',
          message: `Attendance adjusted for ${adjustingRecord.profiles.full_name}. Reason: ${adjustReason}`
        })
      }

      toast.success('Attendance adjusted successfully.')
      setRecords(records.map(r => r.id === adjustingRecord.id ? { 
        ...r, 
        in_time: new Date(`${adjustingRecord.date}T${newInTime}`).toISOString(),
        out_time: newOutTime ? new Date(`${adjustingRecord.date}T${newOutTime}`).toISOString() : null,
        status: 'adjusted'
      } : r))
      setAdjustingRecord(null)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to adjust attendance.')
    }
  }

  const formatTotalTime = (inTime: string, outTime: string | null) => {
    if (!outTime) return '-'
    const mins = differenceInMinutes(new Date(outTime), new Date(inTime))
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  return (
    <div className="space-y-6">
      {needsCheckOut && (
        <Card className="bg-[#67A708]/5 border-[#67A708]/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900">You are currently checked in.</h3>
              <p className="text-sm text-zinc-500">Don't forget to check out before leaving.</p>
            </div>
            <button
              onClick={startCheckOut}
              className="bg-[#67A708] hover:bg-[#5a9307] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#67A708]/20"
            >
              <LogOut className="w-4 h-4" />
              Check Out
            </button>
          </CardContent>
        </Card>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Check Out</h2>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center mb-6">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeCamera}
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-950 text-white font-semibold hover:bg-zinc-900 flex justify-center items-center gap-2"
              >
                {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Check Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {adjustingRecord && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Adjust Attendance</h2>
            <p className="text-sm text-zinc-500 mb-6">Adjusting for {adjustingRecord.profiles.full_name} on {adjustingRecord.date}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-zinc-600 mb-1 block">New In Time (HH:MM)</label>
                <input 
                  type="time" 
                  value={newInTime} 
                  onChange={e => setNewInTime(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 mb-1 block">New Out Time (HH:MM) - Optional</label>
                <input 
                  type="time" 
                  value={newOutTime} 
                  onChange={e => setNewOutTime(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 mb-1 block">Reason for adjustment</label>
                <textarea 
                  value={adjustReason} 
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 resize-none h-24"
                  placeholder="e.g. Forgot to check in, system issue..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdjustingRecord(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAdjustment}
                className="flex-1 px-4 py-2 rounded-xl bg-[#67A708] text-white font-semibold hover:bg-[#5a9307]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Date</th>
                {(isHR || isManager) && <th className="px-6 py-4">Name</th>}
                <th className="px-6 py-4">In Time</th>
                <th className="px-6 py-4">Out Time</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                {isHR && <th className="px-6 py-4">Photos</th>}
                {isHR && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{format(new Date(record.date), 'MMM d, yyyy')}</td>
                  {(isHR || isManager) && (
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">{record.profiles?.full_name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">{record.profiles?.role}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-zinc-600">
                    {record.in_time ? format(new Date(record.in_time), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {record.out_time ? format(new Date(record.out_time), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-700">
                    {formatTotalTime(record.in_time, record.out_time)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                        IN
                      </Badge>
                      {record.out_time ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">
                          OUT
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 border border-zinc-200 animate-pulse">
                          OUT PENDING
                        </Badge>
                      )}
                      {record.status === 'adjusted' && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border border-amber-200">
                          ADJUSTED
                        </Badge>
                      )}
                    </div>
                  </td>
                  {isHR && (
                    <td className="px-6 py-4 flex items-center gap-2">
                      {record.in_photo_url && (
                        <a href={record.in_photo_url} target="_blank" rel="noreferrer" title="In Photo">
                          <img src={record.in_photo_url} alt="In" className="w-8 h-8 rounded-md object-cover border border-zinc-200 hover:scale-150 transition-transform cursor-pointer bg-zinc-100" />
                        </a>
                      )}
                      {record.out_photo_url && (
                        <a href={record.out_photo_url} target="_blank" rel="noreferrer" title="Out Photo">
                          <img src={record.out_photo_url} alt="Out" className="w-8 h-8 rounded-md object-cover border border-zinc-200 hover:scale-150 transition-transform cursor-pointer bg-zinc-100" />
                        </a>
                      )}
                    </td>
                  )}
                  {isHR && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setAdjustingRecord(record)
                          setNewInTime(record.in_time ? format(new Date(record.in_time), 'HH:mm') : '')
                          setNewOutTime(record.out_time ? format(new Date(record.out_time), 'HH:mm') : '')
                          setAdjustReason('')
                        }}
                        className="text-zinc-400 hover:text-amber-600 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={isHR || isManager ? 7 : 6} className="px-6 py-12 text-center text-zinc-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
