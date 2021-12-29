interface BaseEvent {
  title: string;
  notes: string;
  bunting: boolean;
}

export interface Event extends BaseEvent {
  date: Date;
}

export interface Country<E = Event> {
  division: string;
  events: readonly E[];
}

export type Countries<E = Event> = readonly Country<E>[];

export interface RawEvent extends BaseEvent {
  date: string;
}

export interface Session {
  key: string;
  day: number;
}

export type Sessions = readonly Session[];
