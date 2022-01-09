import { ChangeEvent, FC, Fragment, useState } from "react";
import styles from "./DayPicker.module.css";
import { Session, Sessions } from "../lib/models";

interface AvailableDay {
  label: string;
  day: number;
}

const availableDays: readonly AvailableDay[] = [
  { label: "Mon", day: 1 },
  { label: "Tue", day: 2 },
  { label: "Wed", day: 3 },
  { label: "Thu", day: 4 },
  { label: "Fri", day: 5 },
];

const dayParts: readonly string[] = ["AM", "PM"];

const DayPicker: FC<{ onChange: (sessions: readonly Session[]) => void }> = ({
  onChange,
}) => {
  const [sessions, setSessions] = useState<Sessions>([]);

  const updateSessions =
    (session: Session) =>
    (event: ChangeEvent): void => {
      const target = event.target as HTMLInputElement;
      let sessionsUpdated: Sessions;
      if (target.checked) {
        sessionsUpdated = [...sessions, session];
      } else {
        sessionsUpdated = sessions.filter(({ key }) => key !== session.key);
      }
      setSessions(sessionsUpdated);
      onChange(sessionsUpdated);
    };

  return (
    <div>
      <div className={styles.choices}>
        <span>&nbsp;</span>
        {availableDays.map(({ day, label }) => (
          <span key={day}>{label}</span>
        ))}

        {dayParts.map((part) => {
          return (
            <Fragment key={part}>
              <span>{part}</span>
              {availableDays.map(({ day, label }) => (
                <span key={`${day}-${part}`}>
                  <input
                    type="checkbox"
                    onChange={updateSessions({
                      key: `${label} ${part}`,
                      day,
                    })}
                  />
                </span>
              ))}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DayPicker;
