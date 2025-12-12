import React from 'react';
import { useTranslation } from 'react-i18next';
import BarChartCard from '../BarChartCard/BarChartCard';

type Props = {
  data?: number[]; // 7 numbers, one per day (minutes)
  labels?: string[];
};

const ActivityWeeklyCard: React.FC<Props> = ({ data, labels }) => {
  const { t } = useTranslation();

  return (
    <BarChartCard
      title={t('weekly_activity')}
      data={data}
      labels={labels}
      unitLabel={t('minutes')}
      color="orange"
    />
  );
};

export default ActivityWeeklyCard;
