import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function estimateCost(durationInMinutes: number): number {
  // Whisper API: $0.006/minute
  // GPT-4 Turbo: ~$0.02 per meeting average
  const whisperCost = durationInMinutes * 0.006;
  const gpt4Cost = 0.02;
  return Math.round((whisperCost + gpt4Cost) * 100) / 100;
}

/**
 * Sanitizes a string to be ASCII-safe English-only.
 * Replaces non-ASCII characters with ASCII equivalents or placeholders.
 * This is a fallback solution to avoid font encoding issues in PDF generation.
 */
function sanitizeToASCII(text: string): string {
  if (!text) return text;
  
  // Check if text contains non-ASCII characters
  const hasNonASCII = /[^\x00-\x7F]/.test(text);
  
  if (!hasNonASCII) {
    // Already ASCII, return as-is
    return text;
  }
  
  // For non-ASCII text, replace with a placeholder
  // This ensures PDF generation never fails due to font encoding
  return '[Non-English content]';
}

/**
 * Translation prompt for GPT-4 to convert meeting analysis to English
 */
const TRANSLATION_PROMPT = `You are a professional translator. Your task is to translate a meeting analysis from any language (Vietnamese, Japanese, etc.) to English.

IMPORTANT REQUIREMENTS:
1. Translate ALL text content to English while preserving the exact JSON structure
2. Keep person names as-is (do not translate names)
3. Keep status values as-is: "overloaded", "normal", "free", "high", "medium", "low"
4. Translate all task descriptions, blockers, decisions, and summary content to English
5. Maintain the exact same JSON format and structure
6. If a field is already in English, keep it as-is
7. Preserve null values and empty arrays
8. Translate dates/deadlines format to English if needed, but keep the date values

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "attendance": {
    "present": ["Person1", "Person2"],
    "absent": [{"name": "Person3", "reason": "translated reason"}]
  },
  "personalProgress": [
    {
      "member": "Person1",
      "yesterday": ["translated task 1", "translated task 2"],
      "today": ["translated task 3", "translated task 4"],
      "blockers": ["translated blocker"] or []
    }
  ],
  "workload": [
    {"member": "Person1", "status": "overloaded"},
    {"member": "Person2", "status": "normal"},
    {"member": "Person3", "status": "free"}
  ],
  "actionItems": [
    {
      "task": "translated task description",
      "assignee": "PersonName",
      "dueDate": "deadline if mentioned" or null,
      "priority": "high/medium/low" or null,
      "technicalNotes": "translated notes" or null
    }
  ],
  "keyDecisions": ["translated decision 1", "translated decision 2"],
  "summary": {
    "blockersToFollowUp": ["translated blocker 1", "translated blocker 2"],
    "priorityTasks": ["translated task 1", "translated task 2"],
    "responsibilities": [
      {"person": "Person1", "task": "translated task description", "deadline": "deadline" or null}
    ]
  },
  "participants": ["Person1", "Person2", "Person3"]
}`;

/**
 * Detects if content is likely already in English
 * Checks if text contains mostly ASCII characters
 */
function isLikelyEnglish(text: string): boolean {
  if (!text) return true;
  
  // Check if text contains non-ASCII characters
  const hasNonASCII = /[^\x00-\x7F]/.test(text);
  
  // If no non-ASCII characters, likely English
  return !hasNonASCII;
}

/**
 * Checks if analysis is already in English
 * Returns true if all text fields appear to be English (ASCII-only)
 */
function isAnalysisEnglish(analysis: any): boolean {
  if (!analysis) return true;
  
  // Check attendance
  const attendance = analysis.attendance || {};
  if (attendance.present?.some((name: string) => !isLikelyEnglish(name))) return false;
  if (attendance.absent?.some((item: any) => 
    !isLikelyEnglish(item.name) || (item.reason && !isLikelyEnglish(item.reason))
  )) return false;
  
  // Check personal progress
  if (analysis.personalProgress?.some((progress: any) => 
    !isLikelyEnglish(progress.member) ||
    progress.yesterday?.some((task: string) => !isLikelyEnglish(task)) ||
    progress.today?.some((task: string) => !isLikelyEnglish(task)) ||
    progress.blockers?.some((blocker: string) => !isLikelyEnglish(blocker))
  )) return false;
  
  // Check action items
  if (analysis.actionItems?.some((item: any) =>
    !isLikelyEnglish(item.task) ||
    !isLikelyEnglish(item.assignee) ||
    (item.priority && !isLikelyEnglish(item.priority)) ||
    (item.technicalNotes && !isLikelyEnglish(item.technicalNotes))
  )) return false;
  
  // Check key decisions
  if (analysis.keyDecisions?.some((decision: string) => !isLikelyEnglish(decision))) return false;
  
  // Check summary
  const summary = analysis.summary || {};
  if (summary.blockersToFollowUp?.some((blocker: string) => !isLikelyEnglish(blocker))) return false;
  if (summary.priorityTasks?.some((task: string) => !isLikelyEnglish(task))) return false;
  if (summary.responsibilities?.some((resp: any) =>
    !isLikelyEnglish(resp.person) ||
    !isLikelyEnglish(resp.task) ||
    (resp.deadline && !isLikelyEnglish(resp.deadline))
  )) return false;
  
  // Check participants
  if (analysis.participants?.some((name: string) => !isLikelyEnglish(name))) return false;
  
  return true;
}

/**
 * Translates meeting analysis to English using GPT-4
 * This ensures PDF generation always receives English content
 * @param analysis - The meeting analysis to translate
 * @param language - Optional language code ('en', 'vi', 'ja'). If 'en' or not provided, will auto-detect
 */
export async function translateAnalysisToEnglish(analysis: any, language?: string): Promise<any> {
  // Skip translation if explicitly English
  if (language === 'en') {
    console.log('Analysis is already in English, skipping translation');
    return analysis;
  }
  
  // Auto-detect if analysis is already in English
  if (!language && isAnalysisEnglish(analysis)) {
    console.log('Analysis appears to be already in English, skipping translation');
    return analysis;
  }
  
  try {
    // Check if OpenAI is available
    const { openai, validateApiKey } = await import('@/lib/openai');
    
    try {
      validateApiKey();
    } catch (error) {
      // If API key is not available, fall back to sanitization
      console.warn('OpenAI API key not available, falling back to ASCII sanitization');
      return sanitizeAnalysis(analysis);
    }

    console.log(`Translating analysis to English using GPT-4 (detected language: ${language || 'auto'})...`);

    // Call GPT-4 for translation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: TRANSLATION_PROMPT,
        },
        {
          role: 'user',
          content: `Translate this meeting analysis to English:\n\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
      temperature: 0.2, // Lower temperature for more consistent translation
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the translated JSON response
    const translatedAnalysis = JSON.parse(content);

    // Validate and merge with original structure to ensure nothing is lost
    return {
      attendance: translatedAnalysis.attendance || analysis.attendance || { present: [], absent: [] },
      personalProgress: translatedAnalysis.personalProgress || analysis.personalProgress || [],
      workload: translatedAnalysis.workload || analysis.workload || [],
      actionItems: translatedAnalysis.actionItems || analysis.actionItems || [],
      keyDecisions: translatedAnalysis.keyDecisions || analysis.keyDecisions || [],
      summary: translatedAnalysis.summary || analysis.summary || {
        blockersToFollowUp: [],
        priorityTasks: [],
        responsibilities: []
      },
      participants: translatedAnalysis.participants || analysis.participants || [],
    };
  } catch (error: any) {
    console.error('Translation error:', error);
    // Fall back to sanitization if translation fails
    console.warn('Falling back to ASCII sanitization due to translation error');
    return sanitizeAnalysis(analysis);
  }
}

/**
 * Fallback: Sanitizes analysis to ASCII-safe format
 */
function sanitizeAnalysis(analysis: any): any {
  return {
    attendance: {
      present: (analysis?.attendance?.present || []).map((name: string) => sanitizeToASCII(name)),
      absent: (analysis?.attendance?.absent || []).map((item: any) => ({
        name: sanitizeToASCII(item.name || ''),
        reason: item.reason ? sanitizeToASCII(item.reason) : undefined,
      })),
    },
    personalProgress: (analysis?.personalProgress || []).map((progress: any) => ({
      member: sanitizeToASCII(progress.member || ''),
      yesterday: (progress.yesterday || []).map((task: string) => sanitizeToASCII(task)),
      today: (progress.today || []).map((task: string) => sanitizeToASCII(task)),
      blockers: (progress.blockers || []).map((blocker: string) => sanitizeToASCII(blocker)),
    })),
    workload: (analysis?.workload || []).map((item: any) => ({
      member: sanitizeToASCII(item.member || ''),
      status: item.status || 'normal',
    })),
    actionItems: (analysis?.actionItems || []).map((item: any) => ({
      task: sanitizeToASCII(item.task || ''),
      assignee: sanitizeToASCII(item.assignee || ''),
      dueDate: item.dueDate || null,
      priority: item.priority ? sanitizeToASCII(item.priority) : null,
      technicalNotes: item.technicalNotes ? sanitizeToASCII(item.technicalNotes) : null,
    })),
    keyDecisions: (analysis?.keyDecisions || []).map((decision: string) => sanitizeToASCII(decision)),
    summary: {
      blockersToFollowUp: (analysis?.summary?.blockersToFollowUp || []).map((blocker: string) => sanitizeToASCII(blocker)),
      priorityTasks: (analysis?.summary?.priorityTasks || []).map((task: string) => sanitizeToASCII(task)),
      responsibilities: (analysis?.summary?.responsibilities || []).map((resp: any) => ({
        person: sanitizeToASCII(resp.person || ''),
        task: sanitizeToASCII(resp.task || ''),
        deadline: resp.deadline ? sanitizeToASCII(resp.deadline) : null,
      })),
    },
    participants: (analysis?.participants || []).map((name: string) => sanitizeToASCII(name)),
  };
}

/**
 * Converts a MeetingResult to English-only format for PDF generation.
 * Uses GPT-4 translation for analysis, and sanitization for transcript/metadata.
 * This is a deliberate design choice to avoid font encoding issues.
 * @param result - The MeetingResult to convert
 * @param language - Optional language code ('en', 'vi', 'ja'). If 'en', skips translation.
 */
export async function convertToEnglishOnly(result: any, language?: string): Promise<any> {
  // Translate analysis to English using GPT-4 (only if not already English)
  const translatedAnalysis = await translateAnalysisToEnglish(result.analysis, language);

  // Sanitize transcript and metadata (transcript is too long to translate efficiently)
  const sanitized = {
    ...result,
    metadata: {
      ...result.metadata,
      fileName: sanitizeToASCII(result.metadata?.fileName || 'meeting-recording'),
    },
    transcript: {
      ...result.transcript,
      text: sanitizeToASCII(result.transcript?.text || ''),
      segments: (result.transcript?.segments || []).map((segment: any) => ({
        ...segment,
        text: sanitizeToASCII(segment.text || ''),
      })),
    },
    analysis: translatedAnalysis,
  };
  
  return sanitized;
}

