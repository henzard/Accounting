// Timezone options for SearchableSelect
// Common world timezones grouped by region

import { SelectOption } from '@/shared/types';

export const TIMEZONE_OPTIONS: SelectOption[] = [
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', subtitle: 'Egypt (UTC+2)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', subtitle: 'South Africa (UTC+2)' },
  { value: 'Africa/Lagos', label: 'Lagos', subtitle: 'Nigeria (UTC+1)' },
  { value: 'Africa/Nairobi', label: 'Nairobi', subtitle: 'Kenya (UTC+3)' },
  
  // Americas
  { value: 'America/New_York', label: 'New York (EST)', subtitle: 'US Eastern (UTC-5/-4)' },
  { value: 'America/Chicago', label: 'Chicago (CST)', subtitle: 'US Central (UTC-6/-5)' },
  { value: 'America/Denver', label: 'Denver (MST)', subtitle: 'US Mountain (UTC-7/-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', subtitle: 'US Pacific (UTC-8/-7)' },
  { value: 'America/Toronto', label: 'Toronto', subtitle: 'Canada Eastern (UTC-5/-4)' },
  { value: 'America/Vancouver', label: 'Vancouver', subtitle: 'Canada Pacific (UTC-8/-7)' },
  { value: 'America/Mexico_City', label: 'Mexico City', subtitle: 'Mexico (UTC-6/-5)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', subtitle: 'Brazil (UTC-3)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', subtitle: 'Argentina (UTC-3)' },
  { value: 'America/Santiago', label: 'Santiago', subtitle: 'Chile (UTC-4/-3)' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai', subtitle: 'UAE (UTC+4)' },
  { value: 'Asia/Karachi', label: 'Karachi', subtitle: 'Pakistan (UTC+5)' },
  { value: 'Asia/Kolkata', label: 'Kolkata', subtitle: 'India (UTC+5:30)' },
  { value: 'Asia/Dhaka', label: 'Dhaka', subtitle: 'Bangladesh (UTC+6)' },
  { value: 'Asia/Bangkok', label: 'Bangkok', subtitle: 'Thailand (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Singapore', subtitle: 'Singapore (UTC+8)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', subtitle: 'Hong Kong (UTC+8)' },
  { value: 'Asia/Shanghai', label: 'Shanghai', subtitle: 'China (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo', subtitle: 'Japan (UTC+9)' },
  { value: 'Asia/Seoul', label: 'Seoul', subtitle: 'South Korea (UTC+9)' },
  { value: 'Asia/Manila', label: 'Manila', subtitle: 'Philippines (UTC+8)' },
  { value: 'Asia/Jakarta', label: 'Jakarta', subtitle: 'Indonesia (UTC+7)' },
  
  // Europe
  { value: 'Europe/London', label: 'London', subtitle: 'UK (UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris', subtitle: 'France (UTC+1/+2)' },
  { value: 'Europe/Berlin', label: 'Berlin', subtitle: 'Germany (UTC+1/+2)' },
  { value: 'Europe/Madrid', label: 'Madrid', subtitle: 'Spain (UTC+1/+2)' },
  { value: 'Europe/Rome', label: 'Rome', subtitle: 'Italy (UTC+1/+2)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', subtitle: 'Netherlands (UTC+1/+2)' },
  { value: 'Europe/Brussels', label: 'Brussels', subtitle: 'Belgium (UTC+1/+2)' },
  { value: 'Europe/Vienna', label: 'Vienna', subtitle: 'Austria (UTC+1/+2)' },
  { value: 'Europe/Stockholm', label: 'Stockholm', subtitle: 'Sweden (UTC+1/+2)' },
  { value: 'Europe/Warsaw', label: 'Warsaw', subtitle: 'Poland (UTC+1/+2)' },
  { value: 'Europe/Athens', label: 'Athens', subtitle: 'Greece (UTC+2/+3)' },
  { value: 'Europe/Istanbul', label: 'Istanbul', subtitle: 'Turkey (UTC+3)' },
  { value: 'Europe/Moscow', label: 'Moscow', subtitle: 'Russia (UTC+3)' },
  
  // Pacific
  { value: 'Australia/Sydney', label: 'Sydney', subtitle: 'Australia Eastern (UTC+10/+11)' },
  { value: 'Australia/Melbourne', label: 'Melbourne', subtitle: 'Australia Eastern (UTC+10/+11)' },
  { value: 'Australia/Perth', label: 'Perth', subtitle: 'Australia Western (UTC+8)' },
  { value: 'Pacific/Auckland', label: 'Auckland', subtitle: 'New Zealand (UTC+12/+13)' },
  
  // UTC
  { value: 'UTC', label: 'UTC', subtitle: 'Coordinated Universal Time' },
];

