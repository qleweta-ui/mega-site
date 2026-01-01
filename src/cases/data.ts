import type { CaseFile } from '../core/state';

export const CASE_FILES: CaseFile[] = [
  {
    id: 'A-2197',
    date: '2026-10-13',
    classification: 'Alpha',
    risk: 2,
    pages: [
      'Серый конверт доставлен без отметок. Текст выползает из строк при наведении, как будто избегает чтения.',
      'Указано: отправитель не найден. Внутри карта метро, станции перепутаны после решения без УФ-проверки.'
    ],
    anomalies: ['M1', 'M5', 'M6'],
    photoNote: 'Фото лопнувшей лампы: пятно ползёт вправо, если долго смотреть.',
    needsUV: true,
    signatureHint: 'Подпись проявляется если потереть правый нижний угол страницы 1.',
    resolution: null,
    requiresClip: true,
    misdirection: 'После утверждения без УФ классификация меняется на Gamma.'
  },
  {
    id: 'H-4410',
    date: '2026-08-02',
    classification: 'Beta',
    risk: 3,
    pages: [
      'Доклад о дрожащих дверях. Печать уходит влево при попытке поставить прямо.',
      'Риск повышен при неправильной зоне штампа. УФ показывает скрытый «Карантин».'
    ],
    anomalies: ['M2', 'M6'],
    photoNote: 'Фотография дрожащей ручки: пятно дышит при наведении.',
    needsUV: true,
    signatureHint: 'Стереть область подписи под печатью.',
    resolution: null,
    requiresClip: false
  },
  {
    id: 'S-1990',
    date: '2026-07-19',
    classification: 'Gamma',
    risk: 5,
    pages: [
      'Комиссия просит уничтожить объект, но поля меняются после решения без лампы.',
      'Пятно расползается пока смотрите; фиксируется скрепкой.'
    ],
    anomalies: ['M4', 'M5', 'M6'],
    photoNote: 'Силуэт существа, верхняя часть дымится.',
    needsUV: true,
    signatureHint: 'Надпись появляется после трения слева от фото.',
    resolution: null,
    requiresClip: true,
    misdirection: 'Без УФ поле риска снижено ошибочно.'
  },
  {
    id: 'Q-8842',
    date: '2026-06-09',
    classification: 'Alpha',
    risk: 1,
    pages: [
      'Список должностей, но при наведении буквы скользят. Простая проверка лампой обнажает новый ID.',
      'Печать притягивается к запрещённой зоне (левый верх).'
    ],
    anomalies: ['M1', 'M2', 'M6'],
    photoNote: 'Фото пустого стола. Под лампой виден дополнительный штрих.',
    needsUV: true,
    signatureHint: 'Подпись прячется под скрепкой.',
    resolution: null,
    requiresClip: true
  },
  {
    id: 'K-7701',
    date: '2026-05-03',
    classification: 'Beta',
    risk: 3,
    pages: [
      'В отчёте о шорохах есть ложное поле: решение сменится если не просканировать.',
      'Пятно под фотографией медленно ползёт вправо.'
    ],
    anomalies: ['M4', 'M5', 'M6'],
    photoNote: 'Обрывок карты с чёрным пятном.',
    needsUV: true,
    signatureHint: 'Трите область даты.',
    resolution: null,
    requiresClip: false,
    misdirection: 'Поле классификации станет Alpha без лампы.'
  },
  {
    id: 'Z-1030',
    date: '2026-04-14',
    classification: 'Gamma',
    risk: 4,
    pages: [
      'Справка о тишине. Текст дрейфует, скрывая слово «упадок».',
      'Печать тяжёлая, магнитится к красным границам.'
    ],
    anomalies: ['M1', 'M2'],
    photoNote: 'Фото пустого коридора. Пятно дрожит.',
    needsUV: false,
    signatureHint: 'Подпись спрятана по центру под бархатом.',
    resolution: null,
    requiresClip: false
  },
  {
    id: 'B-5566',
    date: '2026-03-22',
    classification: 'Beta',
    risk: 2,
    pages: [
      'Отчёт о бумагах, которые шумят сами. UV открывает скрытый водяной знак с вердиктом.',
      'Пятно распухает, если держать курсор.'
    ],
    anomalies: ['M4', 'M6'],
    photoNote: 'Смятая бумага с пульсом.',
    needsUV: true,
    signatureHint: 'Подпись в правом поле страницы 2.',
    resolution: null,
    requiresClip: false
  },
  {
    id: 'R-3012',
    date: '2026-02-10',
    classification: 'Alpha',
    risk: 1,
    pages: [
      'Досье о тихом кабинете. Текст пытается уйти, но реагирует на лампу.',
      'Печать требует точного попадания, иначе фон растёт.'
    ],
    anomalies: ['M1', 'M2', 'M6'],
    photoNote: 'Рукоятка шредера, на фото проявляется второй слой.',
    needsUV: true,
    signatureHint: 'Серебристый штрих открывается после трения.',
    resolution: null,
    requiresClip: false
  }
];
