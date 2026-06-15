'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShieldCheck, Mail, Calendar, UserIcon, Edit2, ArrowLeft, Clock, FileDown, Printer } from 'lucide-react'
import { format, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  avatar_url: string | null
  created_at: string
}

export default function TeamManagementClient({ 
  profiles, 
  isEditable, 
  currentUserRole 
}: { 
  profiles: Profile[], 
  isEditable: boolean,
  currentUserRole: string | undefined
}) {
  const router = useRouter()
  const supabase = createClient()
  const [viewMode, setViewMode] = useState<'members' | 'attendance'>('members')
  const [attendanceSubView, setAttendanceSubView] = useState<'daily' | 'weekly'>('daily')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [weeklyRecords, setWeeklyRecords] = useState<any[]>([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)

  const isAdminOrHR = currentUserRole === 'Admin' || currentUserRole === 'HR' || currentUserRole === 'Super Admin'

  const fetchAttendance = async (dateStr: string) => {
    setIsLoadingAttendance(true)
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(full_name, role, email, avatar_url)')
        .eq('date', dateStr)
      if (error) throw error
      setAttendanceRecords(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load attendance records.')
    } finally {
      setIsLoadingAttendance(false)
    }
  }

  const fetchWeeklyAttendance = async (dateStr: string) => {
    setIsLoadingAttendance(true)
    try {
      const baseDate = parseISO(dateStr)
      const start = startOfWeek(baseDate, { weekStartsOn: 1 })
      const end = endOfWeek(baseDate, { weekStartsOn: 1 })
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(id, full_name, role, email, avatar_url)')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
      
      if (error) throw error
      setWeeklyRecords(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load weekly attendance.')
    } finally {
      setIsLoadingAttendance(false)
    }
  }

  useEffect(() => {
    if (viewMode === 'attendance') {
      if (attendanceSubView === 'daily') {
        fetchAttendance(selectedDate)
      } else {
        fetchWeeklyAttendance(selectedDate)
      }
    }
  }, [viewMode, attendanceSubView, selectedDate])

  const formatTotalTime = (inTime: string, outTime: string | null) => {
    if (!outTime) return '-'
    const mins = differenceInMinutes(new Date(outTime), new Date(inTime))
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  // Calculate weekly matrix data
  const baseDate = parseISO(selectedDate)
  const start = startOfWeek(baseDate, { weekStartsOn: 1 })
  const end = endOfWeek(baseDate, { weekStartsOn: 1 })
  const daysOfWeek = eachDayOfInterval({ start, end })

  const weeklyMap = new Map<string, Map<string, any>>()
  weeklyRecords.forEach(rec => {
    if (!weeklyMap.has(rec.user_id)) {
      weeklyMap.set(rec.user_id, new Map())
    }
    weeklyMap.get(rec.user_id)!.set(rec.date, rec)
  })

  const weeklyData = profiles.map(profile => {
    const userMap = weeklyMap.get(profile.id)
    let presentDays = 0
    let absentDays = 0
    let totalMins = 0
    
    const daysData = daysOfWeek.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const record = userMap?.get(dateStr)
      const isDayPresent = !!record
      const isPastOrToday = day <= new Date()
      
      let mins = 0
      if (record?.in_time && record?.out_time) {
        mins = differenceInMinutes(new Date(record.out_time), new Date(record.in_time))
        totalMins += mins
      }
      
      if (isDayPresent) {
        presentDays++
      } else if (isPastOrToday) {
        absentDays++
      }
      
      return {
        dateStr,
        present: isDayPresent,
        mins,
        record
      }
    })
    
    return {
      profile,
      daysData,
      presentDays,
      absentDays,
      totalHours: (totalMins / 60).toFixed(1)
    }
  })

  const exportToCSV = () => {
    if (attendanceSubView === 'daily') {
      const headers = ['Name', 'Email', 'Role', 'In Time', 'Out Time', 'Total Time', 'Status']
      const rows = attendanceRecords.map(rec => [
        rec.profiles?.full_name || 'No Name',
        rec.profiles?.email || '',
        rec.profiles?.role || '',
        rec.in_time ? format(new Date(rec.in_time), 'hh:mm a') : '-',
        rec.out_time ? format(new Date(rec.out_time), 'hh:mm a') : '-',
        formatTotalTime(rec.in_time, rec.out_time),
        rec.status || 'present'
      ])
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `attendance_daily_report_${selectedDate}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      const headers = [
        'Name', 
        'Email', 
        'Role', 
        'Total Hours', 
        'Present Days', 
        'Absent Days',
        ...daysOfWeek.map(d => format(d, 'EEE (MMM d)'))
      ]

      const rows = weeklyData.map(row => {
        const dayStatuses = row.daysData.map(day => {
          const isPastOrToday = parseISO(day.dateStr) <= new Date()
          return day.present ? 'P' : isPastOrToday ? 'A' : '-'
        })
        return [
          row.profile.full_name || 'No Name',
          row.profile.email,
          row.profile.role,
          row.totalHours,
          row.presentDays,
          row.absentDays,
          ...dayStatuses
        ]
      })
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `attendance_weekly_report_${format(start, 'yyyyMMdd')}_to_${format(end, 'yyyyMMdd')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const exportToPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, sidebar, button, input, header, .no-print, [role="navigation"], .no-print-area {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      ` }} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Team Management</h1>
          {isAdminOrHR && (
            <div>
              {viewMode === 'attendance' ? (
                <button 
                  onClick={() => setViewMode('members')}
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 px-3 py-2 rounded-lg transition-colors border border-zinc-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Members
                </button>
              ) : (
                <button 
                  onClick={() => setViewMode('attendance')}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-[#67A708] hover:bg-[#5a9307] px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Clock className="w-4 h-4" />
                  Today's Attendance
                </button>
              )}
            </div>
          )}
        </div>

        {viewMode === 'attendance' && isAdminOrHR && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-zinc-100 shadow-sm">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Filter Date:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-zinc-200 rounded-lg px-3 py-1.5 text-sm bg-white font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#67A708]/20 focus:border-[#67A708]"
            />
          </div>
        )}
      </div>

      {viewMode === 'attendance' && isAdminOrHR && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm no-print">
          <div className="flex gap-2 bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setAttendanceSubView('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                attendanceSubView === 'daily' 
                  ? 'bg-white text-zinc-950 shadow-sm' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setAttendanceSubView('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                attendanceSubView === 'weekly' 
                  ? 'bg-white text-zinc-950 shadow-sm' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Weekly Matrix
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 hover:bg-[#67A708] hover:text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 hover:bg-[#67A708] hover:text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Export PDF / Print
            </button>
          </div>
        </div>
      )}

      {viewMode === 'members' ? (
        <Card className="border-zinc-100 shadow-sm overflow-hidden print-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Team Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  {isEditable && <th className="px-6 py-4 text-right no-print">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {profiles.map(profile => (
                  <tr 
                    key={profile.id} 
                    onClick={() => router.push(`/dashboard/attendance?userId=${profile.id}`)}
                    className="hover:bg-zinc-50/50 transition-colors bg-white cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-zinc-100">
                          <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                          <AvatarFallback className="bg-zinc-950 text-white font-semibold text-xs">
                            {profile.full_name?.charAt(0) || profile.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                            {profile.full_name || 'No Name'}
                            {profile.role === 'Admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#67A708]" />}
                          </h3>
                          <p className="text-xs text-zinc-500 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none">
                        {profile.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-medium">
                      {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </td>
                    {isEditable && (
                      <td className="px-6 py-4 text-right no-print" onClick={e => e.stopPropagation()}>
                        <button className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 rounded-lg hover:bg-zinc-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={isEditable ? 4 : 3} className="px-6 py-12 text-center text-zinc-500">
                      No team members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : attendanceSubView === 'daily' ? (
        <Card className="border-zinc-100 shadow-sm overflow-hidden print-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">In Time</th>
                  <th className="px-6 py-4">Out Time</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 no-print">Photos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoadingAttendance ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No attendance records found for {format(new Date(selectedDate), 'MMMM d, yyyy')}.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map(record => (
                    <tr 
                      key={record.id} 
                      onClick={() => router.push(`/dashboard/attendance?userId=${record.user_id}`)}
                      className="hover:bg-zinc-50/50 transition-colors bg-white cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-zinc-100">
                            <AvatarImage src={record.profiles?.avatar_url || ''} alt={record.profiles?.full_name || ''} />
                            <AvatarFallback className="bg-zinc-950 text-white font-semibold text-xs">
                              {record.profiles?.full_name?.charAt(0) || record.profiles?.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                              {record.profiles?.full_name || 'No Name'}
                              {record.profiles?.role === 'Admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#67A708]" />}
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium tracking-wide mt-0.5">
                              {record.profiles?.role}
                            </p>
                          </div>
                        </div>
                      </td>
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
                      <td className="px-6 py-4 flex items-center gap-2 no-print" onClick={e => e.stopPropagation()}>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="border-zinc-100 shadow-sm overflow-hidden print-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-center">Weekly Matrix ({format(start, 'MMM d')} - {format(end, 'MMM d')})</th>
                  <th className="px-6 py-4 text-center">Hours</th>
                  <th className="px-6 py-4 text-center">Present</th>
                  <th className="px-6 py-4 text-center">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoadingAttendance ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      Loading weekly matrix...
                    </td>
                  </tr>
                ) : weeklyData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No team members found to generate matrix.
                    </td>
                  </tr>
                ) : (
                  weeklyData.map(row => (
                    <tr 
                      key={row.profile.id}
                      onClick={() => router.push(`/dashboard/attendance?userId=${row.profile.id}`)}
                      className="hover:bg-zinc-50/50 transition-colors bg-white cursor-pointer animate-in fade-in"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-zinc-100">
                            <AvatarImage src={row.profile.avatar_url || ''} alt={row.profile.full_name || ''} />
                            <AvatarFallback className="bg-zinc-950 text-white font-semibold text-xs">
                              {row.profile.full_name?.charAt(0) || row.profile.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                              {row.profile.full_name || 'No Name'}
                            </h3>
                            <p className="text-xs text-zinc-500">
                              {row.profile.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          {row.daysData.map((day, idx) => {
                            const isPastOrToday = parseISO(day.dateStr) <= new Date()
                            return (
                              <div 
                                key={idx}
                                title={`${format(parseISO(day.dateStr), 'EEEE, MMM d')}: ${day.present ? 'Present' : isPastOrToday ? 'Absent' : 'Future'}`}
                                className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center border transition-all ${
                                  day.present 
                                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' 
                                    : isPastOrToday 
                                      ? 'bg-rose-50 text-rose-500 border-rose-200' 
                                      : 'bg-zinc-50 text-zinc-300 border-zinc-100 border-dashed'
                                }`}
                              >
                                <span className="text-[10px] font-bold">
                                  {day.present ? 'P' : isPastOrToday ? 'A' : '-'}
                                </span>
                                <span className="text-[8px] opacity-75 font-semibold uppercase leading-none">
                                  {format(parseISO(day.dateStr), 'EEE').charAt(0)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-zinc-700">
                        {row.totalHours}h
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {row.presentDays} Days
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="bg-rose-50 text-rose-700 border border-rose-100">
                          {row.absentDays} Days
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
