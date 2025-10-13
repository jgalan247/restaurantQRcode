import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { X, Plus } from 'lucide-react';

interface SplitEqualFormProps {
  onSubmit: (emails: string[]) => void;
  onBack: () => void;
}

export function SplitEqualForm({ onSubmit, onBack }: SplitEqualFormProps) {
  const [peopleCount, setPeopleCount] = useState(2);
  const [emails, setEmails] = useState<string[]>(['', '']);
  const [errors, setErrors] = useState<string[]>([]);

  const handlePeopleCountChange = (count: number) => {
    const newCount = Math.max(2, Math.min(10, count));
    setPeopleCount(newCount);

    // Adjust emails array
    if (newCount > emails.length) {
      setEmails([...emails, ...Array(newCount - emails.length).fill('')]);
    } else {
      setEmails(emails.slice(0, newCount));
    }
    setErrors([]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleRemoveEmail = (index: number) => {
    if (emails.length > 2) {
      setEmails(emails.filter((_, i) => i !== index));
      setPeopleCount(peopleCount - 1);
    }
  };

  const handleAddEmail = () => {
    if (emails.length < 10) {
      setEmails([...emails, '']);
      setPeopleCount(peopleCount + 1);
    }
  };

  const validateEmails = (): boolean => {
    const newErrors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emails.forEach((email, index) => {
      if (!email.trim()) {
        newErrors[index] = 'Email is required';
      } else if (!emailRegex.test(email)) {
        newErrors[index] = 'Invalid email format';
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmails()) {
      onSubmit(emails);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of People
        </label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handlePeopleCountChange(peopleCount - 1)}
            disabled={peopleCount <= 2}
          >
            -
          </Button>
          <span className="text-lg font-semibold w-12 text-center">{peopleCount}</span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handlePeopleCountChange(peopleCount + 1)}
            disabled={peopleCount >= 10}
          >
            +
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Email Addresses</label>
        {emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder={`Person ${index + 1} email`}
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                error={errors[index]}
              />
            </div>
            {emails.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveEmail(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
        {emails.length < 10 && (
          <button
            type="button"
            onClick={handleAddEmail}
            className="flex items-center gap-2 text-primary hover:text-primary-dark"
          >
            <Plus size={20} />
            <span>Add another person</span>
          </button>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onBack} fullWidth>
          Back
        </Button>
        <Button type="submit" fullWidth>
          Continue
        </Button>
      </div>
    </form>
  );
}
