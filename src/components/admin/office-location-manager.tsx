'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function OfficeLocationManager() {
  const [location, setLocation] = useState({ lat: 0, lng: 0, radius: 100 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('value')
        .eq('key', 'office_location')
        .single()
        
      if (error && error.code !== 'PGRST116') throw error
      if (data?.value) {
        setLocation(data.value)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          key: 'office_location',
          value: location
        }, { onConflict: 'key' })

      if (error) throw error
      toast.success('Office location saved successfully.')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save location.')
    } finally {
      setIsSaving(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude })),
        (err) => toast.error('Failed to get current location.')
      )
    } else {
      toast.error('Geolocation is not supported by your browser.')
    }
  }

  if (isLoading) return null

  return (
    <Card className="border-zinc-100 shadow-sm mt-8">
      <CardHeader className="bg-zinc-50 border-b border-zinc-100 p-6">
        <CardTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#67A708]" />
          Office Location Settings
        </CardTitle>
        <p className="text-sm text-zinc-500 mt-1">Set the allowed check-in area for employees. (Sales are exempt)</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-xs font-semibold text-zinc-600 mb-2 block uppercase tracking-wider">Latitude</label>
            <input 
              type="number" 
              step="any"
              value={location.lat} 
              onChange={e => setLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 mb-2 block uppercase tracking-wider">Longitude</label>
            <input 
              type="number" 
              step="any"
              value={location.lng} 
              onChange={e => setLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 mb-2 block uppercase tracking-wider">Allowed Radius (meters)</label>
            <input 
              type="number" 
              value={location.radius} 
              onChange={e => setLocation(prev => ({ ...prev, radius: parseInt(e.target.value) || 100 }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-zinc-100 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
          >
            Use My Current Location
          </button>
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-zinc-950 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm ml-auto"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Location
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
