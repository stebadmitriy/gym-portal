import { LibraryExercise, MuscleGroup } from '../types'

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // ===================== BACK WIDTH =====================
  {
    id: 'lat_pulldown',
    name_ru: 'Тяга верхнего блока',
    name_en: 'Lat Pulldown',
    muscle_group: 'back_width',
    muscle_emoji: '🦅',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DVbhSbdCPxJ/', title: 'Most Effective Lat Pulldown Variation' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVJs_ENDw47/' },
      { url: 'https://www.instagram.com/p/DVY0xyxkrNY/' },
      { url: 'https://www.instagram.com/p/DVEQGX0lesb/' },
    ],
    equipmentPhotoKey: 'lat_pulldown',
    tips_ru: 'Тяни локти вниз и к телу, думай о сжатии лопаток. Не отклоняйся назад — это нагружает поясницу, а не широчайшие. Полная амплитуда — ключ к росту.'
  },
  {
    id: 'pull_ups',
    name_ru: 'Подтягивания',
    name_en: 'Pull-Ups',
    muscle_group: 'back_width',
    muscle_emoji: '🦅',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DVXBcGoDYM-/', title: 'Pull-Up Form Check' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUBJ81wgXVA/' },
      { url: 'https://www.instagram.com/p/DT9eB_uExMS/' },
    ],
    tips_ru: 'Начинай с мёртвого виса, полностью выпрямляя руки. Тяни грудь к перекладине, контролируй опускание. Пронированный хват больше нагружает широчайшие.'
  },

  // ===================== BACK THICKNESS =====================
  {
    id: 'linear_back_row',
    name_ru: 'Горизонтальная тяга блока',
    name_en: 'Cable Row',
    muscle_group: 'back_thickness',
    muscle_emoji: '🏋️',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DVEkVcXE3G-/', title: '3 Cable Row Grips' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DU6Z1SajFu5/' },
      { url: 'https://www.instagram.com/p/DUqfde-gR6c/' },
      { url: 'https://www.instagram.com/p/DUYd135jLb9/' },
      { url: 'https://www.instagram.com/p/DUUmZBUD5M3/' },
    ],
    equipmentPhotoKey: 'linear_back_row',
    tips_ru: 'Держи спину прямой, не раскачивайся. Тяни локти к бёдрам, сжимай лопатки в конечной точке. Узкий параллельный хват сильнее активирует нижние трапеции.'
  },
  {
    id: 'pull_over',
    name_ru: 'Пуловер на блоке',
    name_en: 'Cable Pullover',
    muscle_group: 'back_thickness',
    muscle_emoji: '🏋️',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVsD18Cildf/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUdZogRDJaa/' },
      { url: 'https://www.instagram.com/p/DUgTmJ1jK7A/' },
    ],
    equipmentPhotoKey: 'pull_over',
    tips_ru: 'Держи локти слегка согнутыми, изолируй широчайшие. Не подключай бицепсы — концентрируйся на ощущении растяжения под мышками. Отлично подходит для финишной прокачки.'
  },
  {
    id: 'deadlift',
    name_ru: 'Становая тяга',
    name_en: 'Deadlift',
    muscle_group: 'back_thickness',
    muscle_emoji: '🏋️',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DVoSYCTDI8P/', title: 'How to Deadlift with Perfect Form' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVmCMK2jdrF/' },
      { url: 'https://www.instagram.com/p/DU4EWWYjnWr/' },
    ],
    tips_ru: 'Спина нейтральная, гриф близко к голени. Толкай пол от себя — не тяни. Лопатки назад и вниз. Самое мощное упражнение для общего развития силы и массы.'
  },
  {
    id: 'seated_cable_row',
    name_ru: 'Тяга нижнего блока сидя',
    name_en: 'Seated Cable Row',
    muscle_group: 'back_thickness',
    muscle_emoji: '🏋️',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DUhYaBNkRRd/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DURs7ZGmM-8/' },
      { url: 'https://www.instagram.com/p/DUIc1r_jt6r/' },
      { url: 'https://www.instagram.com/p/DTzBu7FDnEX/' },
      { url: 'https://www.instagram.com/p/DTyLUnskfLN/' },
    ],
    tips_ru: 'Сиди прямо, не округляй поясницу. Тяни рукоятку к пупку, сводя лопатки. Контролируй движение в обоих направлениях — эксцентрик так же важен.'
  },
  {
    id: 'chest_supported_row',
    name_ru: 'Тяга с упором в грудь',
    name_en: 'Chest-Supported Row',
    muscle_group: 'back_thickness',
    muscle_emoji: '🏋️',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DTxlitCCLIi/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DTvPEl6Ewxy/' },
      { url: 'https://www.instagram.com/p/DTeKDypFWTu/' },
      { url: 'https://www.instagram.com/p/DTbsxXvFKkP/' },
    ],
    tips_ru: 'Упор в грудь исключает раскачку и читинг. Полная концентрация на широчайших и ромбовидных. Идеально для тех, у кого есть проблемы с поясницей.'
  },
  {
    id: 'back_extension',
    name_ru: 'Гиперэкстензия',
    name_en: 'Back Extension',
    muscle_group: 'back_thickness',
    muscle_emoji: '🏋️',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DTNvpMkCMf3/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DTF4DeEFFzI/' },
      { url: 'https://www.instagram.com/p/DS-tQxpkTHk/' },
      { url: 'https://www.instagram.com/p/DSvdqjzEvpz/' },
      { url: 'https://www.instagram.com/p/DSsPRX8iPsI/' },
      { url: 'https://www.instagram.com/p/DR5AwcfDhJr/' },
    ],
    tips_ru: 'Нейтральная спина, контролируй движение. Можно добавить вес у груди для прогрессии. Укрепляет разгибатели спины и ягодичные.'
  },

  // ===================== TRAPS =====================
  {
    id: 'trap_shrug',
    name_ru: 'Шраги для трапеций',
    name_en: 'Trap Shrug',
    muscle_group: 'traps',
    muscle_emoji: '🦾',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVkMziMkpDs/', title: 'Are You Training Traps or Hurting Your Neck?' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DV4fXwtFJgo/', title: 'Build BIGGER Traps' },
    ],
    tips_ru: 'Поднимай плечи строго вверх — не вперёд и не по кругу. Держи шею нейтральной. Медленное опускание с паузой наверху максимизирует стимул для роста.'
  },

  // ===================== CHEST =====================
  {
    id: 'chest_press',
    name_ru: 'Жим в тренажёре',
    name_en: 'Machine Chest Press',
    muscle_group: 'chest',
    muscle_emoji: '💪',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DV1LoTSjZL2/', title: 'Stop Benching Wrong' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVq4dqWlJih/' },
      { url: 'https://www.instagram.com/p/DVnGpZXjQZz/' },
      { url: 'https://www.instagram.com/p/DVd3338ASdO/' },
      { url: 'https://www.instagram.com/p/DVTlN1AEQZH/' },
    ],
    equipmentPhotoKey: 'chest_press',
    tips_ru: 'Своди руки в конечной точке, думая о сжатии груди, а не о подъёме веса. Лопатки прижаты к спинке. Контролируй эксцентрик 3-4 секунды.'
  },
  {
    id: 'incline_pec_fly',
    name_ru: 'Сведение рук на наклонной скамье',
    name_en: 'Incline Cable Fly',
    muscle_group: 'chest',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVzPWdEid16/', title: 'Perfect Cable Chest Fly' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVObQUSEbyd/' },
      { url: 'https://www.instagram.com/p/DVLvfMAjVIo/' },
      { url: 'https://www.instagram.com/p/DVJRHIfCmFm/' },
    ],
    equipmentPhotoKey: 'incline_pec_fly',
    tips_ru: 'Слегка согнутые локти на протяжении всего движения. Растяни грудь в нижней точке — именно там происходит максимальный механический стресс. Не соединяй руки слишком сильно вверху.'
  },
  {
    id: 'cable_chest_fly',
    name_ru: 'Сведение рук в кроссовере',
    name_en: 'Cable Chest Fly',
    muscle_group: 'chest',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVGtBddle4i/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVCvM90jf-R/' },
      { url: 'https://www.instagram.com/p/DU9OYhwiiCg/' },
    ],
    tips_ru: 'Кабельная версия обеспечивает постоянное натяжение через всю амплитуду. Меняй угол блоков для акцента на верхнюю, среднюю или нижнюю грудь.'
  },
  {
    id: 'dumbbell_press',
    name_ru: 'Жим гантелей лёжа',
    name_en: 'Dumbbell Press',
    muscle_group: 'chest',
    muscle_emoji: '💪',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DU7Eagyjsur/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUsFbphFNUq/' },
      { url: 'https://www.instagram.com/p/DUn_bG3j_sc/' },
    ],
    tips_ru: 'Гантели дают большую амплитуду, чем штанга. Опускай их до уровня груди для максимального растяжения. Своди руки в верхней точке — дожимай до конца.'
  },
  {
    id: 'incline_bench_press',
    name_ru: 'Жим на наклонной скамье',
    name_en: 'Incline Bench Press',
    muscle_group: 'chest',
    muscle_emoji: '💪',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DUQntmuCYvO/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUOJeV7D8dh/' },
      { url: 'https://www.instagram.com/p/DUJb5mfjRLB/' },
      { url: 'https://www.instagram.com/p/DUHWKYwFSAY/' },
    ],
    tips_ru: 'Угол 30° оптимален для верхней грудной — больше не нужно. Хват чуть уже, чем в обычном жиме. Отличный выбор для формирования V-образного контура грудной клетки.'
  },
  {
    id: 'pec_deck',
    name_ru: 'Сведение рук в тренажёре',
    name_en: 'Pec Deck Machine',
    muscle_group: 'chest',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DUEqCY3AfmV/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DT3hNdDgm9R/' },
      { url: 'https://www.instagram.com/p/DT2h21ZCJS1/' },
      { url: 'https://www.instagram.com/p/DT0JlXeFReH/' },
      { url: 'https://www.instagram.com/p/DTnQ-2pDjoA/' },
      { url: 'https://www.instagram.com/p/DTiWpwtiOqR/' },
      { url: 'https://www.instagram.com/p/DTYJ588DMFF/' },
    ],
    tips_ru: 'Тренажёр обеспечивает постоянное натяжение и полную изоляцию груди. Задержись на 1 секунду в сжатом положении. Идеален для заключительного упражнения в грудной тренировке.'
  },

  // ===================== SHOULDERS LATERAL =====================
  {
    id: 'cable_lateral_raise',
    name_ru: 'Подъём руки в сторону на блоке',
    name_en: 'Cable Lateral Raise',
    muscle_group: 'shoulders_lateral',
    muscle_emoji: '🔱',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DV3wsCnjUq0/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVL-XDUk9cl/' },
      { url: 'https://www.instagram.com/p/DUl5OXxjFk7/' },
      { url: 'https://www.instagram.com/p/DUUEdhkFNEv/' },
    ],
    equipmentPhotoKey: 'cable_lateral_raise',
    tips_ru: 'Поднимай до параллели с полом — выше не нужно (это уже трапеции). Кабель даёт постоянное натяжение, что лучше для гипертрофии, чем гантели. Наклонись слегка в сторону для максимального растяжения.'
  },
  {
    id: 'dumbbell_lateral_raise',
    name_ru: 'Подъём гантелей в стороны',
    name_en: 'Dumbbell Lateral Raise',
    muscle_group: 'shoulders_lateral',
    muscle_emoji: '🔱',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVhbejJje7f/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVByC39E4jp/' },
      { url: 'https://www.instagram.com/p/DUrWSM5jv1_/' },
    ],
    tips_ru: 'Ставь большой палец слегка вниз (как будто выливаешь воду). Локоть немного согнут. Не раскачивайся — это читинг, который снижает нагрузку на дельты.'
  },

  // ===================== SHOULDERS FRONT =====================
  {
    id: 'shoulder_press',
    name_ru: 'Жим в тренажёре сидя',
    name_en: 'Machine Shoulder Press',
    muscle_group: 'shoulders_front',
    muscle_emoji: '🔱',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DWAUGaalCyz/', title: '5 Shoulder Exercises for 3D Growth' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DT3FnDTlNFS/' },
      { url: 'https://www.instagram.com/p/DT1BALkkx_4/' },
      { url: 'https://www.instagram.com/p/DToqx8-kijp/' },
    ],
    equipmentPhotoKey: 'shoulder_press',
    tips_ru: 'Жми вверх и слегка вперёд — не строго вертикально. Не запрокидывай голову назад. Жим над головой отлично развивает передние и средние дельты, но бокового подъёма не заменяет.'
  },

  // ===================== SHOULDERS REAR =====================
  {
    id: 'rear_delt_fly',
    name_ru: 'Тяга на задние дельты',
    name_en: 'Rear Delt Fly',
    muscle_group: 'shoulders_rear',
    muscle_emoji: '🔱',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DV6OAHpCXMc/', title: 'Rear Delt Fly Mistakes' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DTW2zmoCGTI/' },
      { url: 'https://www.instagram.com/p/DTRZh9JCbA6/' },
    ],
    equipmentPhotoKey: 'cable_lateral_raise',
    tips_ru: 'Локоть держи на уровне плеча — не ниже. Задние дельты отвечают за здоровье плечевого сустава и V-образный силуэт сзади. Часто недотренированы — уделяй им особое внимание.'
  },
  {
    id: 'cable_face_pull',
    name_ru: 'Тяга к лицу на блоке',
    name_en: 'Cable Face Pull',
    muscle_group: 'shoulders_rear',
    muscle_emoji: '🔱',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVWeLDjCWcy/', title: 'Rope Pulling Exercises' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DToqx8-kijp/' },
    ],
    equipmentPhotoKey: 'cable_face_pull',
    tips_ru: 'Тяни к лицу, разводя руки наружу в верхней точке. Это упражнение защищает вращательную манжету плеча и исправляет округлённую осанку. Делай в каждой тренировке.'
  },
  {
    id: 'upright_row',
    name_ru: 'Тяга штанги/гантелей к подбородку',
    name_en: 'Upright Row',
    muscle_group: 'shoulders_front',
    muscle_emoji: '🔱',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DUpUEFLjV-9/' },
    altVideos: [],
    tips_ru: 'Широкий хват снижает нагрузку на запястья и переносит акцент с трапеций на дельты. Не поднимай выше уровня подбородка. Контролируй опускание.'
  },

  // ===================== LEGS QUADS =====================
  {
    id: 'leg_press',
    name_ru: 'Жим ногами',
    name_en: 'Leg Press',
    muscle_group: 'legs_quads',
    muscle_emoji: '🦵',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DV4mQyviG46/', title: 'Leg Press Mistakes' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DU4fwzTib3M/' },
      { url: 'https://www.instagram.com/p/DURKralEtu9/' },
    ],
    equipmentPhotoKey: 'leg_press',
    tips_ru: 'Ставь ступни выше для акцента на ягодичные, ниже — на квадрицепсы. Колени не своди внутрь. Безопаснее становой тяги при проблемах со спиной.'
  },
  {
    id: 'leg_extension',
    name_ru: 'Разгибание ног в тренажёре',
    name_en: 'Leg Extension',
    muscle_group: 'legs_quads',
    muscle_emoji: '🦵',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVwHpWuDGnw/', title: 'Leg Extensions' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVRNkSQCb6f/' },
      { url: 'https://www.instagram.com/p/DVObP1sisL6/' },
    ],
    equipmentPhotoKey: 'leg_extension',
    tips_ru: 'Полная амплитуда с задержкой 1-2 сек наверху. Носки можно направить внутрь для акцента на внешнюю головку. Исследования показывают, что разгибание ног безопасно для здоровых коленей.'
  },
  {
    id: 'barbell_squat',
    name_ru: 'Приседания со штангой',
    name_en: 'Barbell Squat',
    muscle_group: 'legs_quads',
    muscle_emoji: '🦵',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DV_IXcCAkWT/', title: '5 Barbell Squats' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUWzspwDenA/' },
      { url: 'https://www.instagram.com/p/DTQUiITFDN_/' },
      { url: 'https://www.instagram.com/p/DUL56ORDloI/' },
    ],
    tips_ru: 'Колени в направлении пальцев, грудь вверх, поясница нейтральная. Глубина ниже параллели усиливает нагрузку на ягодичные. Одно из лучших упражнений для общего развития ног.'
  },
  {
    id: 'hack_squat',
    name_ru: 'Гак-приседания',
    name_en: 'Hack Squat',
    muscle_group: 'legs_quads',
    muscle_emoji: '🦵',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DWF5eUPjTWA/', title: 'Build Quads Glutes Inner Thighs with Hack Squats' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUL56ORDloI/' },
      { url: 'https://www.instagram.com/p/DUGfpGSFfaL/' },
      { url: 'https://www.instagram.com/p/DT678XiFS-9/' },
    ],
    tips_ru: 'Ставь ступни выше на платформе для акцента на ягодичные и отведения. Позволяет безопасно работать с большими весами. Отличная замена штанге при дискомфорте в спине.'
  },
  {
    id: 'sumo_squat',
    name_ru: 'Приседания сумо / смит-машина',
    name_en: 'Sumo Squat / Smith Machine',
    muscle_group: 'legs_quads',
    muscle_emoji: '🦵',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DUyOSZciGnx/', title: 'Stop Doing Smith Machine Squats Wrong' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DT_-B07CZed/' },
    ],
    tips_ru: 'Широкая постановка ног усиливает нагрузку на внутреннюю поверхность бедра и ягодичные. Смит-машина позволяет сместить центр тяжести и глубже уйти в приседание.'
  },

  // ===================== LEGS HAMSTRINGS =====================
  {
    id: 'seated_leg_curl',
    name_ru: 'Сгибание ног сидя',
    name_en: 'Seated Leg Curl',
    muscle_group: 'legs_hamstrings',
    muscle_emoji: '🦵',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DU2CBoyipBB/', title: 'Stop Doing Every Leg Curl the Same' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUwZgIflPrm/' },
      { url: 'https://www.instagram.com/p/DUbConNAVk7/' },
    ],
    equipmentPhotoKey: 'seated_leg_curl',
    tips_ru: 'Сидячая версия растягивает бицепс бедра в начале — это максимизирует гипертрофию. Согни 90°+ с задержкой 1 сек. Носки в нейтральном положении или слегка направлены к себе.'
  },
  {
    id: 'ham_curl',
    name_ru: 'Сгибание ног лёжа',
    name_en: 'Lying Leg Curl',
    muscle_group: 'legs_hamstrings',
    muscle_emoji: '🦵',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DUwZgIflPrm/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DU2CBoyipBB/' },
    ],
    equipmentPhotoKey: 'ham_curl',
    tips_ru: 'Лёжа или сидя — выбирай по ощущению. Принципиальная разница — в положении таза. В лёжачем положении тазобедренный сустав разогнут, что меняет паттерн активации бицепса бедра.'
  },
  {
    id: 'romanian_deadlift',
    name_ru: 'Румынская тяга',
    name_en: 'Romanian Deadlift',
    muscle_group: 'legs_hamstrings',
    muscle_emoji: '🦵',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DTq7RaCCMey/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DS1LOpfiv9R/' },
    ],
    tips_ru: 'Наклон до растяжения в задней поверхности бедра — не глубже. Спина прямая, гриф скользит вдоль ног. Наилучший выбор для изолированной прокачки бицепса бедра с растяжкой.'
  },

  // ===================== GLUTES =====================
  {
    id: 'hip_thrust',
    name_ru: 'Ягодичный мостик на скамье',
    name_en: 'Hip Thrust',
    muscle_group: 'glutes',
    muscle_emoji: '🍑',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DWEuqFXiBrk/', title: 'Glutes training' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DV1Lvt2D0vq/' },
      { url: 'https://www.instagram.com/p/DVY01e-gU4u/' },
    ],
    equipmentPhotoKey: 'hip_thrust',
    tips_ru: 'Сожми ягодицы в верхней точке с полным разгибанием бедра. Не переразгибай поясницу — движение должно быть в тазу. Исследования @brettcontreras показывают, что это упражнение №1 для ягодичных.'
  },
  {
    id: 'bulgarian_split_squat',
    name_ru: 'Болгарские приседания',
    name_en: 'Bulgarian Split Squat',
    muscle_group: 'glutes',
    muscle_emoji: '🍑',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DVwi66liOve/', title: 'Bulgarian Split Squat' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVeTnK8kqOm/' },
      { url: 'https://www.instagram.com/p/DVXV0qniHrC/' },
    ],
    tips_ru: 'Передняя нога дальше — больше ягодичных, ближе — больше квадрицепсов. Опускайся до касания коленом пола. Одно из лучших упражнений для асимметрии и ягодичных.'
  },
  {
    id: 'cable_glute_kickback',
    name_ru: 'Отведение ноги назад на блоке',
    name_en: 'Cable Glute Kickback',
    muscle_group: 'glutes',
    muscle_emoji: '🍑',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DU_NQH5jzD0/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUFFO3wlYAc/' },
      { url: 'https://www.instagram.com/p/DT_ApqZDwFD/' },
      { url: 'https://www.instagram.com/p/DU8lcbOjGEh/' },
    ],
    tips_ru: 'Разгибай бедро — не поясницу. В верхней точке сожми ягодичные на 1-2 сек. Хорошее упражнение для дополнительного объёма ягодичных без нагрузки на позвоночник.'
  },
  {
    id: 'glute_bridge',
    name_ru: 'Ягодичный мостик',
    name_en: 'Glute Bridge',
    muscle_group: 'glutes',
    muscle_emoji: '🍑',
    is_compound: true,
    primaryVideo: { url: 'https://www.instagram.com/p/DT1rhqJj8ZA/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DTqZMvSEqyD/' },
      { url: 'https://www.instagram.com/p/DTImeq3ggBO/' },
    ],
    tips_ru: 'Более доступная версия hip thrust. Пятки близко к ягодицам, выталкивай бёдра вверх, сжимая ягодичные. Подходит для отработки техники перед переходом к hip thrust со штангой.'
  },

  // ===================== BICEPS =====================
  {
    id: 'biceps_curl',
    name_ru: 'Сгибание рук со штангой/гантелями',
    name_en: 'Biceps Curl',
    muscle_group: 'biceps',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVoSXnnCVQd/', title: 'Biceps Not Growing?' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVjPOfeCG7p/' },
      { url: 'https://www.instagram.com/p/DVSR6FVgWd8/' },
    ],
    equipmentPhotoKey: 'biceps_curl',
    tips_ru: 'Не раскачивайся. Полная амплитуда: полное разгибание внизу и полное сгибание вверх. Супинируй запястье в верхней точке для максимальной активации короткой головки. 3 сек вниз.'
  },
  {
    id: 'concentration_curl',
    name_ru: 'Концентрированное сгибание',
    name_en: 'Concentration Curl',
    muscle_group: 'biceps',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DU0o3WbkzTA/', title: 'Stop Doing Concentration Curls Wrong' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUtgGmLj47K/' },
      { url: 'https://www.instagram.com/p/DUmmKWJlE1G/' },
    ],
    tips_ru: 'Лучшее упражнение для пика бицепса по данным ACE. Локоть зафиксирован на внутренней поверхности бедра — это устраняет читинг. Супинируй в верхней точке.'
  },
  {
    id: 'hammer_curl',
    name_ru: 'Молотковое сгибание',
    name_en: 'Hammer Curl',
    muscle_group: 'biceps',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DUKSnojDn7R/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DT5jN3eE6SX/' },
      { url: 'https://www.instagram.com/p/DU6Z3_vDKWs/' },
    ],
    tips_ru: 'Нейтральный хват активирует плечелучевую мышцу и длинную головку бицепса — добавляет толщину руке. Отлично работает в суперсете с обычными сгибаниями.'
  },

  // ===================== TRICEPS =====================
  {
    id: 'triceps_pushdown',
    name_ru: 'Разгибание рук на блоке',
    name_en: 'Triceps Pushdown',
    muscle_group: 'triceps',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DV16kaxDeQ1/', title: 'Triceps Pushdowns Done Right' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUuPCeqjOJg/' },
      { url: 'https://www.instagram.com/p/DULWjLqArmS/' },
    ],
    tips_ru: 'Локти зафиксированы у тела. Полное разгибание с 1 сек паузой внизу. V-гриф даёт нейтральный хват и снижает нагрузку на запястья. Трицепс = 2/3 объёма руки.'
  },
  {
    id: 'skull_crushers',
    name_ru: 'Французский жим лёжа',
    name_en: 'Skull Crushers',
    muscle_group: 'triceps',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DU-_FiCFexR/', title: 'Stop Doing Lying Triceps Extensions Wrong' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUCMt3LFddH/' },
      { url: 'https://www.instagram.com/p/DTVz8Npjg2u/' },
    ],
    tips_ru: 'Опускай гриф за голову для максимального растяжения длинной головки трицепса. Это увеличивает механическое напряжение и мышечный рост. Локти направлены вперёд, не в стороны.'
  },
  {
    id: 'overhead_triceps',
    name_ru: 'Разгибание рук над головой',
    name_en: 'Overhead Triceps Extension',
    muscle_group: 'triceps',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVpdud0kXp4/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVgr2krjgNJ/' },
      { url: 'https://www.instagram.com/p/DUCMt3LFddH/' },
    ],
    tips_ru: 'Разгибание над головой растягивает длинную головку трицепса — это максимизирует гипертрофию. Держи локти неподвижно. Кабельная версия сохраняет натяжение в растянутом положении.'
  },
  {
    id: 'triceps_kickback',
    name_ru: 'Отведение руки назад с гантелью',
    name_en: 'Triceps Kickback',
    muscle_group: 'triceps',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVKV7KQGCB8/', title: 'Stop Doing Triceps Kickbacks Wrong' },
    altVideos: [],
    tips_ru: 'Плечо параллельно полу — иначе гравитация почти не нагружает трицепс. Полное разгибание с задержкой 1 сек. Лучше работает с лёгкими весами и правильной техникой.'
  },

  // ===================== ABS =====================
  {
    id: 'abdominal_crunch',
    name_ru: 'Скручивания в тренажёре',
    name_en: 'Abdominal Crunch Machine',
    muscle_group: 'abs',
    muscle_emoji: '🔥',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVChZI9lDHZ/', title: 'Kneeling Cable Crunches' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DVmCQdvAeHP/' },
      { url: 'https://www.instagram.com/p/DVH4mRcFVb_/' },
    ],
    equipmentPhotoKey: 'abdominal_crunch',
    tips_ru: 'Округляй поясницу — именно это активирует прямую мышцу живота. Не тяни руками, движение только корпусом. Медленно контролируй возврат. Тренируй пресс как любую другую мышцу — с прогрессией веса.'
  },
  {
    id: 'cable_crunch',
    name_ru: 'Скручивания на блоке стоя на коленях',
    name_en: 'Kneeling Cable Crunch',
    muscle_group: 'abs',
    muscle_emoji: '🔥',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DUzRyr8lK0A/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUpAGGgk-93/' },
      { url: 'https://www.instagram.com/p/DUgvK1Vj_On/' },
      { url: 'https://www.instagram.com/p/DUZ2ni9F9iT/' },
    ],
    tips_ru: 'Кабельная версия позволяет прогрессировать с весом — это ключ к росту пресса. Тяни локти к бёдрам, полностью скругляя спину. Держи бёдра неподвижными.'
  },
  {
    id: 'leg_raise',
    name_ru: 'Подъём ног в висе',
    name_en: 'Hanging Leg Raise',
    muscle_group: 'abs',
    muscle_emoji: '🔥',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DUM9e-VjIgx/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUBqpFglID0/' },
      { url: 'https://www.instagram.com/p/DT54PEIlKNP/' },
    ],
    tips_ru: 'Не раскачивайся — контролируй движение. Поднимай до параллели с полом, со временем — выше. Лучшее упражнение для нижней части пресса и сгибателей бедра.'
  },
  {
    id: 'ab_rollout',
    name_ru: 'Ролик для пресса',
    name_en: 'Ab Rollout',
    muscle_group: 'abs',
    muscle_emoji: '🔥',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DTlxpXslKSw/' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DTa3k6FDPAo/' },
      { url: 'https://www.instagram.com/p/DSq85DDFBQq/' },
    ],
    tips_ru: 'Одно из лучших упражнений для пресса по данным ЭМГ. Держи поясницу нейтральной — не прогибайся. Начинай с укороченной амплитудой и постепенно увеличивай.'
  },

  // ===================== FOREARMS =====================
  {
    id: 'forearm_curl',
    name_ru: 'Сгибание запястий / предплечья',
    name_en: 'Forearm Curl',
    muscle_group: 'forearms',
    muscle_emoji: '💪',
    is_compound: false,
    primaryVideo: { url: 'https://www.instagram.com/p/DVAfCgDCiXZ/', title: 'Want Stronger Arms? Train Your Forearms Too' },
    altVideos: [
      { url: 'https://www.instagram.com/p/DUtEQ83j3RV/' },
      { url: 'https://www.instagram.com/p/DUZpOeEDKNO/' },
    ],
    tips_ru: 'Сгибание и разгибание запястий, обратные сгибания. Сильные предплечья улучшают хват и косвенно усиливают все тяговые упражнения. Не игнорируй эту группу.'
  },
]

export function getLibraryExerciseById(id: string): LibraryExercise | undefined {
  return EXERCISE_LIBRARY.find(ex => ex.id === id)
}

export function getLibraryExercisesByMuscleGroup(group: MuscleGroup): LibraryExercise[] {
  return EXERCISE_LIBRARY.filter(ex => ex.muscle_group === group)
}

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  back_width: 'Широчайшие',
  back_thickness: 'Спина (толщина)',
  chest: 'Грудь',
  shoulders_lateral: 'Боковые дельты',
  shoulders_front: 'Передние дельты',
  shoulders_rear: 'Задние дельты',
  legs_quads: 'Квадрицепсы',
  legs_hamstrings: 'Бицепс бедра',
  glutes: 'Ягодичные',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  abs: 'Пресс',
  traps: 'Трапеции',
  forearms: 'Предплечья',
}

export const MUSCLE_GROUP_EMOJI: Record<string, string> = {
  back_width: '🦅',
  back_thickness: '🏋️',
  chest: '💪',
  shoulders_lateral: '🔱',
  shoulders_front: '🔱',
  shoulders_rear: '🔱',
  legs_quads: '🦵',
  legs_hamstrings: '🦵',
  glutes: '🍑',
  biceps: '💪',
  triceps: '💪',
  abs: '🔥',
  traps: '🦾',
  forearms: '💪',
}

// V-taper muscle group priority targets (sets per week)
export const VTAPER_TARGETS: Record<string, { label: string; target: number; priority: 'high' | 'medium' | 'low' }> = {
  back_width: { label: 'Широчайшие', target: 16, priority: 'high' },
  shoulders_lateral: { label: 'Боковые дельты', target: 14, priority: 'high' },
  glutes: { label: 'Ягодичные', target: 12, priority: 'high' },
  chest: { label: 'Грудь', target: 12, priority: 'medium' },
  back_thickness: { label: 'Спина (толщина)', target: 12, priority: 'medium' },
  shoulders_rear: { label: 'Задние дельты', target: 10, priority: 'medium' },
  legs_quads: { label: 'Квадрицепсы', target: 10, priority: 'medium' },
  legs_hamstrings: { label: 'Бицепс бедра', target: 8, priority: 'low' },
  biceps: { label: 'Бицепс', target: 8, priority: 'low' },
  triceps: { label: 'Трицепс', target: 8, priority: 'low' },
  abs: { label: 'Пресс', target: 6, priority: 'low' },
  traps: { label: 'Трапеции', target: 4, priority: 'low' },
}

/**
 * Returns the recommended video URL for an exercise based on the current training block.
 * Videos rotate every 4 weeks: block 0 (weeks 1-4) = primaryVideo,
 * block 1 (weeks 5-8) = altVideos[0], block 2 (weeks 9-12) = altVideos[1], etc.
 */
export function getVideoForBlock(exercise: LibraryExercise, totalWeek: number): { url: string; title?: string; variantIndex: number; totalVariants: number } {
  const allVideos = [exercise.primaryVideo, ...exercise.altVideos]
  const blockIndex = Math.floor((totalWeek - 1) / 4)
  const variantIndex = blockIndex % allVideos.length
  return {
    ...allVideos[variantIndex],
    variantIndex,
    totalVariants: allVideos.length,
  }
}

/**
 * Returns the video URL to use, respecting user's localStorage override.
 * localStorage key: `gymPrime_primaryVideo_${exerciseId}`
 */
export function getActiveVideoUrl(
  exercise: LibraryExercise,
  totalWeek: number
): { url: string; title?: string; variantIndex: number; totalVariants: number; isPinned: boolean } {
  const pinned = typeof window !== 'undefined'
    ? localStorage.getItem(`gymPrime_primaryVideo_${exercise.id}`)
    : null

  if (pinned) {
    const allVideos = [exercise.primaryVideo, ...exercise.altVideos]
    const idx = allVideos.findIndex(v => v.url === pinned)
    return {
      url: pinned,
      variantIndex: idx >= 0 ? idx : 0,
      totalVariants: allVideos.length,
      isPinned: true,
    }
  }

  return { ...getVideoForBlock(exercise, totalWeek), isPinned: false }
}

/**
 * Pin a video as primary for an exercise (saves to localStorage).
 */
export function pinVideo(exerciseId: string, url: string): void {
  localStorage.setItem(`gymPrime_primaryVideo_${exerciseId}`, url)
}

/**
 * Remove pinned video for an exercise (back to algorithmic rotation).
 */
export function unpinVideo(exerciseId: string): void {
  localStorage.removeItem(`gymPrime_primaryVideo_${exerciseId}`)
}

/**
 * Get week range label for a block index.
 * E.g. blockIndex=0 → "Нед. 1–4", blockIndex=1 → "Нед. 5–8"
 */
export function getBlockWeekLabel(blockIndex: number): string {
  const start = blockIndex * 4 + 1
  const end = start + 3
  return `Нед. ${start}–${end}`
}
