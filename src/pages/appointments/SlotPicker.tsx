import { useEffect, useState } from 'react';
import { appointmentAPI, type Slot } from '../../services/appointmentAPI';
import { getErrorMessage } from '../../services/apiResponse';

interface SlotPickerProps {
  doctorId: string;
  date: string;
  value: string;
  onChange: (time: string) => void;
}

/** Live slot grid for one doctor and day; booked or blocked slots can't be picked. */
export default function SlotPicker({ doctorId, date, value, onChange }: SlotPickerProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }
    setLoading(true);
    setError('');
    appointmentAPI
      .availability(doctorId, date, date)
      // A day off comes back as a single "ALL_DAY" blocked slot.
      .then((result) => setSlots(result.filter((s) => s.time !== 'ALL_DAY')))
      .catch((e: unknown) => setError(getErrorMessage(e, 'Failed to load availability')))
      .finally(() => setLoading(false));
  }, [doctorId, date]);

  if (!doctorId || !date) return <p className="text-sm text-gray-400">Choose a doctor and date to see open slots.</p>;
  if (loading) return <p className="text-sm text-gray-400">Loading slots...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (slots.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        The doctor has no working hours on this day (or is on leave). Set hours under Doctor Schedule.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {slots.map((slot) => {
        const open = slot.status === 'available';
        const selected = value === slot.time;
        return (
          <button
            key={slot.time}
            type="button"
            disabled={!open}
            onClick={() => onChange(slot.time)}
            className={`rounded-xl border px-2 py-2 text-sm font-medium transition ${
              selected
                ? 'border-blue-600 bg-blue-600 text-white'
                : open
                  ? 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  : 'cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400 line-through'
            }`}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
