import { getDatabase } from './db';
import { DemoContact } from '../types';

export const getDemoContacts = (): DemoContact[] => {
  const db = getDatabase();
  const rows = db.getAllSync<{
    id: string;
    name: string;
    phone_number: string;
    demo_upi_id: string;
    avatar_color: string;
  }>('SELECT * FROM demo_contacts ORDER BY name ASC');

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phoneNumber: r.phone_number,
    demoUpiId: r.demo_upi_id,
    avatarColor: r.avatar_color,
  }));
};
