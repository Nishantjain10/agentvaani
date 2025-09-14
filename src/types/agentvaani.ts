// AgentVaani Type Definitions

export type Worker = {
  $id: string;
  name: string;
  email: string;
  phone: string;
  phone_verified: boolean;
  role: string;
  city: string;
  appwrite_user_id: string;
  created_at: string;
};

export type Agent = {
  $id: string;
  worker_id: string;
  name: string;
  elevenlabs_agent_id: string;
  voice_id: string;
  description?: string;
  system_prompt: string;
  first_message: string;
  language: string;
  created_at: string;
};

export type Customer = {
  $id: string;
  worker_id: string;
  name: string;
  phone_e164: string;
  opted_in: boolean;
  consent_record_id?: string;
  last_contacted_at?: string;
  tags: string[];
};

export type Call = {
  $id: string;
  customer_id: string;
  agent_id: string;
  worker_id: string;
  call_start: string;
  call_end?: string;
  recording_url?: string;
  transcript?: string;
  outcome?: string;
  raw_metadata?: Record<string, any>;
};

export type Upload = {
  $id: string;
  owner_id: string;
  file_url: string;
  parsed_text?: string;
  embeddings_id?: string;
  created_at: string;
};

export type SuppressionListEntry = {
  $id: string;
  phone_e164: string;
  reason: string;
  added_by: string;
  added_at: string;
};

export type ConsentRecord = {
  $id: string;
  customer_id: string;
  consent_type: 'sms' | 'call' | 'spoken';
  consent_given: boolean;
  consent_timestamp: string;
  consent_metadata?: Record<string, any>;
};

export type CallOutcome = {
  interested: boolean;
  follow_up_required: boolean;
  notes: string;
  next_action?: string;
};

export type VoiceProfile = {
  id: string;
  name: string;
  language: string;
  provider: 'elevenlabs' | 'google' | 'amazon';
  voice_id: string;
};
