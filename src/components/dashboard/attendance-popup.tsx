'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Camera, MapPin, Loader2, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'

export function AttendancePopup({ userId, userRole }: { userId: string, userRole: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(true) // Default true until checked
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    checkAttendance()

    const handleOpenCheckin = () => {
      checkAttendance(true)
    }
    window.addEventListener('open-checkin', handleOpenCheckin)
    return () => window.removeEventListener('open-checkin', handleOpenCheckin)
  }, [])

  const checkAttendance = async (manualTrigger = false) => {
    try {
      setIsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking attendance:', error)
      }

      if (!data || !data.in_time) {
        setIsCheckedIn(false)
        setIsOpen(true)
        initCameraAndLocation()
      } else {
        setIsCheckedIn(true)
        if (manualTrigger) toast.info('You are already checked in for today!')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const initCameraAndLocation = async () => {
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
      console.error('Camera access error:', err)
      toast.error('Camera access is required for attendance.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    stopCamera()
  }

  const handleCheckIn = async () => {
    if (!videoRef.current || !canvasRef.current) return
    setIsSubmitting(true)

    try {
      // 1. Take Photo
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
      }
      
      const blob = await new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(resolve, 'image/jpeg', 0.8))
      if (!blob) throw new Error('Failed to capture photo')

      // 2. Upload to Storage
      const fileName = `${userId}/${new Date().toISOString()}-in.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attendance')
        .upload(fileName, blob)
      
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('attendance').getPublicUrl(fileName)

      // 3. Save to DB
      const today = new Date().toISOString().split('T')[0]
      const { error: dbError } = await supabase
        .from('attendance')
        .insert({
          user_id: userId,
          date: today,
          in_time: new Date().toISOString(),
          in_location: location ? JSON.stringify(location) : null,
          in_photo_url: publicUrl,
          status: 'present'
        })

      if (dbError) throw dbError

      // 4. Check Office Location Distance
      if (location && userRole !== 'Sales') {
        const { data: settings } = await supabase.from('company_settings').select('value').eq('key', 'office_location').single()
        if (settings?.value) {
          const { lat: officeLat, lng: officeLng, radius } = settings.value
          const R = 6371e3 // metres
          const φ1 = location.lat * Math.PI/180
          const φ2 = officeLat * Math.PI/180
          const Δφ = (officeLat-location.lat) * Math.PI/180
          const Δλ = (officeLng-location.lng) * Math.PI/180

          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          const distance = R * c

          if (distance > radius) {
            toast.warning(`You are checking in outside the office space! (${Math.round(distance)}m away)`)
            
            // Notify Admin
            const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'Admin').limit(1).single()
            if (admin) {
              await supabase.from('notifications').insert({
                user_id: admin.id,
                type: 'OUT_OF_OFFICE',
                message: `User ${userId} checked in outside the office (${Math.round(distance)}m away).`
              })
            }
          }
        }
      }

      toast.success('Successfully checked in for today!')
      setIsOpen(false)
      stopCamera()
      setIsCheckedIn(true)
      
    } catch (err: any) {
      console.error('Check in failed:', err)
      toast.error(err.message || 'Failed to check in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isCheckedIn || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-100 flex flex-col relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 text-center border-b border-zinc-100 bg-zinc-50/50">
          <div className="w-12 h-12 rounded-full bg-[#67A708]/10 text-[#67A708] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Daily Check-In</h2>
          <p className="text-zinc-500 text-sm mt-1">Please verify your attendance for today.</p>
        </div>
        
        <div className="p-6 flex flex-col gap-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 text-xs text-white font-medium">
                <Camera className="w-3 h-3" />
                Live
              </div>
              {location && (
                <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 text-xs text-white font-medium">
                  <MapPin className="w-3 h-3" />
                  Location Secured
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center">
            {userRole === 'Sales' ? (
              <span>Your location will be recorded. For sales, remote check-ins are permitted.</span>
            ) : (
              <span>Please ensure you are at the office location.</span>
            )}
          </div>
        </div>

        <div className="p-6 pt-0 mt-auto">
          <button
            onClick={handleCheckIn}
            disabled={isSubmitting || !stream}
            className="w-full h-12 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Capture & Check-In
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
