import React from 'react';
import BarChartCard from '../BarChartCard/BarChartCard';
import { InfoCardProps } from '../InfoCard';
import { useTranslation } from 'react-i18next';

type Props = Omit<InfoCardProps, 'children' | 'title'> & {
  data?: number[];
  labels?: string[];
};

const SleepWeeklyCard: React.FC<Props> = ({ data, labels, ...infoCardProps }) => {
  const { t } = useTranslation();

  return (
    <BarChartCard title={t('weekly_sleep')} data={data} labels={labels} unitLabel={t('hours')} {...infoCardProps} />
  );
};

export default SleepWeeklyCard;
