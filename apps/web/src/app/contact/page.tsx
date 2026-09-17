import type { Metadata } from 'next';

import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact — LinkedOut',
  description: 'Questions, feedback, or something not working? Send the LinkedOut team a message.',
};

export default function ContactPage() {
  return <ContactForm />;
}
