/**
 * Programul saptamanal al academiei, transcris din calendarul oficial.
 *
 * Este tinut ca date statice in frontend, nu in baza de date: se schimba de
 * cateva ori pe an, il vede fiecare vizitator, si nu are rost sa genereze o
 * interogare la fiecare incarcare de pagina. Modificarea se face aici.
 */

export interface ClassSlot {
  /** Ora de start, in format 24h, folosita si pentru sortare. */
  time: string;
  /** Cheia de traducere a numelui activitatii. */
  key: string;
  /** Numele afisat (identic in ambele limbi - sunt denumiri proprii). */
  label: string;
}

export interface ScheduleDay {
  /** Cheia zilei pentru i18n. */
  key: string;
  /** 1 = luni ... 7 = duminica. */
  index: number;
  slots: ClassSlot[];
}

const slot = (time: string, key: string, label: string): ClassSlot => ({ time, key, label });

export const SCHEDULE: ScheduleDay[] = [
  {
    key: 'monday',
    index: 1,
    slots: [
      slot('16:45', 'dance', 'Dansuri'),
      slot('17:45', 'dance', 'Dansuri'),
      slot('18:45', 'kickKids', 'Kick Box Copii'),
      slot('19:45', 'kickAdults', 'Kick Box Adulti'),
      slot('20:45', 'salvy', 'Salvy Fight Club')
    ]
  },
  {
    key: 'tuesday',
    index: 2,
    slots: [
      slot('15:00', 'workshop', 'Atelier Creatie'),
      slot('17:00', 'karate5', 'Karate 5 ani'),
      slot('18:00', 'karate5plus', 'Karate 5 ani+'),
      slot('19:00', 'mma', 'MMA'),
      slot('20:00', 'aerobic', 'Aerobic')
    ]
  },
  {
    key: 'wednesday',
    index: 3,
    slots: [
      slot('16:45', 'dance', 'Dansuri'),
      slot('17:45', 'dance', 'Dansuri'),
      slot('18:45', 'kickKids', 'Kick Box Copii'),
      slot('19:45', 'kickAdults', 'Kick Box Adulti'),
      slot('20:45', 'salvy', 'Salvy Fight Club')
    ]
  },
  {
    key: 'thursday',
    index: 4,
    slots: [
      slot('17:00', 'karate5', 'Karate 5 ani'),
      slot('18:00', 'karate5plus', 'Karate 5 ani+'),
      slot('19:00', 'mma', 'MMA'),
      slot('20:00', 'aerobic', 'Aerobic')
    ]
  },
  {
    key: 'friday',
    index: 5,
    slots: [
      slot('16:00', 'workshop', 'Atelier Creatie'),
      slot('17:45', 'salvy', 'Salvy Fight Club'),
      slot('18:45', 'kickKids', 'Kick Box Copii'),
      slot('19:45', 'kickAdults', 'Kick Box Adulti'),
      slot('20:45', 'aerobic', 'Aerobic')
    ]
  },
  {
    key: 'saturday',
    index: 6,
    slots: [
      slot('12:30', 'karate', 'Karate'),
      slot('13:30', 'mma', 'MMA'),
      slot('17:45', 'salvy', 'Salvy Fight Club')
    ]
  },
  {
    key: 'sunday',
    index: 7,
    slots: []
  }
];

/** Ziua de azi in aceeasi numerotare ca `ScheduleDay.index` (luni = 1). */
export function todayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}
