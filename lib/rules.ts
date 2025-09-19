export interface Rule {
  id: string
  title: string
  content: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// Default house rules from the provided text
const DEFAULT_RULES: Omit<Rule, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "الضوضاء و أوقات الهدوء",
    content: `أوقات الهدوء: من 10 مساءً إلى 6 صباحًا → صمت تام.

ممنوع الصراخ أو أي صوت مرتفع في أي وقت.

لا زيارات جماعية أو ضحك بصوت مرتفع ليلًا.

يُستثنى من ذلك من لديه امتحانات، عمل، أو يحتاج للراحة.`,
    order: 1,
  },
  {
    title: "الضيوف",
    content: `يُسمح بالضيوف لكن بشروط:

يجب المغادرة قبل بداية أوقات الهدوء.

لا زيارات يومية متكررة.

من دعا الضيف يكون مسؤولًا عن أي إزعاج أو مشكلة يسببها.`,
    order: 2,
  },
  {
    title: "المطبخ",
    content: `الأدوات والأواني تُحفظ دائمًا تحت الحوض.

التوابل (ملح، إلخ) تبقى فوق ليستفيد منها الجميع (إن وافق صاحبها).

يجب تنظيف كل شيء فور الاستخدام.

إذا تُركت أدوات متّسخة → لأي شخص الحق في رميها في الشرفة.

لكل شخص كيس قمامة خاص به (إلا إذا اتفق اثنان على المشاركة).

كل شخص يرمي قمامته بنفسه.`,
    order: 3,
  },
  {
    title: "الثلاجة",
    content: `إذا لم تُصلح → المساحة الصغيرة تُقسم بالتساوي.

إذا ملأها شخص بأغراضه → للآخرين الحق في ترك طعامهم بالخارج.`,
    order: 4,
  },
  {
    title: "الحمام و المرحاض",
    content: `امسح الماء عن الأرض بعد الاستحمام أو الاستخدام.

يجب إبقاء النافذة مفتوحة دائمًا.

ممنوع ترك الصابون أو الشامبو بالداخل (المكان ضيق).

على الجميع استخدام معطّر أو منظّف بين فترة وأخرى لرائحة أفضل.

يجب أن يبقى كرسي المرحاض وخرطوم المياه نظيفين دائمًا.

الأهم: ❌ ممنوع الاستمناء داخل الحمام.`,
    order: 5,
  },
  {
    title: "التنظيف و المنتجات المشتركة",
    content: `كل شخص ينظف غرفته.

إذا خرجت رائحة كريهة للممر → يجب تنظيفها فورًا.

الأشياء التي تُشترى معًا = استعمالها متاح للجميع.

الاستخدام يكون عادلًا وحسب الحاجة فقط.

لا يُستهلك كل المنتج مرة واحدة.`,
    order: 6,
  },
  {
    title: "الخصوصية و الاحترام",
    content: `يجب الطرق قبل دخول أي غرفة.

ممنوع أخذ أو استعارة أي شيء دون إذن.

إذا حدثت مشكلة → تواصل مباشرة معي أو أرسل رسالة.`,
    order: 7,
  },
]

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function saveRulesToStorage(rules: Rule[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("house-rules", JSON.stringify(rules))
  }
}

function loadRulesFromStorage(): Rule[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("house-rules")
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    return parsed.map((rule: any) => ({
      ...rule,
      createdAt: new Date(rule.createdAt),
      updatedAt: new Date(rule.updatedAt),
    }))
  } catch {
    return []
  }
}

export async function initializeRules(): Promise<void> {
  try {
    console.log("[v0] Initializing rules...")
    const existingRules = loadRulesFromStorage()

    if (existingRules.length === 0) {
      console.log("[v0] No existing rules found, creating default rules")
      const rules: Rule[] = DEFAULT_RULES.map((rule) => ({
        ...rule,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      saveRulesToStorage(rules)
      console.log("[v0] Default rules created:", rules.length)
    } else {
      console.log("[v0] Found existing rules:", existingRules.length)
    }
  } catch (error) {
    console.error("Error initializing rules:", error)
    // Force create default rules if there's an error
    const rules: Rule[] = DEFAULT_RULES.map((rule) => ({
      ...rule,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    saveRulesToStorage(rules)
    console.log("[v0] Force created default rules after error:", rules.length)
  }
}

export async function getRules(): Promise<Rule[]> {
  try {
    console.log("[v0] Getting rules...")
    let rules = loadRulesFromStorage()

    // If no rules found, initialize them first
    if (rules.length === 0) {
      console.log("[v0] No rules found, initializing...")
      await initializeRules()
      rules = loadRulesFromStorage()
    }

    console.log("[v0] Retrieved rules:", rules.length)
    return rules.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Error getting rules:", error)
    return []
  }
}

export async function addRule(rule: Omit<Rule, "id" | "createdAt" | "updatedAt">): Promise<boolean> {
  try {
    const rules = loadRulesFromStorage()
    const newRule: Rule = {
      ...rule,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    rules.push(newRule)
    saveRulesToStorage(rules)
    return true
  } catch (error) {
    console.error("Error adding rule:", error)
    return false
  }
}

export async function updateRule(id: string, updates: Partial<Omit<Rule, "id" | "createdAt">>): Promise<boolean> {
  try {
    const rules = loadRulesFromStorage()
    const index = rules.findIndex((rule) => rule.id === id)
    if (index === -1) return false

    rules[index] = {
      ...rules[index],
      ...updates,
      updatedAt: new Date(),
    }
    saveRulesToStorage(rules)
    return true
  } catch (error) {
    console.error("Error updating rule:", error)
    return false
  }
}

export async function deleteRule(id: string): Promise<boolean> {
  try {
    const rules = loadRulesFromStorage()
    const filteredRules = rules.filter((rule) => rule.id !== id)
    saveRulesToStorage(filteredRules)
    return true
  } catch (error) {
    console.error("Error deleting rule:", error)
    return false
  }
}
