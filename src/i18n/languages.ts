export type LocaleOption = {
  code: string; // i18n locale code
  labelKey: string; // translation key for the display name
  flag?: string; // optional emoji flag or icon class for small UI
};

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', labelKey: 'english', flag: '🇺🇸' },
  { code: 'zh-TW', labelKey: 'chinese_zh_tw', flag: '🇹🇼' },
  { code: 'es', labelKey: 'spanish', flag: '🇪🇸' },
  { code: 'fr', labelKey: 'french', flag: '🇫🇷' },
  { code: 'ja', labelKey: 'japanese', flag: '🇯🇵' },
  { code: 'ko', labelKey: 'korean', flag: '🇰🇷' },
  { code: 'zh-CN', labelKey: 'chinese_zh_cn', flag: '🇨🇳' },
  { code: 'id', labelKey: 'indonesian', flag: '🇮🇩' },
  { code: 'th', labelKey: 'thai', flag: '🇹🇭' },
  { code: 'ms', labelKey: 'malay', flag: '🇲🇾' },
];

export default SUPPORTED_LOCALES;
