import { createAdminClient } from "@/lib/supabase/admin";
import type { TaskPriority } from "@/lib/supabase/types";

/**
 * Registers an ongoing task for an autonomous bot.
 * Returns the task ID so it can be finished later.
 */
export async function startBotTask(
  userId: string,
  botId: string,
  title: string,
  notes: string = "",
  priority: TaskPriority = "normal"
): Promise<string | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        bot_id: botId,
        title,
        notes,
        priority,
        status: "ongoing"
      })
      .select("id")
      .single();

    if (error) {
      console.error("[BotTasks] Error starting task:", error.message);
      return null;
    }
    return data?.id || null;
  } catch (err) {
    console.error("[BotTasks] Exception starting task:", err);
    return null;
  }
}

/**
 * Marks a bot task as finished.
 */
export async function finishBotTask(taskId: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;

  try {
    await supabase
      .from("tasks")
      .update({
        status: "finished",
        completed_at: new Date().toISOString()
      })
      .eq("id", taskId);
  } catch (err) {
    console.error("[BotTasks] Exception finishing task:", err);
  }
}
