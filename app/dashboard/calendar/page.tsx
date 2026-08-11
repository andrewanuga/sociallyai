"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, LayoutGrid, ChevronLeft, ChevronRight, Plus, Camera, AtSign, Building2, Layout, Sparkles, Bot, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { PageHeader, GlassCard, Pill, PrimaryButton } from "@/components/dashboard/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import imageCompression from "browser-image-compression";

const MOCK_SCHEDULE = [
  { id: 1, day: 2, time: "09:00 AM", platform: "Instagram", type: "Reel", title: "Behind the Scenes at Agency" },
  { id: 2, day: 2, time: "02:30 PM", platform: "X", type: "Thread", title: "Outbound Strategy Breakdown" },
  { id: 3, day: 4, time: "11:00 AM", platform: "LinkedIn", type: "Carousel", title: "5 AI Prompts for Sales" },
  { id: 4, day: 5, time: "10:00 AM", platform: "Instagram", type: "Post", title: "Client Testimonial" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/* ─── Mini Date Picker Popup ─────────────────────────────────── */
function MiniDatePicker({
  currentMonth, currentYear, onSelect, onClose
}: {
  currentMonth: number; currentYear: number;
  onSelect: (month: number, year: number) => void;
  onClose: () => void;
}) {
  const [pickerYear, setPickerYear] = useState(currentYear);
  const now = new Date();

  return (
    <div
      className="absolute top-full left-0 mt-2 z-50 w-[280px] rounded-2xl border border-[var(--stroke)] shadow-2xl overflow-hidden"
      style={{ background: '#121212' }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Year navigator */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--stroke)]">
        <button
          onClick={() => setPickerYear(y => y - 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[15px] font-bold text-[var(--fg)]">{pickerYear}</span>
        <button
          onClick={() => setPickerYear(y => y + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Month grid */}
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {MONTHS_SHORT.map((m, i) => {
          const isSelected = i === currentMonth && pickerYear === currentYear;
          const isThisMonth = i === now.getMonth() && pickerYear === now.getFullYear();
          return (
            <button
              key={m}
              onClick={() => { onSelect(i, pickerYear); onClose(); }}
              className={`py-2 rounded-xl text-[13px] font-semibold transition-all ${
                isSelected
                  ? 'bg-[var(--sai-indigo)] text-white shadow-lg'
                  : isThisMonth
                  ? 'border border-[var(--sai-indigo)]/50 text-[var(--sai-indigo)] hover:bg-[var(--sai-indigo)]/10'
                  : 'text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
      {/* Quick jump to today */}
      <div className="px-3 pb-3">
        <button
          onClick={() => { onSelect(now.getMonth(), now.getFullYear()); onClose(); }}
          className="w-full py-2 rounded-xl text-[13px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] border border-[var(--stroke)] hover:bg-[var(--hover)] transition-all"
        >
          Jump to Today
        </button>
      </div>
    </div>
  );
}

/* ─── Date Picker ────────────────────────────────────── */
function DatePicker({
  value, onChange
}: {
  value: { year: number; month: number; day: number } | null;
  onChange: (v: { year: number; month: number; day: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [pickerMonth, setPickerMonth] = useState(() => value?.month ?? new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(() => value?.year ?? new Date().getFullYear());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const now = new Date();

  const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
  const firstDay = getFirstDayOfMonth(pickerYear, pickerMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const isSelectedDay = (d: number) =>
    value && d === value.day && pickerMonth === value.month && pickerYear === value.year;
  const isToday = (d: number) =>
    d === now.getDate() && pickerMonth === now.getMonth() && pickerYear === now.getFullYear();

  const prevPMonth = () => {
    if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); }
    else setPickerMonth(m => m - 1);
  };
  const nextPMonth = () => {
    if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); }
    else setPickerMonth(m => m + 1);
  };

  const handleOpen = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(v => !v);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const portal = document.getElementById('date-picker-portal');
      if (portal && portal.contains(target)) return;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const display = value
    ? `${MONTHS_SHORT[value.month]} ${value.day}, ${value.year}`
    : '';

  const dropdown = open && rect && createPortal(
    <div
      id="date-picker-portal"
      style={{
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        zIndex: 9999,
        width: '280px',
        background: '#121212',
        borderRadius: '16px',
        border: '1px solid var(--stroke)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom:'1px solid var(--stroke)' }}>
        <button onClick={prevPMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[13px] font-bold text-[var(--fg)]">{MONTHS_SHORT[pickerMonth]} {pickerYear}</span>
        <button onClick={nextPMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-2.5 pt-2 pb-2.5">
        <div className="grid grid-cols-7 mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold uppercase text-[var(--fg-4)] py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - firstDay + 1;
            const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
            return (
              <button
                key={i}
                disabled={!inMonth}
                onClick={() => { if (inMonth) { onChange({ year: pickerYear, month: pickerMonth, day: dayNum }); setOpen(false); } }}
                className={`h-7 w-full rounded-lg text-[11px] font-semibold transition-all ${
                  !inMonth ? 'opacity-0 pointer-events-none' :
                  isSelectedDay(dayNum) ? 'bg-[var(--sai-indigo)] text-white shadow-md' :
                  isToday(dayNum) ? 'border border-[var(--sai-indigo)]/60 text-[var(--sai-indigo)]' :
                  'text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]'
                }`}
              >
                {inMonth ? dayNum : ''}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors ${
          open ? 'border-[var(--sai-indigo)] bg-[var(--panel-fill-2)]'
               : 'border-[var(--stroke)] bg-[var(--panel-fill-2)] hover:border-[var(--sai-indigo)]/50'
        }`}
      >
        <span className={value ? 'text-[var(--fg)]' : 'text-[var(--fg-4)] text-[13px]'}>
          {display || 'Pick a date'}
        </span>
        <CalendarIcon className="w-3.5 h-3.5 text-[var(--fg-4)] shrink-0" />
      </button>
      {dropdown}
    </div>
  );
}

/* ─── Time Picker ────────────────────────────────────── */
/* ─── Time Picker ────────────────────────────────────── */
function TimePicker({
  value, onChange
}: {
  value: { hour: number; minute: number; ampm: 'AM' | 'PM' } | null;
  onChange: (v: { hour: number; minute: number; ampm: 'AM' | 'PM' }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const HOURS = [1,2,3,4,5,6,7,8,9,10,11,12];
  const MINUTES = [0,5,10,15,20,25,30,35,40,45,50,55];

  const handleOpen = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(v => !v);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const portal = document.getElementById('time-picker-portal');
      if (portal && portal.contains(target)) return;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const display = value
    ? `${value.hour}:${String(value.minute).padStart(2,'0')} ${value.ampm}`
    : '';

  const dropdown = open && rect && createPortal(
    <div
      id="time-picker-portal"
      style={{
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        zIndex: 9999,
        width: '220px',
        background: '#121212',
        borderRadius: '16px',
        border: '1px solid var(--stroke)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="px-3 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] mb-2">Hour</p>
        <div className="grid grid-cols-4 gap-1">
          {HOURS.map(h => (
            <button
              key={h}
              onClick={() => onChange({ hour: h, minute: value?.minute ?? 0, ampm: value?.ampm ?? 'AM' })}
              className={`py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                value?.hour === h
                  ? 'bg-[var(--sai-indigo)] text-white'
                  : 'text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--stroke)] mx-3 my-2" />

      <div className="px-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] mb-2">Minute</p>
        <div className="grid grid-cols-4 gap-1">
          {MINUTES.map(m => (
            <button
              key={m}
              onClick={() => onChange({ hour: value?.hour ?? 12, minute: m, ampm: value?.ampm ?? 'AM' })}
              className={`py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                value?.minute === m
                  ? 'bg-[var(--sai-indigo)] text-white'
                  : 'text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]'
              }`}
            >
              {String(m).padStart(2,'0')}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--stroke)] mx-3 my-2" />

      <div className="px-3 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] mb-2">AM / PM</p>
        <div className="grid grid-cols-2 gap-1">
          {(['AM','PM'] as const).map(ap => (
            <button
              key={ap}
              onClick={() => onChange({ hour: value?.hour ?? 12, minute: value?.minute ?? 0, ampm: ap })}
              className={`py-2 rounded-xl text-[12px] font-bold transition-all ${
                value?.ampm === ap
                  ? 'bg-[var(--sai-indigo)] text-white shadow-md'
                  : 'text-[var(--fg-3)] border border-[var(--stroke)] hover:bg-[var(--hover)] hover:text-[var(--fg)]'
              }`}
            >
              {ap}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors ${
          open ? 'border-[var(--sai-indigo)] bg-[var(--panel-fill-2)]'
               : 'border-[var(--stroke)] bg-[var(--panel-fill-2)] hover:border-[var(--sai-indigo)]/50'
        }`}
      >
        <span className={value ? 'text-[var(--fg)]' : 'text-[var(--fg-4)] text-[13px]'}>
          {display || 'Pick a time'}
        </span>
        <svg className="w-3.5 h-3.5 text-[var(--fg-4)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>
      {dropdown}
    </div>
  );
}


export default function CalendarPage() {
  const supabase = createClient();
  const { error: toastError, success: toastSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const now = new Date();
  const [view, setView] = useState<"calendar" | "grid">("calendar");
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const [showAiModal, setShowAiModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [aiTaskTitle, setAiTaskTitle] = useState("");
  const [aiTaskPrompt, setAiTaskPrompt] = useState("");
  const [aiTaskPlatform, setAiTaskPlatform] = useState("");
  const [aiTaskDate, setAiTaskDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const [aiTaskTime, setAiTaskTime] = useState<{ hour: number; minute: number; ampm: 'AM' | 'PM' } | null>(null);
  
  const [accounts, setAccounts] = useState<{ id: string; platform: string; handle?: string; display_name?: string }[]>([]);
  const [mediaFiles, setMediaFiles] = useState<{ file: File; previewUrl: string; type: 'image'|'video' }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Fetch accounts
    const { data: accountsData } = await supabase
      .from("social_accounts")
      .select("id, platform, handle, display_name");
    
    if (accountsData && accountsData.length > 0) {
      setAccounts(accountsData);
      setAiTaskPlatform(accountsData[0].platform);
    }

    // Fetch scheduled tasks for calendar
    const { data: tasksData } = await supabase
      .from("scheduled_ai_tasks")
      .select("id, title, platform, trigger_at, status")
      .eq("status", "pending")
      .order("trigger_at", { ascending: true });
      
    if (tasksData) {
      setScheduledTasks(tasksData);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goToday = () => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()); };

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDatePicker]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    
    if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
      toastError("File too large", "Videos must be under 50MB.");
      return;
    }

    let finalFile = file;
    if (file.type.startsWith('image/')) {
      try {
        finalFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      } catch (err) {
        console.error("Compression error:", err);
      }
    }

    const previewUrl = URL.createObjectURL(finalFile);
    setMediaFiles(prev => [...prev, { file: finalFile, previewUrl, type: finalFile.type.startsWith('video/') ? 'video' : 'image' }]);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSaveTask = async () => {
    if (!aiTaskTitle || !aiTaskPrompt || !aiTaskDate || !aiTaskTime) {
      toastError("Missing Fields", "Please fill in title, instructions, date and time.");
      return;
    }
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let uploadedUrls: string[] = [];
      
      for (const media of mediaFiles) {
        const fileExt = media.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, media.file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Merge date + time into ISO string
      const { year, month, day } = aiTaskDate;
      const { hour, minute, ampm } = aiTaskTime;
      let h24 = hour;
      if (ampm === 'PM' && hour !== 12) h24 = hour + 12;
      if (ampm === 'AM' && hour === 12) h24 = 0;
      const triggerAt = new Date(year, month, day, h24, minute).toISOString();
      const displayTime = new Date(year, month, day, h24, minute).toLocaleString();

      const { error: dbError } = await supabase.from('scheduled_ai_tasks').insert({
        user_id: user.id, title: aiTaskTitle, prompt: aiTaskPrompt,
        platform: aiTaskPlatform, trigger_at: triggerAt, media_urls: uploadedUrls, status: 'pending'
      });
      if (dbError) throw dbError;

      const taskNotes = `📅 Scheduled AI Task\nPlatform: ${aiTaskPlatform || 'Not set'}\nScheduled: ${displayTime}\nInstructions: ${aiTaskPrompt}`;
      await supabase.from('tasks').insert({
        user_id: user.id, title: `[AI] ${aiTaskTitle}`,
        notes: taskNotes, priority: 'normal', status: 'pending',
      });
      
      toastSuccess("Task Scheduled", "Your AI task has been scheduled and added to your Tasks!");
      setShowAiModal(false);
      setAiTaskTitle(""); setAiTaskPrompt(""); setAiTaskDate(null); setAiTaskTime(null);
      setAiTaskPlatform(accounts.length > 0 ? accounts[0].platform : "");
      setMediaFiles([]);
      loadData(); // Refresh the calendar view
    } catch (err: any) {
      console.error(err);
      toastError("Error", err.message || "Failed to schedule task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('scheduled_ai_tasks').delete().eq('id', taskId);
      if (error) throw error;
      loadData(); // Refresh the calendar view
    } catch (err: any) {
      console.error(err);
      toastError("Error", err.message || "Failed to delete task.");
    }
  };
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return (
    <div className="mx-auto max-w-6xl pb-12 h-[calc(100vh-100px)] flex flex-col">
      <PageHeader 
        eyebrow="Publishing" 
        title="Visual Grid Planner" 
        sub="Drag and drop your content calendar. Switch to Grid View to preview exactly how your Instagram profile will look."
        actions={
          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-[var(--panel-fill-2)] p-1 rounded-full border border-[var(--stroke)]">
              <button 
                onClick={() => setView("calendar")}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${view === "calendar" ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Calendar
              </button>
              <button 
                onClick={() => setView("grid")}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${view === "grid" ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> IG Grid
              </button>
            </div>
            
            <button 
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold transition-all border border-[var(--sai-indigo)] text-[var(--sai-indigo)] hover:bg-[var(--sai-indigo)]/10"
            >
              <Bot className="w-4 h-4" /> Schedule AI
            </button>
            
            <PrimaryButton onClick={() => router.push("/dashboard/compose")} className="h-9 px-4">
              <Plus className="w-4 h-4 mr-1" /> New Post
            </PrimaryButton>
          </div>
        }
      />

      <GlassCard className="flex-1 flex flex-col overflow-hidden border-[var(--stroke)] mt-2">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--stroke)] bg-[var(--panel-fill-2)]/50">
          <div className="flex items-center gap-4">
            {/* Month/Year title — clickable to open date picker */}
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(v => !v)}
                className="font-display text-[18px] font-semibold text-[var(--fg)] min-w-[160px] text-left hover:text-[var(--sai-indigo)] transition-colors flex items-center gap-2 group"
              >
                {MONTHS[currentMonth]} {currentYear}
                <ChevronRight className="w-3.5 h-3.5 text-[var(--fg-4)] group-hover:text-[var(--sai-indigo)] rotate-90 transition-transform" />
              </button>
              {showDatePicker && (
                <MiniDatePicker
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  onSelect={(m, y) => { setCurrentMonth(m); setCurrentYear(y); }}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button
                onClick={() => setShowDatePicker(v => !v)}
                className="px-3 py-1 text-[12px] font-medium text-[var(--fg-2)] hover:text-[var(--sai-indigo)] border border-[var(--stroke)] rounded-lg hover:border-[var(--sai-indigo)]/50 hover:bg-[var(--sai-indigo)]/5 transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-medium text-[var(--fg-4)]">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#E1306C]" /> Instagram</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1DA1F2]" /> X</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0A66C2]" /> LinkedIn</span>
          </div>
        </div>

        {view === "calendar" ? (
          <div className="flex-1 overflow-auto bg-[var(--app-surface)]">
            <div className="grid grid-cols-7 border-b border-[var(--stroke)] sticky top-0 bg-[var(--app-surface)] z-10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${totalCells / 7}, minmax(120px, 1fr))` }}>
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayNum = i - firstDay + 1;
                const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
                const isToday = isCurrentMonth && dayNum === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
                const scheduledEvents = scheduledTasks.filter(s => {
                  if (!s.trigger_at) return false;
                  const t = new Date(s.trigger_at);
                  return t.getDate() === dayNum && t.getMonth() === currentMonth && t.getFullYear() === currentYear;
                });

                return (
                  <div key={i} className={`border-r border-b border-[var(--stroke)] min-h-[120px] p-2 transition-colors ${isCurrentMonth ? 'bg-[var(--panel-fill)]/50 hover:bg-[var(--panel-fill)]' : 'bg-[var(--app-bg)]/50 opacity-40'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--sai-indigo)] text-white' : 'text-[var(--fg-3)]'}`}>
                        {isCurrentMonth ? dayNum : ''}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {scheduledEvents.map(event => (
                        <div key={event.id} className="cursor-pointer group flex items-center gap-1.5 p-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--app-surface)] hover:border-[var(--sai-indigo)]/50 hover:shadow-sm transition-all relative pr-6">
                          {event.platform === "Instagram" && <Camera className="w-3 h-3 text-[#E1306C] flex-shrink-0" />}
                          {event.platform === "X" && <AtSign className="w-3 h-3 text-[#1DA1F2] flex-shrink-0" />}
                          {event.platform === "LinkedIn" && <Building2 className="w-3 h-3 text-[#0A66C2] flex-shrink-0" />}
                          <span className="text-[10px] font-medium text-[var(--fg-2)] truncate group-hover:text-[var(--fg)]">{event.title}</span>
                          <button 
                            onClick={(e) => handleDeleteTask(event.id, e)} 
                            className="absolute right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-[var(--stroke)] rounded text-[var(--fg-3)] hover:text-red-400"
                            title="Delete task"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-[var(--app-surface)] flex items-center justify-center p-8 gap-16">
            <div className="max-w-[280px] space-y-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E1306C]/20 to-[#FD1D1D]/20 flex items-center justify-center border border-[#E1306C]/30">
                <LayoutGrid className="w-6 h-6 text-[#E1306C]" />
              </div>
              <h3 className="text-xl font-display font-semibold text-[var(--fg)]">Instagram Grid Preview</h3>
              <p className="text-[14px] text-[var(--fg-3)] leading-relaxed">
                This view simulates exactly how your Instagram profile grid will look after your scheduled posts are published.
              </p>
              <p className="text-[14px] text-[var(--fg-3)] leading-relaxed">
                Drag and drop the <Pill tone="indigo" className="inline-block scale-90 mx-0.5">Scheduled</Pill> slots to rearrange your visual aesthetic before it goes live.
              </p>
            </div>

            <div className="w-full max-w-[350px] bg-[var(--panel-fill)] border border-[var(--stroke)] rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[700px]">
              <div className="h-12 border-b border-[var(--stroke)] flex items-center justify-between px-6">
                <span className="text-[14px] font-bold text-[var(--fg)]">@sociallyai_hq</span>
                <Layout className="w-4 h-4 text-[var(--fg-3)]" />
              </div>
              <div className="p-4 border-b border-[var(--stroke)] flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sai-indigo)] to-[var(--sai-violet)] flex items-center justify-center border-2 border-[var(--app-surface)]">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex gap-4 mb-1">
                    <div className="text-center"><p className="text-[14px] font-bold text-[var(--fg)]">124</p><p className="text-[11px] text-[var(--fg-4)]">Posts</p></div>
                    <div className="text-center"><p className="text-[14px] font-bold text-[var(--fg)]">12.5K</p><p className="text-[11px] text-[var(--fg-4)]">Followers</p></div>
                    <div className="text-center"><p className="text-[14px] font-bold text-[var(--fg)]">45</p><p className="text-[11px] text-[var(--fg-4)]">Following</p></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-[var(--app-bg)] overflow-y-auto hide-scrollbar">
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className={`aspect-square relative cursor-grab active:cursor-grabbing ${i < 2 ? 'bg-gradient-to-br from-[var(--sai-indigo)]/20 to-[var(--sai-violet)]/20 border-2 border-[var(--sai-indigo)]' : 'bg-[var(--panel-fill-2)]'}`}>
                      {i < 2 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Pill tone="indigo" className="scale-75 shadow-lg backdrop-blur-md bg-[var(--sai-indigo)]/80 text-white border-white/20">Scheduled</Pill>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* AI Schedule Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md bg-[var(--panel-fill)] border-[var(--stroke)] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--stroke)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--sai-indigo)]/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[var(--sai-indigo)]" />
                </div>
                <h3 className="font-semibold text-[var(--fg)] text-[16px]">Schedule AI Task</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-[var(--fg-3)] hover:text-[var(--fg)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Morning Tech Tweet" 
                  value={aiTaskTitle}
                  onChange={e => setAiTaskTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--sai-indigo)]"
                />
              </div>
              
              <div>
                <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">AI Instructions</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Write a thread about 3 ways to use our CRM..." 
                  value={aiTaskPrompt}
                  onChange={e => setAiTaskPrompt(e.target.value)}
                  className="w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--sai-indigo)]"
                />
              </div>

              <div className="space-y-4">
                {/* Date & Time side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">Date</label>
                    <DatePicker value={aiTaskDate} onChange={setAiTaskDate} />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">Time</label>
                    <TimePicker value={aiTaskTime} onChange={setAiTaskTime} />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">Platform Account</label>
                  {accounts.length === 0 ? (
                    <div className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2.5 text-sm text-[var(--fg-4)]">
                      No accounts connected
                    </div>
                  ) : (
                    <Select value={aiTaskPlatform} onValueChange={setAiTaskPlatform}>
                      <SelectTrigger className="w-full h-auto py-3">
                        <SelectValue placeholder="Select an account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.platform} className="capitalize">
                            {acc.platform} — {acc.handle || acc.display_name || "Account"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">Media Attachment (Optional)</label>
                
                {mediaFiles.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {mediaFiles.map((media, idx) => (
                      <div key={idx} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-[var(--stroke)] group">
                        {media.type === 'image' ? (
                          <img src={media.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <video src={media.previewUrl} className="w-full h-full object-cover" />
                        )}
                        <button 
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 shrink-0 rounded-xl border border-dashed border-[var(--stroke)] flex flex-col items-center justify-center text-[var(--fg-4)] hover:text-[var(--fg-2)] hover:border-[var(--sai-indigo)]/50 hover:bg-[var(--panel-fill)] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--panel-fill-2)]/50 flex flex-col items-center justify-center gap-2 text-[var(--fg-4)] hover:text-[var(--fg-2)] hover:border-[var(--sai-indigo)]/50 hover:bg-[var(--panel-fill-2)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--panel-fill)] flex items-center justify-center shadow-sm">
                      <ImageIcon className="w-4 h-4 text-[var(--fg-3)]" />
                    </div>
                    <span className="text-[12px] font-medium">Click to upload an image or video</span>
                  </button>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*,video/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="p-5 border-t border-[var(--stroke)] flex justify-end gap-3 bg-[var(--app-bg)]/50">
              <button onClick={() => setShowAiModal(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)]">Cancel</button>
              <PrimaryButton onClick={handleSaveTask} disabled={isSaving} className="px-6 py-2 h-auto text-[13px]">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Task"}
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
