<template>
  <button
    class="kh-fab"
    :class="{ 'kh-fab--open': isOpen }"
    aria-label="Toggle KartHub AI"
    @click="toggleChat"
  >
    <svg v-if="!isOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
    <span v-if="unreadCount > 0 && !isOpen" class="kh-fab__badge">{{ unreadCount }}</span>
  </button>

  <Transition name="chat-panel">
    <div v-if="isOpen" class="kh-chat" role="dialog" aria-label="KartHub AI Assistant">
      <div class="kh-chat__header">
        <div class="kh-chat__logo">KH</div>
        <div class="kh-chat__header-info">
          <div class="kh-chat__title">KartHub AI</div>
          <div class="kh-chat__subtitle">pit-lane assistant</div>
        </div>
        <div class="kh-chat__controls">
          <button class="kh-chat__icon-btn" title="Clear chat" @click="clearChat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
          <div class="kh-status-dot" :class="isStreaming ? 'kh-status-dot--thinking' : 'kh-status-dot--online'"></div>
        </div>
      </div>

      <div class="kh-chat__messages" ref="messagesEl">
        <div v-if="messages.length === 0" class="kh-chat__empty">
          <div class="kh-chat__empty-logo">KH</div>
          <p class="kh-chat__empty-text">Ask anything about karts,<br>parts, setups & more</p>
          <div class="kh-chat__suggestions">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              class="kh-chat__suggestion"
              @click="sendSuggestion(suggestion)"
            >{{ suggestion }}</button>
          </div>
        </div>

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

          <div v-if="msg.build" class="kh-build-card">
            <div class="kh-build-card__top">
              <div>
                <div class="kh-build-card__eyebrow">AI build created</div>
                <div class="kh-build-card__title">{{ msg.build.buildName }}</div>
              </div>
              <div class="kh-build-card__price">${{ msg.build.price.toFixed(2) }}</div>
            </div>

            <div class="kh-build-card__chips">
              <span class="kh-build-card__chip">{{ msg.build.type }}</span>
              <span class="kh-build-card__chip">{{ msg.build.selectedCount }}/{{ partTypes.length }} parts</span>
              <span v-if="msg.build.color" class="kh-build-card__chip">{{ msg.build.color }}</span>
            </div>

            <p class="kh-build-card__summary">{{ msg.build.summary }}</p>

            <ul v-if="msg.build.reasoning.length" class="kh-build-card__reasons">
              <li v-for="reason in msg.build.reasoning" :key="reason">{{ reason }}</li>
            </ul>

            <div class="kh-build-card__actions">
              <button class="kh-build-card__btn kh-build-card__btn--primary" @click="openGeneratedBuild(msg.build.buildID)">
                Open in Builder
              </button>
              <button class="kh-build-card__btn" @click="openMyDesigns()">
                View My Designs
              </button>
              <button class="kh-build-card__btn" @click="addGeneratedBuildToCart(msg.build)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="kh-chat__input-area">
        <div class="kh-chat__model-row">
          <div class="kh-chat__model-picker">
            <span class="kh-chat__model-label">model</span>
            <select v-model="selectedModel" class="kh-chat__model-select">
              <option value="anthropic/claude-sonnet-4-5">claude-sonnet-4-5</option>
              <option value="openai/gpt-4o">gpt-4o</option>
              <option value="mistralai/mistral-7b-instruct:free">mistral-7b (free)</option>
              <option value="meta-llama/llama-3.1-8b-instruct:free">llama-3.1-8b (free)</option>
            </select>
          </div>
          <button class="kh-chat__recent-toggle" :disabled="!recentPrompts.length" @click="toggleRecentPrompts">
            Recent prompts
          </button>
        </div>
        <div v-if="showRecentPrompts" class="kh-chat__recent-panel">
          <div class="kh-chat__recent-header">
            <span>Recent prompts</span>
            <button class="kh-chat__recent-clear" @click="clearRecentPrompts">Clear</button>
          </div>
          <div class="kh-chat__recent-list">
            <button
              v-for="prompt in recentPrompts"
              :key="prompt"
              class="kh-chat__recent-item"
              @click="reuseRecentPrompt(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
        </div>
        <div class="kh-chat__input-row">
          <textarea
            ref="inputEl"
            v-model="inputText"
            class="kh-chat__input"
            placeholder="Ask about karts, or tell me to build one for you..."
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
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p v-if="errorText" class="kh-chat__error">{{ errorText }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Design, DESIGN_TYPES, addDesign } from '@/datamodel/design'
import { PART_TYPES, getAllParts, getCompatibleParts } from '@/datamodel/part_1'
import { useAppStore } from '@/stores/app'

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const router = useRouter()
const store = useAppStore()
const RECENT_PROMPTS_STORAGE_KEY = 'karthub_recent_prompts'
const MAX_RECENT_PROMPTS = 6
const DEFAULT_MAX_TOKENS = 700
const MIN_MAX_TOKENS = 200

const props = defineProps({
  systemPrompt: {
    type: String,
    default: `You are KartHub AI, the expert pit-lane assistant for KartHub - a community platform for karting enthusiasts. You help with:
- Kart parts, setups, and tuning advice
- Race strategies and driving techniques
- Community posts, designs, and orders on KartHub
- Troubleshooting mechanical issues
Be concise, knowledgeable, and enthusiastic about karting. Keep responses short and direct.`
  }
})

const isOpen = ref(false)
const isStreaming = ref(false)
const inputText = ref('')
const errorText = ref('')
const unreadCount = ref(0)
const selectedModel = ref('anthropic/claude-sonnet-4-5')
const recentPrompts = ref(loadRecentPrompts())
const showRecentPrompts = ref(false)
const messages = ref([])
const messagesEl = ref(null)
const inputEl = ref(null)

const suggestions = [
  'Build me a budget kart for a beginner.',
  'Best kart setup for wet track?',
  'Create a race kart build for tight circuits.',
]

const buildRequestPattern = /\b(build|create|design|make|recommend)\b[\s\S]{0,40}\b(kart|build|setup)\b|\bwhat should i build\b/i
const colorOptions = ['Yellow', 'Black', 'Red', 'White', 'Blue', 'Green', 'Orange']
const partOrder = ['frame', 'engine', 'brake', 'wheel', 'seat', 'steering']
const partTypes = PART_TYPES
const allParts = getAllParts()
const partLookup = new Map(allParts.map(part => [part.ID, part]))

let msgId = 0

function makeId() {
  return ++msgId
}

function isBuildRequest(text) {
  return buildRequestPattern.test(text)
}

function getCatalogForPrompt() {
  return allParts
    .map(part => `${part.ID} | ${part.type} | ${part.name} | $${Number(part.price || 0).toFixed(2)} | ${part.availability ? 'available' : 'unavailable'}`)
    .join('\n')
}

function buildSystemPrompt() {
  return `${props.systemPrompt}

When you reply, always return valid JSON only with this exact shape:
{
  "reply": "short plain text reply for the chat UI",
  "build": null | {
    "buildName": "string",
    "type": "one of: ${DESIGN_TYPES.join(', ')}",
    "color": "one of: ${colorOptions.join(', ')} or null",
    "parts": {
      "engine": "part ID or null",
      "wheel": "part ID or null",
      "brake": "part ID or null",
      "frame": "part ID or null",
      "seat": "part ID or null",
      "steering": "part ID or null"
    },
    "summary": "one sentence summary",
    "reasoning": ["short reason", "short reason"]
  }
}

Rules:
- If the user asks you to create, design, recommend, or build a kart setup, include a build object.
- If the user is not asking for a build, set "build" to null.
- Use only part IDs from the catalog below.
- Prefer available parts.
- Keep reasoning short.
- Never use markdown fences or extra text outside the JSON.

KartHub catalog:
${getCatalogForPrompt()}`
}

function loadRecentPrompts() {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(RECENT_PROMPTS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(prompt => typeof prompt === 'string' && prompt.trim()) : []
  } catch {
    return []
  }
}

function persistRecentPrompts() {
  if (typeof window === 'undefined') return
  localStorage.setItem(RECENT_PROMPTS_STORAGE_KEY, JSON.stringify(recentPrompts.value))
}

function rememberPrompt(text) {
  const prompt = text.trim()
  if (!prompt) return

  recentPrompts.value = [
    prompt,
    ...recentPrompts.value.filter(item => item !== prompt),
  ].slice(0, MAX_RECENT_PROMPTS)

  persistRecentPrompts()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

function autoResize() {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height = `${Math.min(inputEl.value.scrollHeight, 100)}px`
}

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
  showRecentPrompts.value = false
}

function toggleRecentPrompts() {
  if (!recentPrompts.value.length) return
  showRecentPrompts.value = !showRecentPrompts.value
}

function clearRecentPrompts() {
  recentPrompts.value = []
  showRecentPrompts.value = false
  persistRecentPrompts()
}

function reuseRecentPrompt(prompt) {
  inputText.value = prompt
  showRecentPrompts.value = false
  nextTick(() => {
    autoResize()
    inputEl.value?.focus()
  })
}

function sendSuggestion(text) {
  inputText.value = text
  send()
}

function extractJson(text) {
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null

    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1))
    } catch {
      return null
    }
  }
}

function findPartId(value, type) {
  if (!value) return null

  if (partLookup.has(value)) {
    const exact = partLookup.get(value)
    return exact.type === type ? exact.ID : null
  }

  const normalized = String(value).trim().toLowerCase()
  const part = allParts.find(item =>
    item.type === type &&
    (item.name.toLowerCase() === normalized || item.ID.toLowerCase() === normalized),
  )

  return part?.ID || null
}

function getPreferredType(rawType, userText) {
  if (DESIGN_TYPES.includes(rawType)) return rawType

  const text = userText.toLowerCase()
  if (text.includes('cross')) return 'Cross Kart'
  if (text.includes('street')) return 'Street Kart'
  if (text.includes('junior')) return 'Junior Kart'
  if (text.includes('daily')) return 'Daily Kart'
  if (text.includes('pro')) return 'Pro Kart'
  return 'Race Kart'
}

function getPreferredColor(rawColor) {
  return colorOptions.includes(rawColor) ? rawColor : null
}

function chooseCompatiblePart(type, preferredId, selectedParts) {
  const options = getCompatibleParts(type, selectedParts).filter(part => part.availability)
  if (!options.length) return null
  if (preferredId && options.some(part => part.ID === preferredId)) return preferredId
  return options[0].ID
}

function normalizeGeneratedBuild(rawBuild, userText) {
  if (!rawBuild) return null

  const parts = Object.fromEntries(PART_TYPES.map(type => [type, null]))
  const requestedParts = rawBuild.parts || {}
  const type = getPreferredType(rawBuild.type, userText)

  for (const partType of partOrder) {
    const preferredId = findPartId(requestedParts[partType], partType)
    parts[partType] = chooseCompatiblePart(partType, preferredId, parts)
  }

  const selectedPartModels = Object.values(parts)
    .filter(Boolean)
    .map(id => partLookup.get(id))
    .filter(Boolean)

  return {
    buildName: rawBuild.buildName?.trim() || `${type} AI Build`,
    type,
    color: getPreferredColor(rawBuild.color),
    parts,
    price: selectedPartModels.reduce((sum, part) => sum + Number(part.price || 0), 0),
    selectedCount: selectedPartModels.length,
    summary: rawBuild.summary?.trim() || `A ${type.toLowerCase()} created from your request.`,
    reasoning: Array.isArray(rawBuild.reasoning) ? rawBuild.reasoning.filter(Boolean).slice(0, 3) : [],
  }
}

function createFallbackBuild(text) {
  const lowered = text.toLowerCase()
  const type =
    lowered.includes('beginner') || lowered.includes('budget')
      ? 'Daily Kart'
      : lowered.includes('cross')
        ? 'Cross Kart'
        : lowered.includes('street')
          ? 'Street Kart'
          : lowered.includes('junior')
            ? 'Junior Kart'
            : lowered.includes('pro')
              ? 'Pro Kart'
              : 'Race Kart'

  const color =
    lowered.includes('black')
      ? 'Black'
      : lowered.includes('yellow')
        ? 'Yellow'
        : lowered.includes('red')
          ? 'Red'
        : lowered.includes('white')
          ? 'White'
          : lowered.includes('blue')
            ? 'Blue'
            : lowered.includes('green')
              ? 'Green'
              : lowered.includes('orange')
                ? 'Orange'
          : null

  const rawBuild = {
    buildName: `${type} Starter`,
    type,
    color,
    parts: {
      frame: lowered.includes('budget') || lowered.includes('beginner') ? 'p-025' : lowered.includes('cross') ? 'p-023' : 'p-007',
      engine: lowered.includes('budget') || lowered.includes('beginner') ? 'p-013' : lowered.includes('premium') || lowered.includes('pro') ? 'p-015' : 'p-002',
      brake: lowered.includes('budget') || lowered.includes('beginner') ? 'p-005' : 'p-016',
      wheel: lowered.includes('budget') || lowered.includes('beginner') ? 'p-028' : 'p-026',
      seat: lowered.includes('budget') || lowered.includes('beginner') ? 'p-019' : 'p-020',
      steering: lowered.includes('premium') || lowered.includes('pro') ? 'p-022' : 'p-011',
    },
    summary: `A ${type.toLowerCase()} matched to your request.`,
    reasoning: [
      'Balanced around your requested use case',
      'Uses compatible available parts',
      'Ready to open in the builder',
    ],
  }

  return normalizeGeneratedBuild(rawBuild, text)
}

function saveGeneratedBuild(build) {
  const design = new Design({
    buildName: build.buildName,
    type: build.type,
    parts: build.parts,
    userID: store.currentUser?.email || null,
    price: build.price,
    color: build.color,
  })

  addDesign(design)

  return {
    ...build,
    buildID: design.buildID,
  }
}

async function requestAssistantPayload(history) {
  let maxTokens = DEFAULT_MAX_TOKENS

  while (maxTokens >= MIN_MAX_TOKENS) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'KartHub AI Assistant',
      },
      body: JSON.stringify({
        model: selectedModel.value,
        stream: false,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...history,
        ],
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content

      if (typeof content === 'string') {
        return extractJson(content) || { reply: content.trim(), build: null }
      }

      if (Array.isArray(content)) {
        const merged = content.map(item => item?.text || '').join('').trim()
        return extractJson(merged) || { reply: merged, build: null }
      }

      return null
    }

    const err = await res.json().catch(() => ({}))
    const message = err.error?.message || `HTTP ${res.status}`
    const affordableTokens = parseAffordableTokens(message)

    if (affordableTokens && affordableTokens >= MIN_MAX_TOKENS && affordableTokens < maxTokens) {
      maxTokens = affordableTokens
      continue
    }

    throw new Error(message)
  }

  throw new Error('OpenRouter could not afford the current response size. Try a cheaper model or add credits.')
}

function parseAffordableTokens(message) {
  if (typeof message !== 'string') return null

  const match = message.match(/can only afford\s+(\d+)/i)
  if (!match) return null

  const affordable = Number(match[1])
  if (!Number.isFinite(affordable)) return null

  return Math.max(MIN_MAX_TOKENS, affordable)
}

function openGeneratedBuild(buildId) {
  if (!buildId) return
  router.push(`/builder?id=${buildId}`)
  isOpen.value = false
}

function openMyDesigns() {
  router.push('/my-designs')
  isOpen.value = false
}

function addGeneratedBuildToCart(build) {
  if (!build?.buildID) return

  store.addToCart({
    id: build.buildID,
    name: build.buildName,
    type: build.type,
    price: build.price,
    parts: { ...build.parts },
    color: build.color,
  })

  errorText.value = 'Build added to cart.'
}

async function send() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return

  errorText.value = ''
  showRecentPrompts.value = false
  rememberPrompt(text)
  inputText.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  isStreaming.value = true

  messages.value.push({ id: makeId(), role: 'user', content: text })
  await scrollToBottom()

  const history = messages.value.map(message => ({ role: message.role, content: message.content }))
  const aiMsg = { id: makeId(), role: 'assistant', content: '', streaming: true, build: null }
  messages.value.push(aiMsg)
  await scrollToBottom()

  try {
    let payload = null

    if (apiKey) {
      payload = await requestAssistantPayload(history)
    }

    if (!payload && isBuildRequest(text)) {
      payload = {
        reply: apiKey
          ? 'I created a kart based on your request and saved it to My Designs.'
          : 'I created a local demo build from your request because the API key is not configured.',
        build: createFallbackBuild(text),
      }
    }

    if (!payload && !apiKey) {
      payload = {
        reply: 'API key not configured yet. Ask me for a kart build and I can still create a local demo build for you.',
        build: null,
      }
    }

    if (!payload) {
      throw new Error('The AI response could not be parsed.')
    }

    aiMsg.content = payload.reply || 'I am ready to help with your kart questions.'

    if (payload.build) {
      const normalizedBuild = normalizeGeneratedBuild(payload.build, text)
      if (normalizedBuild) {
        aiMsg.build = saveGeneratedBuild(normalizedBuild)
        aiMsg.content = `${aiMsg.content} Open it in the builder to tweak anything.`
      }
    }
  } catch (err) {
    aiMsg.content = isBuildRequest(text)
      ? 'I could not generate that build right now. Try again with the kart type or goal you want.'
      : 'Something went wrong. Please try again.'
    errorText.value = err.message
  } finally {
    aiMsg.streaming = false
    isStreaming.value = false

    if (!isOpen.value) unreadCount.value++

    await scrollToBottom()
    await nextTick()
    inputEl.value?.focus()
  }
}

watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.kh-chat, .kh-fab {
  --kh-red: #e8002d;
  --kh-dark: #0d0d0d;
  --kh-surface: #141414;
  --kh-card: #1c1c1e;
  --kh-border: rgba(255,255,255,0.08);
  --kh-muted: rgba(255,255,255,0.35);
  --kh-text: #f0f0f0;
  --kh-accent: #ff6b00;
  --kh-font: 'DM Sans', sans-serif;
  --kh-mono: 'JetBrains Mono', monospace;
  --kh-display: 'Bebas Neue', sans-serif;
}

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

.kh-fab svg {
  width: 22px;
  height: 22px;
}

.kh-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(232,0,45,0.5);
}

.kh-fab:active {
  transform: scale(0.94);
}

.kh-fab--open {
  background: #333;
  box-shadow: none;
}

.kh-fab__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
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

[data-theme="light"] .kh-chat,
.light-mode .kh-chat {
  background: #fcfdff !important;
  color: #1a1a1a !important;
  border-color: rgba(230, 57, 70, 0.14) !important;
  box-shadow: 0 24px 80px rgba(17, 24, 39, 0.16), 0 0 0 1px rgba(230, 57, 70, 0.06) !important;
}

.kh-chat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--kh-red);
  z-index: 1;
}

.chat-panel-enter-active {
  animation: panel-in 0.25s cubic-bezier(0.34,1.56,0.64,1);
}

.chat-panel-leave-active {
  animation: panel-in 0.18s ease-in reverse;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.kh-chat__header {
  padding: 14px 16px 14px 22px;
  border-bottom: 1px solid var(--kh-border);
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--kh-card);
  flex-shrink: 0;
}

[data-theme="light"] .kh-chat__header,
.light-mode .kh-chat__header {
  background: #ffffff !important;
  border-bottom-color: rgba(230, 57, 70, 0.14) !important;
}

.kh-chat__logo {
  width: 30px;
  height: 30px;
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

.kh-chat__header-info {
  flex: 1;
}

.kh-chat__title {
  font-family: var(--kh-display);
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
  line-height: 1;
}

[data-theme="light"] .kh-chat__title,
.light-mode .kh-chat__title {
  color: #151515 !important;
}

.kh-chat__subtitle {
  font-size: 10px;
  color: var(--kh-muted);
  font-family: var(--kh-mono);
  margin-top: 2px;
}

[data-theme="light"] .kh-chat__subtitle,
.light-mode .kh-chat__subtitle {
  color: #7a7a7a !important;
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

.kh-chat__icon-btn:hover {
  color: var(--kh-text);
}

[data-theme="light"] .kh-chat__icon-btn,
.light-mode .kh-chat__icon-btn {
  color: #8a8a8a !important;
}

[data-theme="light"] .kh-chat__icon-btn:hover,
.light-mode .kh-chat__icon-btn:hover {
  color: #1a1a1a !important;
}

.kh-chat__icon-btn svg {
  width: 14px;
  height: 14px;
}

.kh-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kh-status-dot--online {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34,197,94,.5);
  animation: pulse-dot 2s ease-in-out infinite;
}

.kh-status-dot--thinking {
  background: var(--kh-accent);
  box-shadow: 0 0 6px rgba(255,107,0,.5);
  animation: pulse-dot 0.6s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.kh-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

[data-theme="light"] .kh-chat__messages,
.light-mode .kh-chat__messages {
  background: linear-gradient(180deg, #fcfdff 0%, #f7f9fc 100%) !important;
}

.kh-chat__messages::-webkit-scrollbar {
  width: 3px;
}

.kh-chat__messages::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
}

[data-theme="light"] .kh-chat__messages::-webkit-scrollbar-thumb,
.light-mode .kh-chat__messages::-webkit-scrollbar-thumb {
  background: rgba(230, 57, 70, 0.15) !important;
}

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

[data-theme="light"] .kh-chat__empty-text,
.light-mode .kh-chat__empty-text {
  color: #6f6f6f !important;
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

[data-theme="light"] .kh-chat__suggestion,
.light-mode .kh-chat__suggestion {
  background: #ffffff !important;
  color: #1a1a1a !important;
  border-color: rgba(230, 57, 70, 0.12) !important;
}

[data-theme="light"] .kh-chat__suggestion:hover,
.light-mode .kh-chat__suggestion:hover {
  border-color: rgba(230, 57, 70, 0.28) !important;
  background: rgba(230, 57, 70, 0.08) !important;
}

.kh-msg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 88%;
  animation: msg-in 0.22s ease-out both;
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kh-msg--user {
  align-self: flex-end;
  align-items: flex-end;
}

.kh-msg--assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.kh-msg__role {
  font-size: 10px;
  font-family: var(--kh-mono);
  letter-spacing: 1.5px;
  color: var(--kh-muted);
  text-transform: uppercase;
}

.kh-msg--user .kh-msg__role {
  color: rgba(255,107,0,0.6);
}

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
  background: #f5f7fb !important;
  color: #1a1a1a !important;
  border-color: rgba(230, 57, 70, 0.15) !important;
}

.kh-build-card {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--kh-border);
  border-radius: 4px;
  padding: 12px;
}

[data-theme="light"] .kh-build-card,
.light-mode .kh-build-card {
  background: #ffffff !important;
  border-color: rgba(230, 57, 70, 0.14) !important;
  color: #1a1a1a !important;
}

.kh-build-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.kh-build-card__eyebrow {
  font-size: 10px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--kh-accent);
  font-family: var(--kh-mono);
}

.kh-build-card__title {
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
}

.kh-build-card__price {
  font-family: var(--kh-mono);
  font-size: 12px;
  color: var(--kh-text);
}

[data-theme="light"] .kh-build-card__title,
.light-mode .kh-build-card__title,
[data-theme="light"] .kh-build-card__price,
.light-mode .kh-build-card__price {
  color: #1a1a1a !important;
}

.kh-build-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.kh-build-card__chip {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
}

[data-theme="light"] .kh-build-card__chip,
.light-mode .kh-build-card__chip {
  background: #f5f7fb !important;
  color: #1a1a1a !important;
  border-color: rgba(230, 57, 70, 0.14) !important;
}

.kh-build-card__summary {
  font-size: 12px;
  line-height: 1.6;
  color: var(--kh-text);
  margin: 10px 0 0;
}

[data-theme="light"] .kh-build-card__summary,
.light-mode .kh-build-card__summary {
  color: #2a2a2a !important;
}

.kh-build-card__reasons {
  margin: 10px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--kh-muted);
}

[data-theme="light"] .kh-build-card__reasons,
.light-mode .kh-build-card__reasons {
  color: #666666 !important;
}

.kh-build-card__reasons li + li {
  margin-top: 4px;
}

.kh-build-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.kh-build-card__btn {
  flex: 1;
  border: 1px solid var(--kh-border);
  background: transparent;
  color: var(--kh-text);
  border-radius: 3px;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

[data-theme="light"] .kh-build-card__btn,
.light-mode .kh-build-card__btn {
  color: #1a1a1a !important;
  border-color: rgba(230, 57, 70, 0.16) !important;
  background: #ffffff !important;
}

.kh-build-card__btn:hover {
  background: rgba(255,255,255,0.05);
}

[data-theme="light"] .kh-build-card__btn:hover,
.light-mode .kh-build-card__btn:hover {
  background: rgba(230, 57, 70, 0.08) !important;
  border-color: rgba(230, 57, 70, 0.3) !important;
}

.kh-build-card__btn--primary {
  background: var(--kh-red);
  border-color: var(--kh-red);
  color: #fff;
}

.kh-build-card__btn--primary:hover {
  background: #c8001f;
}

.kh-cursor {
  display: inline-block;
  width: 2px;
  height: 13px;
  background: var(--kh-red);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.7s step-end infinite;
}

@keyframes blink {
  0%,100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

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
  background: #f5f7fb !important;
}

.kh-chat__model-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.kh-chat__model-picker {
  display: flex;
  align-items: center;
  gap: 6px;
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

[data-theme="light"] .kh-chat__model-select,
.light-mode .kh-chat__model-select {
  color: #b42318 !important;
}

.kh-chat__model-select option {
  background: #1c1c1e;
  color: #f0f0f0;
}

.kh-chat__recent-toggle {
  border: 1px solid var(--kh-border);
  background: transparent;
  color: var(--kh-text);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 10px;
  font-family: var(--kh-mono);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.kh-chat__recent-toggle:hover:not(:disabled) {
  border-color: rgba(232,0,45,0.4);
  background: rgba(232,0,45,0.08);
}

.kh-chat__recent-toggle:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.kh-chat__recent-panel {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid var(--kh-border);
  border-radius: 4px;
  background: rgba(255,255,255,0.03);
}

.kh-chat__recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 10px;
  font-family: var(--kh-mono);
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--kh-muted);
}

.kh-chat__recent-clear {
  border: none;
  background: none;
  color: var(--kh-accent);
  cursor: pointer;
  padding: 0;
  font: inherit;
  text-transform: uppercase;
}

.kh-chat__recent-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 148px;
  overflow-y: auto;
}

.kh-chat__recent-item {
  width: 100%;
  text-align: left;
  border: 1px solid var(--kh-border);
  background: var(--kh-surface);
  color: var(--kh-text);
  border-radius: 3px;
  padding: 9px 10px;
  font-size: 12px;
  line-height: 1.45;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.kh-chat__recent-item:hover {
  border-color: rgba(232,0,45,0.35);
  background: rgba(232,0,45,0.06);
}

[data-theme="light"] .kh-chat__recent-toggle,
.light-mode .kh-chat__recent-toggle {
  color: #1a1a1a !important;
  border-color: rgba(230, 57, 70, 0.18) !important;
  background: #ffffff !important;
}

[data-theme="light"] .kh-chat__recent-toggle:hover:not(:disabled),
.light-mode .kh-chat__recent-toggle:hover:not(:disabled) {
  border-color: rgba(230, 57, 70, 0.35) !important;
  background: rgba(230, 57, 70, 0.08) !important;
}

[data-theme="light"] .kh-chat__recent-panel,
.light-mode .kh-chat__recent-panel {
  background: #ffffff !important;
  border-color: rgba(230, 57, 70, 0.15) !important;
}

[data-theme="light"] .kh-chat__recent-header,
.light-mode .kh-chat__recent-header {
  color: #666666 !important;
}

[data-theme="light"] .kh-chat__recent-clear,
.light-mode .kh-chat__recent-clear {
  color: #c62828 !important;
}

[data-theme="light"] .kh-chat__recent-item,
.light-mode .kh-chat__recent-item {
  background: #f5f7fb !important;
  color: #1a1a1a !important;
  border-color: rgba(230, 57, 70, 0.12) !important;
}

[data-theme="light"] .kh-chat__recent-item:hover,
.light-mode .kh-chat__recent-item:hover {
  background: rgba(230, 57, 70, 0.08) !important;
  border-color: rgba(230, 57, 70, 0.28) !important;
}

[data-theme="light"] .kh-chat__model-select option,
.light-mode .kh-chat__model-select option {
  background: #f5f7fb;
  color: #1a1a1a;
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

.kh-chat__input:focus {
  border-color: rgba(232,0,45,0.4);
}

.kh-chat__input::placeholder {
  color: var(--kh-muted);
}

.kh-chat__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

[data-theme="light"] .kh-chat__input,
.light-mode .kh-chat__input {
  background: #fff !important;
  color: #1a1a1a !important;
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

.kh-chat__send-btn svg {
  width: 16px;
  height: 16px;
}

.kh-chat__send-btn:hover:not(:disabled) {
  background: #c8001f;
}

.kh-chat__send-btn:active:not(:disabled) {
  transform: scale(0.94);
}

.kh-chat__send-btn:disabled {
  background: rgba(232,0,45,0.28);
  cursor: not-allowed;
}

[data-theme="light"] .kh-chat__send-btn:disabled,
.light-mode .kh-chat__send-btn:disabled {
  background: rgba(230, 57, 70, 0.35) !important;
}

.kh-chat__error {
  font-size: 11px;
  font-family: var(--kh-mono);
  color: #ff6b6b;
  margin-top: 6px;
}

@media (max-width: 440px) {
  .kh-chat {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
    border: none;
  }

  .kh-fab {
    bottom: 16px;
    right: 16px;
  }
}
</style>
