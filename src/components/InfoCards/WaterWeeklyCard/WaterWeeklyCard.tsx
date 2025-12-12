import React from 'react';
import { useTranslation } from 'react-i18next';
import BarChartCard from '../BarChartCard/BarChartCard';
import { InfoCardProps } from '../InfoCard';

type Props = Omit<InfoCardProps, 'children' | 'title'> & {
  data?: number[];
  labels?: string[];
};

const WaterWeeklyCard: React.FC<Props> = ({ data, labels, ...infoCardProps }) => {
  const { t } = useTranslation();

  return (
    <BarChartCard
      title={t('weekly_water')}
      data={data}
      labels={labels}
      unitLabel={t('milliliters')}
      color="blue"
      {...infoCardProps}
    />
  );
};

export default WaterWeeklyCard;
