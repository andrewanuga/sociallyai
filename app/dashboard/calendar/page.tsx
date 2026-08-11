"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, LayoutGrid, ChevronLeft, ChevronRight, Plus, Camera, AtSign, Building2, Layout, Sparkles, Bot, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { PageHeader, GlassCard, Pill, PrimaryButton } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import imageCompression from "browser-image-compression";

const MOCK_SCHEDULE = [
  { id: 1, day: 2, time: "09:00 AM", platform: "Instagram", type: "Reel", title: "Behind the Scenes at Agency" },
  { id: 2, day: 2, time: "02:30 PM", platform: "X", type: "Thread", title: "Outbound Strategy Breakdown" },
  { id: 3, day: 4, time: "11:00 AM", platform: "LinkedIn", type: "Carousel", title: "5 AI Prompts for Sales" },
  { id: 4, day: 5, time: "10:00 AM", platform: "Instagram", type: "Post", title: "Client Testimonial" },
];
export default function CalendarPage() {
  const supabase = createClient();
  const { error: toastError, success: toastSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [view, setView] = useState<"calendar" | "grid">("calendar");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTaskTitle, setAiTaskTitle] = useState("");
  const [aiTaskPrompt, setAiTaskPrompt] = useState("");
  const [aiTaskPlatform, setAiTaskPlatform] = useState("");
  const [aiTaskTime, setAiTaskTime] = useState("");
  
  const [accounts, setAccounts] = useState<{ id: string; platform: string; platform_username: string }[]>([]);
  const [mediaFiles, setMediaFiles] = useState<{ file: File; previewUrl: string; type: 'image'|'video' }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("connected_accounts")
        .select("id, platform, platform_username")
        .eq("user_id", user.id)
        .eq("is_active", true);
      
      if (data) {
        setAccounts(data);
        if (data.length > 0) setAiTaskPlatform(data[0].platform);
      }
    }
    loadAccounts();
  }, [supabase]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    
    // Check video size
    if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
      toastError("File too large", "Videos must be under 50MB.");
      return;
    }

    let finalFile = file;
    // Compress image
    if (file.type.startsWith('image/')) {
      try {
        finalFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      } catch (err) {
        console.error("Compression error:", err);
      }
    }

    const previewUrl = URL.createObjectURL(finalFile);
    setMediaFiles([...mediaFiles, { file: finalFile, previewUrl, type: finalFile.type.startsWith('video/') ? 'video' : 'image' }]);
  };

  const removeMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    URL.revokeObjectURL(newFiles[index].previewUrl);
    newFiles.splice(index, 1);
    setMediaFiles(newFiles);
  };

  const handleSaveTask = async () => {
    if (!aiTaskTitle || !aiTaskPrompt || !aiTaskTime) {
      toastError("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let uploadedUrls: string[] = [];
      
      // Upload media
      for (const media of mediaFiles) {
        const fileExt = media.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, media.file);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Save task
      const { error: dbError } = await supabase
        .from('scheduled_ai_tasks')
        .insert({
          user_id: user.id,
          title: aiTaskTitle,
          prompt: aiTaskPrompt,
          platform: aiTaskPlatform,
          trigger_at: new Date(aiTaskTime).toISOString(),
          media_urls: uploadedUrls,
          status: 'pending'
        });

      if (dbError) throw dbError;
      
      toastSuccess("Task Scheduled", "Your AI task has been scheduled successfully!");
      setShowAiModal(false);
      
      // Reset form
      setAiTaskTitle("");
      setAiTaskPrompt("");
      setAiTaskTime("");
      setMediaFiles([]);
    } catch (err: any) {
      console.error(err);
      toastError("Error", err.message || "Failed to schedule task.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const daysInMonth = 30; // Mock month length

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
            <h2 className="font-display text-[18px] font-semibold text-[var(--fg)]">August 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1 text-[12px] font-medium text-[var(--fg-2)] hover:text-[var(--fg)]">Today</button>
              <button className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors"><ChevronRight className="w-4 h-4" /></button>
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
            <div className="grid grid-cols-7 grid-rows-5 h-full">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i - 4; // Offset to start month on Friday
                const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                const scheduledEvents = MOCK_SCHEDULE.filter(s => s.day === dayNum);

                return (
                  <div key={i} className={`border-r border-b border-[var(--stroke)] min-h-[120px] p-2 transition-colors ${isCurrentMonth ? 'bg-[var(--panel-fill)]/50 hover:bg-[var(--panel-fill)]' : 'bg-[var(--app-bg)]/50 opacity-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${dayNum === 2 ? 'bg-[var(--sai-indigo)] text-white' : 'text-[var(--fg-3)]'}`}>
                        {isCurrentMonth ? dayNum : ''}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {scheduledEvents.map(event => (
                        <div key={event.id} className="cursor-pointer group flex items-center gap-1.5 p-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--app-surface)] hover:border-[var(--sai-indigo)]/50 hover:shadow-sm transition-all">
                          {event.platform === "Instagram" && <Camera className="w-3 h-3 text-[#E1306C] flex-shrink-0" />}
                          {event.platform === "X" && <AtSign className="w-3 h-3 text-[#1DA1F2] flex-shrink-0" />}
                          {event.platform === "LinkedIn" && <Building2 className="w-3 h-3 text-[#0A66C2] flex-shrink-0" />}
                          <span className="text-[10px] font-medium text-[var(--fg-2)] truncate group-hover:text-[var(--fg)]">{event.title}</span>
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
                  {/* Mock Grid Posts */}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">Platform Account</label>
                  <select 
                    value={aiTaskPlatform}
                    onChange={e => setAiTaskPlatform(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--sai-indigo)]"
                  >
                    {accounts.length === 0 ? (
                      <option value="" className="bg-[#121212]">No accounts connected...</option>
                    ) : (
                      accounts.map(acc => (
                        <option key={acc.id} value={acc.platform} className="bg-[#121212] capitalize">
                          {acc.platform} - {acc.platform_username || "Account"}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[var(--fg-3)] block mb-1.5">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={aiTaskTime}
                    onChange={e => setAiTaskTime(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--sai-indigo)]"
                  />
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
