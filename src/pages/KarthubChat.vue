<template>
  <!-- Floating trigger button -->
  <button
    class="kh-fab"
    :class="{ 'kh-fab--open': isOpen }"
    @click="toggleChat"
    aria-label="Toggle KartHub AI"
  >
    <svg v-if="!isOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <span v-if="unreadCount > 0 && !isOpen" class="kh-fab__badge">{{ unreadCount }}</span>
  </button>

  <!-- Chat panel -->
  <Transition name="chat-panel">
    <div v-if="isOpen" class="kh-chat" role="dialog" aria-label="KartHub AI Assistant">

      <!-- Header -->
      <div class="kh-chat__header">
        <div class="kh-chat__logo">KH</div>
        <div class="kh-chat__header-info">
          <div class="kh-chat__title">KartHub AI</div>
          <div class="kh-chat__subtitle">pit-lane assistant</div>
        </div>
        <div class="kh-chat__controls">
          <button class="kh-chat__icon-btn" title="Clear chat" @click="clearChat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <div class="kh-status-dot" :class="isStreaming ? 'kh-status-dot--thinking' : 'kh-status-dot--online'"></div>
        </div>
      </div>

      <!-- Messages -->
      <div class="kh-chat__messages" ref="messagesEl">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="kh-chat__empty">
          <div class="kh-chat__empty-logo">KH</div>
          <p class="kh-chat__empty-text">Ask anything about karts,<br>parts, setups & more</p>
          <div class="kh-chat__suggestions">
            <button
              v-for="s in suggestions"
              :key="s"
              class="kh-chat__suggestion"
              @click="sendSuggestion(s)"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Message list -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="kh-msg"
          :class="`kh-msg--${msg.role}`"
        >
          <div class="kh-msg__role">{{ msg.role === 'user' ? 'you' : 'karthub ai' }}</div>
          <div class="kh-msg__bubble">
            {{ msg.content }}<span v-if="msg.streaming" class="kh-cursor"></span>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="kh-chat__input-area">
        <div class="kh-chat__model-row">
          <span class="kh-chat__model-label">model</span>
          <select v-model="selectedModel" class="kh-chat__model-select">
            <option value="anthropic/claude-sonnet-4-5">claude-sonnet-4-5</option>
            <option value="openai/gpt-4o">gpt-4o</option>
            <option value="mistralai/mistral-7b-instruct:free">mistral-7b (free)</option>
            <option value="meta-llama/llama-3.1-8b-instruct:free">llama-3.1-8b (free)</option>
          </select>
        </div>
        <div class="kh-chat__input-row">
          <textarea
            ref="inputEl"
            v-model="inputText"
            class="kh-chat__input"
            placeholder="Ask about karts, parts, setups..."
            rows="1"
            :disabled="isStreaming"
            @input="autoResize"
            @keydown.enter.exact.prevent="send"
          ></textarea>
          <button
            class="kh-chat__send-btn"
            :disabled="!inputText.trim() || isStreaming"
            @click="send"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
        <p v-if="errorText" class="kh-chat__error">{{ errorText }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

// ── Environment & API Setup ───────────────────────────────────────────────
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || ''

// ── Props ──────────────────────────────────────────────────────────────────
const props = defineProps({
  /**
   * Custom system prompt for the AI.
   */
  systemPrompt: {
    type: String,
    default: `You are KartHub AI, the expert pit-lane assistant for KartHub — a community platform for karting enthusiasts. You help with:
- Kart parts, setups, and tuning advice
- Race strategies and driving techniques
- Community posts, designs, and orders on KartHub
- Troubleshooting mechanical issues
Be concise, knowledgeable, and enthusiastic about karting. Keep responses short and direct.`
  }
})

// ── State ──────────────────────────────────────────────────────────────────
const isOpen      = ref(false)
const isStreaming  = ref(false)
const inputText   = ref('')
const errorText   = ref('')
const unreadCount = ref(0)
const selectedModel = ref('anthropic/claude-sonnet-4-5')
const messages    = ref([])   // { id, role: 'user'|'assistant', content, streaming }
const messagesEl  = ref(null)
const inputEl     = ref(null)

const suggestions = [
  'Best kart setup for wet track?',
  'How do I tune carburetor jetting?',
  'Difference between CIK and KZ engines?'
]

// ── Helpers ────────────────────────────────────────────────────────────────
let msgId = 0
function makeId() { return ++msgId }

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

function autoResize() {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 100) + 'px'
}

// ── Actions ────────────────────────────────────────────────────────────────
function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    nextTick(() => inputEl.value?.focus())
  }
}

function clearChat() {
  messages.value = []
  errorText.value = ''
}

function sendSuggestion(text) {
  inputText.value = text
  send()
}

async function send() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return

  errorText.value = ''
  inputText.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  isStreaming.value = true

  // Add user message
  messages.value.push({ id: makeId(), role: 'user', content: text })
  await scrollToBottom()

  // Build history for API (exclude streaming flag)
  const history = messages.value.map(m => ({ role: m.role, content: m.content }))

  // Add empty AI message
  const aiMsg = { id: makeId(), role: 'assistant', content: '', streaming: true }
  messages.value.push(aiMsg)
  await scrollToBottom()

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'KartHub AI Assistant'
      },
      body: JSON.stringify({
        model: selectedModel.value,
        stream: true,
        max_tokens: 600,
        messages: [
          { role: 'system', content: props.systemPrompt },
          ...history
        ]
      })
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || `HTTP ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') break
        try {
          const parsed = JSON.parse(data)
          const token = parsed.choices?.[0]?.delta?.content || ''
          if (token) {
            aiMsg.content += token
            await scrollToBottom()
          }
        } catch { /* skip malformed chunks */ }
      }
    }

  } catch (err) {
    if (!apiKey) {
      // Demo mode: simulate streaming when no API key
      const demo = `[Demo] API key not configured. You asked: "${text}"`
      for (const char of demo) {
        aiMsg.content += char
        await new Promise(r => setTimeout(r, 20))
        await scrollToBottom()
      }
    } else {
      aiMsg.content = 'Something went wrong. Please try again.'
      errorText.value = err.message
    }
  } finally {
    aiMsg.streaming = false
    isStreaming.value = false

    // If chat is closed, increment unread badge
    if (!isOpen.value) unreadCount.value++

    await nextTick()
    inputEl.value?.focus()
  }
}
</script>

<style scoped>
/* ── Design tokens ──────────────────────────────────────────────────────── */
.kh-chat, .kh-fab {
  --kh-red:     #E8002D;
  --kh-dark:    #0D0D0D;
  --kh-surface: #141414;
  --kh-card:    #1C1C1E;
  --kh-border:  rgba(255,255,255,0.08);
  --kh-muted:   rgba(255,255,255,0.35);
  --kh-text:    #F0F0F0;
  --kh-accent:  #FF6B00;
  --kh-font:    'DM Sans', sans-serif;
  --kh-mono:    'JetBrains Mono', monospace;
  --kh-display: 'Bebas Neue', sans-serif;
}

/* ── Floating action button ─────────────────────────────────────────────── */
.kh-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 54px;
  height: 54px;
  border-radius: 4px;
  background: var(--kh-red);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 9999;
  transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(232,0,45,0.4);
  padding: 0;
}
.kh-fab svg { width: 22px; height: 22px; }
.kh-fab:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,0,45,0.5); }
.kh-fab:active { transform: scale(0.94); }
.kh-fab--open { background: #333; box-shadow: none; }

.kh-fab__badge {
  position: absolute;
  top: -6px; right: -6px;
  width: 18px; height: 18px;
  background: var(--kh-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--kh-font);
}

/* ── Chat panel ─────────────────────────────────────────────────────────── */
.kh-chat {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 370px;
  height: 560px;
  background: var(--kh-surface);
  border: 1px solid var(--kh-border);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  z-index: 9998;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
  font-family: var(--kh-font);
  color: var(--kh-text);
}

/* Red left stripe */
.kh-chat::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px; height: 100%;
  background: var(--kh-red);
  z-index: 1;
}

/* ── Panel transition ───────────────────────────────────────────────────── */
.chat-panel-enter-active { animation: panel-in 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.chat-panel-leave-active { animation: panel-in 0.18s ease-in reverse; }
@keyframes panel-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.kh-chat__header {
  padding: 14px 16px 14px 22px;
  border-bottom: 1px solid var(--kh-border);
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--kh-card);
  flex-shrink: 0;
}
.kh-chat__logo {
  width: 30px; height: 30px;
  background: var(--kh-red);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--kh-display);
  font-size: 13px;
  color: #fff;
  letter-spacing: 1px;
  flex-shrink: 0;
}
.kh-chat__header-info { flex: 1; }
.kh-chat__title {
  font-family: var(--kh-display);
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
  line-height: 1;
}
.kh-chat__subtitle {
  font-size: 10px;
  color: var(--kh-muted);
  font-family: var(--kh-mono);
  margin-top: 2px;
}
.kh-chat__controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.kh-chat__icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--kh-muted);
  padding: 4px;
  display: flex;
  transition: color 0.15s;
}
.kh-chat__icon-btn:hover { color: var(--kh-text); }
.kh-chat__icon-btn svg { width: 14px; height: 14px; }

.kh-status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.kh-status-dot--online  { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,.5); animation: pulse-dot 2s ease-in-out infinite; }
.kh-status-dot--thinking { background: var(--kh-accent); box-shadow: 0 0 6px rgba(255,107,0,.5); animation: pulse-dot 0.6s ease-in-out infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ── Messages ───────────────────────────────────────────────────────────── */
.kh-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}
.kh-chat__messages::-webkit-scrollbar { width: 3px; }
.kh-chat__messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

[data-theme="light"] .kh-chat__messages::-webkit-scrollbar-thumb,
.light-mode .kh-chat__messages::-webkit-scrollbar-thumb {
  background: rgba(230, 57, 70, 0.15) !important;
}

/* Empty state */
.kh-chat__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: auto;
  text-align: center;
}
.kh-chat__empty-logo {
  font-family: var(--kh-display);
  font-size: 38px;
  letter-spacing: 4px;
  color: var(--kh-red);
  opacity: 0.4;
}
.kh-chat__empty-text {
  font-size: 12.5px;
  color: var(--kh-muted);
  line-height: 1.6;
}
.kh-chat__suggestions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
  width: 100%;
  max-width: 280px;
}
.kh-chat__suggestion {
  background: var(--kh-card);
  border: 1px solid var(--kh-border);
  border-radius: 3px;
  color: var(--kh-text);
  font-family: var(--kh-font);
  font-size: 12px;
  padding: 8px 12px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.kh-chat__suggestion:hover {
  border-color: rgba(232,0,45,0.35);
  background: rgba(232,0,45,0.06);
}

/* Message bubbles */
.kh-msg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 88%;
  animation: msg-in 0.22s ease-out both;
}
@keyframes msg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

.kh-msg--user      { align-self: flex-end; align-items: flex-end; }
.kh-msg--assistant { align-self: flex-start; align-items: flex-start; }

.kh-msg__role {
  font-size: 10px;
  font-family: var(--kh-mono);
  letter-spacing: 1.5px;
  color: var(--kh-muted);
  text-transform: uppercase;
}
.kh-msg--user .kh-msg__role { color: rgba(255,107,0,0.6); }

[data-theme="light"] .kh-msg__role,
.light-mode .kh-msg__role {
  color: #999999 !important;
}

.kh-msg__bubble {
  padding: 10px 13px;
  border-radius: 3px;
  font-size: 13.5px;
  line-height: 1.65;
  font-weight: 300;
  white-space: pre-wrap;
  word-break: break-word;
}
.kh-msg--user .kh-msg__bubble {
  background: var(--kh-red);
  color: #fff;
  border-bottom-right-radius: 0;
}
.kh-msg--assistant .kh-msg__bubble {
  background: var(--kh-card);
  color: var(--kh-text);
  border: 1px solid var(--kh-border);
  border-bottom-left-radius: 0;
}

[data-theme="light"] .kh-msg--assistant .kh-msg__bubble,
.light-mode .kh-msg--assistant .kh-msg__bubble {
  background: #F5F7FB !important;
  color: #1A1A1A !important;
  border-color: rgba(230, 57, 70, 0.15) !important;
}

.kh-cursor {
  display: inline-block;
  width: 2px; height: 13px;
  background: var(--kh-red);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.7s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Input area ─────────────────────────────────────────────────────────── */
.kh-chat__input-area {
  padding: 10px 16px 14px 22px;
  border-top: 1px solid var(--kh-border);
  background: var(--kh-card);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

[data-theme="light"] .kh-chat__input-area,
.light-mode .kh-chat__input-area {
  background: #F5F7FB !important;
}
.kh-chat__model-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.kh-chat__model-label {
  font-size: 10px;
  font-family: var(--kh-mono);
  color: var(--kh-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}

[data-theme="light"] .kh-chat__model-label,
.light-mode .kh-chat__model-label {
  color: #999999 !important;
}
.kh-chat__model-select {
  background: transparent;
  border: none;
  color: var(--kh-accent);
  font-family: var(--kh-mono);
  font-size: 10px;
  cursor: pointer;
  outline: none;
  padding: 2px 0;
}
.kh-chat__model-select option { 
  background: #1C1C1E; 
  color: #F0F0F0;
}
[data-theme="light"] .kh-chat__model-select option,
.light-mode .kh-chat__model-select option {
  background: #F5F7FB;
  color: #1A1A1A;
}

.kh-chat__input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.kh-chat__input {
  flex: 1;
  background: var(--kh-surface);
  border: 1px solid var(--kh-border);
  border-radius: 3px;
  color: var(--kh-text);
  font-family: var(--kh-font);
  font-size: 13.5px;
  font-weight: 300;
  padding: 10px 12px;
  resize: none;
  outline: none;
  min-height: 42px;
  max-height: 100px;
  line-height: 1.5;
  transition: border-color 0.2s;
  pointer-events: auto;
  -webkit-appearance: none;
  appearance: none;
}
.kh-chat__input:focus { border-color: rgba(232,0,45,0.4); }
.kh-chat__input::placeholder { color: var(--kh-muted); }
.kh-chat__input:disabled { opacity: 0.5; cursor: not-allowed; }

/* Light mode text readability */
[data-theme="light"] .kh-chat__input,
.light-mode .kh-chat__input {
  background: #FFFFFF !important;
  color: #1A1A1A !important;
  border-color: rgba(230, 57, 70, 0.15) !important;
}

[data-theme="light"] .kh-chat__input::placeholder,
.light-mode .kh-chat__input::placeholder {
  color: #999999 !important;
}

.kh-chat__send-btn {
  width: 42px; 
  height: 42px;
  background: var(--kh-red);
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  transition: background 0.15s, transform 0.1s;
  pointer-events: auto;
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
}
.kh-chat__send-btn svg { width: 16px; height: 16px; }
.kh-chat__send-btn:hover:not(:disabled) { background: #c8001f; }
.kh-chat__send-btn:active:not(:disabled) { transform: scale(0.94); }
.kh-chat__send-btn:disabled { background: rgba(232,0,45,0.28); cursor: not-allowed; }

[data-theme="light"] .kh-chat__send-btn:disabled,
.light-mode .kh-chat__send-btn:disabled {
  background: rgba(230, 57, 70, 0.35) !important;
}

.kh-chat__error {
  font-size: 11px;
  font-family: var(--kh-mono);
  color: #FF6B6B;
  margin-top: 6px;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 440px) {
  .kh-chat {
    right: 0; bottom: 0;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
    border: none;
  }
  .kh-fab { bottom: 16px; right: 16px; }
}
</style>