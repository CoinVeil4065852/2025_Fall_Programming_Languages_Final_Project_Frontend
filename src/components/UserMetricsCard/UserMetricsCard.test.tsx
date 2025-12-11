import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '../../../test-utils';
import UserMetricsCard from './UserMetricsCard';

describe('UserMetricsCard', () => {
  it('displays BMI with one decimal place when provided', () => {
    const profile = {
      id: '1',
      name: 'Alice',
      age: 30,
      weightKg: 60,
      heightM: 1.65,
      gender: 'female',
    };
    const { getByText } = render(<UserMetricsCard profile={profile as any} bmi={23.456} />);
    // 23.456 should be rounded to 23.5
    expect(getByText('23.5')).toBeDefined();
  });

  it('displays BMI with one decimal place for integers (e.g., 20 -> 20.0)', () => {
    const profile = {
      id: '2',
      name: 'Bob',
      age: 25,
      weightKg: 75,
      heightM: 1.8,
      gender: 'male',
    };
    const { getByText } = render(<UserMetricsCard profile={profile as any} bmi={20} />);
    expect(getByText('20.0')).toBeDefined();
  });
});
