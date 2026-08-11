import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callAI } from "@/lib/ai/openrouter";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Make sure to use the service role key to bypass RLS in the cron job
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// GET request for Vercel Cron
export async function GET(req: Request) {
  try {
    // 1. Fetch pending tasks where trigger_at is in the past
    const { data: scheduledTasks, error: fetchError } = await supabaseAdmin
      .from("scheduled_ai_tasks")
      .select("*")
      .eq("status", "pending")
      .lte("trigger_at", new Date().toISOString());

    if (fetchError) throw fetchError;
    if (!scheduledTasks || scheduledTasks.length === 0) {
      return NextResponse.json({ message: "No pending tasks to run" });
    }

    // 2. Process each task
    for (const task of scheduledTasks) {
      // Mark as running
      await supabaseAdmin
        .from("scheduled_ai_tasks")
        .update({ status: "running" })
        .eq("id", task.id);

      try {
        // Fetch user's pending CRM tasks to provide context to the AI
        const { data: crmTasks } = await supabaseAdmin
          .from("tasks")
          .select("title, priority, notes")
          .eq("user_id", task.user_id)
          .eq("status", "pending")
          .limit(5);

        let crmContext = "";
        if (crmTasks && crmTasks.length > 0) {
          crmContext = `\n\nUSER'S CURRENT CRM TASKS (You may reference these if relevant to the post):\n${crmTasks.map(t => `- [${t.priority}] ${t.title} (${t.notes || ''})`).join('\n')}`;
        }

        // Format the content array for OpenRouter (Multimodal Support)
        const userMessageContent: any[] = [{ type: "text", text: task.prompt }];
        
        // If there are media URLs attached, pass them to the vision model
        if (task.media_urls && task.media_urls.length > 0) {
          task.media_urls.forEach((url: string) => {
            userMessageContent.push({
              type: "image_url",
              image_url: { url }
            });
          });
        }

        // Call the AI
        const aiResponse = await callAI([
          {
            role: "system",
            content: `You are an expert social media AI assistant. You have been scheduled to automatically execute a task for the user on ${task.platform}. 
Generate the requested content directly without preamble. Make sure it is optimized for ${task.platform}.${crmContext}`
          },
          {
            role: "user",
            content: userMessageContent
          }
        ], {
          agent: "ghost",
        });

        const generatedText = aiResponse.content;

        // Automatically save the result as a queued draft in the content calendar for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        await supabaseAdmin
          .from("scheduled_posts")
          .insert({
            user_id: task.user_id,
            platform: task.platform,
            content: generatedText,
            media_urls: task.media_urls || [],
            status: "queued",
            scheduled_at: tomorrow.toISOString(),
          });

        // Mark scheduled_ai_task as completed
        await supabaseAdmin
          .from("scheduled_ai_tasks")
          .update({ 
            status: "completed",
            result_text: generatedText 
          })
          .eq("id", task.id);

      } catch (err) {
        console.error(`Error processing task ${task.id}:`, err);
        await supabaseAdmin
          .from("scheduled_ai_tasks")
          .update({ status: "failed" })
          .eq("id", task.id);
      }
    }

    return NextResponse.json({ message: `Successfully processed ${scheduledTasks.length} tasks` });
  } catch (error) {
    console.error("Cron run failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
