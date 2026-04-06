import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { getMeasurements } from '../lib/storage'

interface Section {
  id: string
  icon: string
  title: string
  badge?: { label: string; color: string; bg: string }
  content: React.ReactNode
}

function AccordionItem({ section, isOpen, onToggle }: {
  section: Section
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.995 }}
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: isOpen
          ? '1px solid rgba(99,102,241,0.4)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isOpen
          ? '0 0 0 1px rgba(99,102,241,0.1), 0 8px 32px rgba(99,102,241,0.08)'
          : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon container */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{
              background: isOpen
                ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))'
                : 'rgba(255,255,255,0.06)',
              border: isOpen ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)'
            }}
          >
            {section.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{section.title}</span>
              {section.badge && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: section.badge.bg, color: section.badge.color }}
                >
                  {section.badge.label}
                </span>
              )}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: isOpen ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
            color: isOpen ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
            fontSize: '10px'
          }}
        >
          ▼
        </motion.div>
      </button>

      {/* Divider visible when open */}
      {isOpen && (
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)', margin: '0 16px' }} />
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-4 text-sm text-white/75 leading-relaxed space-y-2">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function BodyWeightSection() {
  const { saveTodayWeight } = useProgramStore()
  const [input, setInput] = useState('')
  const measurements = getMeasurements()
  const recent = measurements.slice(0, 7).reverse()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="83.0"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-white/30"
        />
        <span className="text-white/40 font-medium">кг</span>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            const w = parseFloat(input)
            if (w > 0) { saveTodayWeight(w); setInput('') }
          }}
          className="px-4 py-3 rounded-full font-bold text-sm text-white whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
        >
          Сохранить
        </motion.button>
      </div>
      {recent.length > 0 && (
        <div className="space-y-1">
          {recent.map(m => (
            <div key={m.recorded_at} className="flex justify-between text-sm">
              <span className="text-white/40">{m.recorded_at}</span>
              <span className="text-white font-semibold">{m.weight_kg} кг</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const SECTIONS: Section[] = [
  {
    id: 'bodyweight',
    icon: '⚖️',
    title: 'Вес тела',
    badge: { label: 'ЕЖЕДНЕВНО', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    content: <BodyWeightSection />,
  },
  {
    id: 'technique',
    icon: '🎯',
    title: 'Техника',
    badge: { label: 'БАЗА', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-indigo-300 mb-1">Темп 3-1-2: что это и зачем</p>
          <p>
            Темп описывает скорость движения в каждой фазе повторения:
          </p>
          <ul className="mt-2 space-y-1 pl-4 list-disc">
            <li><span className="text-white font-semibold">3 сек</span> — эксцентрическая фаза (вниз/растяжение)</li>
            <li><span className="text-white font-semibold">1 сек</span> — пауза в нижней точке</li>
            <li><span className="text-white font-semibold">2 сек</span> — концентрическая фаза (вверх/сокращение)</li>
          </ul>
          <p className="mt-2 text-white/60 text-xs">
            Медленный темп увеличивает время нахождения мышцы под нагрузкой (TUT — time under tension), что стимулирует гипертрофию лучше, чем быстрые повторения.
          </p>
        </div>
        <div>
          <p className="font-bold text-indigo-300 mb-1">RIR (Reps in Reserve) — как подобрать вес</p>
          <p>
            RIR = количество повторений, которые ты мог бы ещё сделать до отказа.
          </p>
          <ul className="mt-2 space-y-1 pl-4 list-disc">
            <li><span className="text-white font-semibold">RIR 2-3</span> — гипертрофия-блок (начало цикла)</li>
            <li><span className="text-white font-semibold">RIR 1-2</span> — силовой блок</li>
            <li><span className="text-white font-semibold">RIR 0-1</span> — пиковая нагрузка</li>
          </ul>
          <p className="mt-2 text-white/60 text-xs">
            Если после подхода ты понимаешь, что мог сделать ещё 5+ повторений — вес слишком лёгкий. Увеличивай.
          </p>
        </div>
        <div>
          <p className="font-bold text-indigo-300 mb-1">Правильная разминка (10 мин)</p>
          <p>Только динамическая разминка — статическая растяжка перед тренировкой снижает силу!</p>
          <ul className="mt-2 space-y-1 pl-4 list-disc">
            <li>2 мин — лёгкое кардио (ходьба, эллипс)</li>
            <li>3 мин — динамические круги суставами (плечи, бёдра, колени)</li>
            <li>5 мин — разминочные сеты с 50% рабочего веса (2×15)</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'nutrition',
    icon: '🍽️',
    title: 'Питание',
    badge: { label: 'КЛЮЧЕВОЕ', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    content: (
      <div className="space-y-4">
        {/* Calorie targets */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="text-xl font-black text-white">2 700</div>
            <div className="text-indigo-300 text-xs font-semibold">ккал TDEE</div>
            <div className="text-white/40 text-xs mt-1">расход в день</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="text-xl font-black text-white">2 300</div>
            <div className="text-emerald-400 text-xs font-semibold">ккал цель</div>
            <div className="text-white/40 text-xs mt-1">дефицит −400 ккал</div>
          </div>
        </div>

        {/* Macros */}
        <div>
          <p className="font-bold text-indigo-300 mb-2">Макронутриенты в день</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-white/80">💪 Белок</span>
              <span className="text-white font-black text-lg">170 г</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-white/80">⚡ Углеводы</span>
              <span className="text-white font-black text-lg">236 г</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-white/80">🥑 Жиры</span>
              <span className="text-white font-black text-lg">75 г</span>
            </div>
          </div>
          <p className="text-amber-400 text-xs mt-2">
            ⚠️ В дни тренировок добавляй +50-80 г углеводов для топлива и восстановления
          </p>
        </div>

        {/* Protein why every day */}
        <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <p className="font-bold text-amber-400 mb-1">❗ Белок 170г КАЖДЫЙ день — даже в дни отдыха!</p>
          <ul className="space-y-1 pl-3 text-xs text-white/70 list-disc">
            <li>Синтез мышечного белка длится 24-48 часов после тренировки</li>
            <li>В дни отдыха мышцы ВСЁ ЕЩЁ строятся и восстанавливаются</li>
            <li>После 40 лет синтез белка менее эффективен → постоянное поступление аминокислот критично</li>
          </ul>
        </div>

        {/* Meal timing */}
        <div>
          <p className="font-bold text-indigo-300 mb-2">Распределение по дню (4 приёма × 42г)</p>
          <ul className="space-y-1 pl-3 text-xs text-white/70 list-disc">
            <li>До тренировки (за 60-90 мин): углеводы + белок</li>
            <li>После тренировки (в течение 2 часов): белок</li>
            <li>Перед сном: медленный белок (творог, казеин)</li>
          </ul>
        </div>

        {/* Example day */}
        <div>
          <p className="font-bold text-indigo-300 mb-2">Пример дня — 170 г белка</p>
          <div className="space-y-2">
            {[
              { meal: '🌅 Завтрак', food: '3 яйца + 200г творога', protein: 53 },
              { meal: '🌞 Обед', food: '200г куриной грудки', protein: 46 },
              { meal: '🍎 Перекус', food: 'Протеиновый коктейль', protein: 25 },
              { meal: '🌙 Ужин', food: '200г рыбы (тунец/лосось)', protein: 40 },
            ].map(item => (
              <div key={item.meal} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div>
                  <div className="text-white/80 font-semibold text-xs">{item.meal}</div>
                  <div className="text-white/50 text-xs">{item.food}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-black">{item.protein}г</div>
                  <div className="text-white/30 text-xs">белок</div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="text-emerald-400 font-bold">Итого</span>
              <span className="text-emerald-400 font-black text-lg">164г ≈ ✅</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'legs',
    icon: '🦵',
    title: 'Ноги и гормоны',
    badge: { label: 'ГОРМОНЫ', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    content: (
      <div className="space-y-3">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p className="font-bold text-indigo-300 mb-1">Системный анаболический эффект</p>
          <p>Тяжёлые тренировки ног запускают мощный выброс тестостерона и гормона роста по всему телу. Это помогает расти груди, спине и рукам — даже если ты их не тренируешь в этот день.</p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-xl flex-shrink-0">🔥</span>
            <div>
              <p className="text-white font-semibold text-sm">EPOC эффект</p>
              <p className="text-white/60 text-xs mt-0.5">Метаболизм остаётся ускоренным 24-48ч после тяжёлой тренировки ног — тело продолжает сжигать калории в покое.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-xl flex-shrink-0">💪</span>
            <div>
              <p className="text-white font-semibold text-sm">Максимальный гормональный отклик</p>
              <p className="text-white/60 text-xs mt-0.5">Ноги — самые крупные мышцы тела. Чем больше мышечная масса задействована → тем сильнее гормональный ответ.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-xl flex-shrink-0">🚶</span>
            <div>
              <p className="text-white font-semibold text-sm">15K шагов после тренировки ног</p>
              <p className="text-white/60 text-xs mt-0.5">Ходьба разгоняет кровь, ускоряет вывод лактата и улучшает восстановление мышц. Не сидеть после тяжёлых ног!</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <span className="text-xl flex-shrink-0">🍑</span>
            <div>
              <p className="text-white font-semibold text-sm">Ягодичный мост (Hip Thrust) — добавлен в программу</p>
              <p className="text-white/60 text-xs mt-0.5">Максимальная активация ягодиц при минимальной нагрузке на позвоночник. Завершает V-образный силуэт в профиль. Добавлен в конец Тренировки A после жима ногами.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'muscle-science',
    icon: '🧬',
    title: 'Наука о росте мышц',
    badge: { label: 'НАУКА', color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              icon: '📈',
              title: 'Прогрессивная перегрузка',
              desc: 'Главный и единственный принцип роста. Не тяжесть сама по себе — а постоянный прогресс: +вес, +повторения, +подходы, -темп. Без прогресса нет роста.'
            },
            {
              icon: '😴',
              title: 'Мышцы растут во время ОТДЫХА',
              desc: 'На тренировке ты создаёшь микроповреждения. Рост происходит во время сна и восстановления. Без отдыха — только разрушение.'
            },
            {
              icon: '🌙',
              title: 'Сон 7-8 часов — обязателен',
              desc: 'Основной выброс гормона роста (GH) происходит в фазе глубокого сна. Меньше сна = меньше GH = меньше роста. Нет переговоров.'
            },
            {
              icon: '😤',
              title: 'Кортизол — враг мышц',
              desc: 'Хронический стресс повышает кортизол, который разрушает мышечный белок. Управление стрессом — это часть тренинга.'
            },
          ].map(item => (
            <div key={item.title} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-white/60 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'supplements',
    icon: '💊',
    title: 'Добавки',
    badge: { label: '5 ПОЗИЦИЙ', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    content: (
      <div className="space-y-3">
        {[
          {
            name: 'Креатин моногидрат',
            dose: '5 г/день',
            timing: 'Ежедневно в любое время, лучше после тренировки',
            effect: 'Увеличивает силу и объём мышц за счёт насыщения фосфокреатином. Одна из немногих добавок с железной доказательной базой.',
            icon: '⚡',
            color: '#6366f1',
          },
          {
            name: 'HMB (β-гидрокси β-метилбутират)',
            dose: '3 г/день (3×1 г)',
            timing: 'По 1 г с каждым основным приёмом пищи',
            effect: 'Защищает мышцы от распада при калорийном дефиците. Особенно эффективен в период сушки или при редких тренировках.',
            icon: '🛡️',
            color: '#10b981',
          },
          {
            name: 'Витамин D3 + K2',
            dose: '2000–5000 IU D3 + 100–200 мкг K2',
            timing: 'Утром с жирной едой',
            effect: 'D3 поддерживает уровень тестостерона и иммунитет. K2 направляет кальций в кости, а не в сосуды. Синергичная пара.',
            icon: '☀️',
            color: '#f59e0b',
          },
          {
            name: 'Омега-3',
            dose: '2–3 г EPA/DHA в день',
            timing: 'Во время еды (снижает "рыбную" отрыжку)',
            effect: 'Противовоспалительный эффект ускоряет восстановление после тренировок. Улучшает инсулинорезистентность и здоровье суставов.',
            icon: '🐟',
            color: '#06b6d4',
          },
          {
            name: 'Магний глицинат',
            dose: '400 мг перед сном',
            timing: 'За 30–60 мин до сна',
            effect: 'Улучшает качество сна и ночную регенерацию. Глицинатная форма хорошо усваивается и не вызывает слабительного эффекта.',
            icon: '🌙',
            color: '#8b5cf6',
          },
        ].map(supp => (
          <div
            key={supp.name}
            className="rounded-xl p-3 space-y-1"
            style={{ background: `${supp.color}12`, border: `1px solid ${supp.color}30` }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span>{supp.icon}</span>
              <span className="font-bold text-white text-sm">{supp.name}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
                style={{ background: `${supp.color}25`, color: supp.color }}
              >
                {supp.dose}
              </span>
            </div>
            <p className="text-white/50 text-xs">{supp.timing}</p>
            <p className="text-white/70 text-xs leading-relaxed">{supp.effect}</p>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'periodization',
    icon: '📅',
    title: 'Периодизация программы',
    badge: { label: 'ЦИКЛ 9 НЕД', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-xs">
          Блочная периодизация — научно подтверждённый подход для максимального прогресса без перетренировки.
        </p>

        <div className="space-y-2">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-indigo-300">Блок 1 — Гипертрофия</p>
              <span className="text-white/40 text-xs">Нед 1-4</span>
            </div>
            <ul className="text-xs text-white/70 space-y-0.5 pl-3 list-disc">
              <li>10-12 повторений</li>
              <li>70-80% от максимума</li>
              <li>4 подхода на упражнение</li>
              <li>RIR 2-3 (умеренная интенсивность)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-amber-400">Блок 2 — Сила</p>
              <span className="text-white/40 text-xs">Нед 5-8</span>
            </div>
            <ul className="text-xs text-white/70 space-y-0.5 pl-3 list-disc">
              <li>6-8 повторений</li>
              <li>80-85% от максимума</li>
              <li>4-5 подходов на упражнение</li>
              <li>RIR 1-2 (высокая интенсивность)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-emerald-400">Неделя 9 — Разгрузка</p>
              <span className="text-white/40 text-xs">Нед 9</span>
            </div>
            <ul className="text-xs text-white/70 space-y-0.5 pl-3 list-disc">
              <li>50% объёма тренировок</li>
              <li>Лёгкие веса (60-70%)</li>
              <li>Восстановление нервной системы и суставов</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <span className="text-2xl">🔄</span>
          <p className="text-white/70 text-xs">
            После разгрузки цикл повторяется с более высокими базовыми весами. Каждый цикл — новый уровень.
          </p>
        </div>
      </div>
    )
  }
]

export default function InfoPage() {
  const [openSection, setOpenSection] = useState<string | null>('nutrition')

  const toggle = (id: string) => {
    setOpenSection(prev => prev === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      {/* Header */}
      <div
        className="px-5 pb-5"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.18) 0%, transparent 100%)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">БАЗА ЗНАНИЙ</span>
        </div>
        <h1 className="text-2xl font-black text-white">Инфо</h1>
        <p className="text-white/40 text-sm mt-1">Наука и знания для максимального результата</p>
      </div>

      {/* Gradient divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)', margin: '0 20px 16px' }} />

      {/* Accordion sections */}
      <div className="px-4 space-y-2.5">
        {SECTIONS.map(section => (
          <AccordionItem
            key={section.id}
            section={section}
            isOpen={openSection === section.id}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>
    </div>
  )
}
