import React from 'react';
import { Grid, Stack, Text } from '@mantine/core';
import InfoCard from '../../components/InfoCard/InfoCard';

const OverviewPage = () => {
  // Overview shows a quick set of cards; data should be provided by higher-level store or fetched.
  return (
    <Stack gap="md">

          <InfoCard title="Water (weekly)"  subtitle="Weekly average" icon={<span>💧</span>} >
            <Text>{`1200 ml`}</Text>
          </InfoCard>

          <InfoCard title="Sleep (avg)"  subtitle="Last 7 days" icon={<span>😴</span>} />

          <InfoCard title="Activity"  subtitle="This week" icon={<span>🏃</span>} />

    </Stack>
  );
}

export default OverviewPage;
