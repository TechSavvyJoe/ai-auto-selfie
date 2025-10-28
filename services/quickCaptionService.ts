/**
 * Quick Caption Service
 * Generates instant, dealership-focused captions without network calls.
 * Used as an optimistic caption while AI generates a richer one.
 */

const greetings = [
  'Congratulations',
  'Huge congrats',
  'Big congrats',
  'Welcome to the family',
  'Another happy delivery',
  'Keys delivered',
];

const closers = [
  'Enjoy every mile!',
  'Drive safe and enjoy!',
  'Here’s to new adventures!',
  'Miles of smiles ahead!',
  'We’re thrilled for you!',
];

const emojis = ['🚗✨', '🎉🚘', '🔥🚙', '💯🔑', '😊🚗', '⭐️🚗'];

const hashtagSets = [
  ['NewCarDay', 'CustomerDelivery', 'DealershipFamily'],
  ['CarDelivery', 'HappyCustomer', 'DriveHappy'],
  ['NewRide', 'DreamCar', 'KeysDay'],
  ['JustDelivered', 'NewWheels', 'CarLove'],
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getQuickDealershipCaption = (): string => {
  const g = pick(greetings);
  const c = pick(closers);
  const e = pick(emojis);
  const tags = pick(hashtagSets).map(t => `#${t}`).join(' ');
  // Keep ~16-22 words typical
  return `${g}! ${c} ${e} ${tags}`;
};

export type QuickPhraseTheme = 'luxury' | 'dynamic' | 'family' | 'modern';

export const getQuickOverlayPhrase = (theme: QuickPhraseTheme): string => {
  switch (theme) {
    case 'luxury':
      return 'Luxury Unlocked';
    case 'dynamic':
      return 'Adventure Begins';
    case 'family':
      return 'Memories in Motion';
    case 'modern':
    default:
      return 'Future Forward';
  }
};
